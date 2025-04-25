import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  BalanceChangeType,
  EntityType,
  Log,
  LogSeverity,
  MerchantStatus,
  Prisma,
  PrismaService,
  RoleName,
} from "@ezpg/database";
import { CreateMerchantDto } from "./dto/create-merchant.dto";
import { UpdateMerchantDto } from "./dto/update-merchant.dto";
import { UpdateMerchantStatusDto } from "./dto/update-merchant-status.dto";
import { AdminMerchantsQueryDto } from "./dto/merchant-query.dto";
import { Decimal } from "@prisma/client/runtime/library";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";
import { LoggingService } from "../../core/logging/logging.service";
import { LogAction } from "../../core/logging/log-action.enum";
import { PaginatedResponse } from "../../common/dto/paginated-response.dto";
import { MerchantBalanceLogEntryDto } from "./dto/merchant-balance-log-entry.dto";
import { MerchantBalanceLogDetailsDto } from "./dto/merchant-balance-log-details.dto";
import { MerchantBalanceLogQueryDto } from "../logs/dto/log-query.dto";
import { DownloadService } from "../../core/download/download.service";
import { IdGeneratorService } from "../../core/id-generator/id-generator.service";
import { v4 as uuidv4 } from "uuid";
import { MerchantDetailResponseDto } from "./dto/merchant-response.dto";
import { CreateMerchantResponseDto } from "./dto/create-merchant-response.dto";
import { AdminUsersService } from "../users/admin-users.service";
import { AdminAdminsService } from "../admins/admin-admins.service";
import { EncryptionService } from "../../core/encryption/encryption.service";
import { TfaService } from "../../core/tfa/tfa.service";
import * as bcrypt from "bcrypt";
import { UserResponseDto } from "../../auth/dto/user-response.dto";

/**
 * TODO: Implement Reusable PrismaService Methods
 *
 * This service would benefit from implementing these reusable methods in PrismaService:
 *
 * 1. softDelete(model: string, id: string|number) - For soft deletion with deleted_at
 * 2. restore(model: string, id: string|number) - For restoring soft-deleted records
 * 3. addSoftDeleteFilter(where: any, model: string, includeDeleted: boolean) - For query filtering
 * 4. getStandardInclude(model: string, customIncludes?: any) - For standardized relation loading
 *
 * Once implemented, update this service to use those methods consistently.
 */

/**
 * TODO: ID Type Integration
 *
 * The schema has been updated to use string IDs for user_id, merchant_id, and agent_id, making them
 * all share the same ID value and directly reference each other. However, the current JwtUser interface
 * and many system components still expect numeric IDs.
 *
 * For full implementation, the following needs to be changed:
 * 1. Update JwtUser interface to use string userId instead of number
 * 2. Update all JWT payload interfaces to use string userIds
 * 3. Update all services to handle string IDs (particularly Auth service)
 * 4. Convert adminUser.userId to string in all query conditions
 * 5. Fix type errors in services comparing string and number IDs
 *
 * For now, we've updated only the merchant creation process to use string IDs properly,
 * with a string-to-number conversion for compatibility with existing code.
 * Other parts of the code will need similar updates to fully implement the schema change.
 */

/**
 * Service for handling merchant-related operations for admin users
 * Manages creating, reading, updating and soft-deleting merchants
 * Handles merchant balance logs and ensures proper authorization
 */
@Injectable()
export class AdminMerchantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggingService,
    private readonly usersService: AdminUsersService,
    private readonly downloadService: DownloadService,
    private readonly idGeneratorService: IdGeneratorService,
    private readonly adminService: AdminAdminsService,
    private readonly encryptionService: EncryptionService,
    private readonly tfaService: TfaService,
  ) {}

  /**
   * Create a new merchant
   *
   * @param createMerchantDto - The DTO containing the create data
   * @param adminUser - The current admin performing the creation
   * @returns The created merchant response with TFA and API details
   */
  async create(
    createMerchantDto: CreateMerchantDto,
    adminUser: JwtUser,
  ): Promise<CreateMerchantResponseDto> {
    const { username, groupId, ...otherFields } = createMerchantDto;

    // Generate merchant ID
    const merchantId = await this.generateMerchantId();

    // Verify group exists and admin has permission
    const group = await this.getAndVerifyGroup(groupId, adminUser);

    // Generate a random password for the merchant
    const password = Math.random().toString(36).slice(-8);
    const passwordHash = await this.hashPassword(password);

    // Generate TFA secret
    const tfaSecret = await this.tfaService.generateSecret(username);
    const encryptedSecret = tfaSecret?.secret
      ? this.encryptionService.encrypt(tfaSecret.secret)
      : null;

    // Get merchant user role
    const role = await this.prisma.role.findUnique({
      where: { role_name: RoleName.MERCHANT },
    });
    if (!role) {
      throw new InternalServerErrorException("Merchant role not found");
    }

    // Transaction block
    try {
      let createdMerchant;

      await this.prisma.$transaction(
        async (tx) => {
          // Create user first
          const user = await tx.user.create({
            data: {
              user_id: merchantId,
              username,
              password_hash: passwordHash,
              role_id: role.role_id,
              first_login: true,
              is_active: true,
              tfa_secret: encryptedSecret,
            },
          });

          // Then create merchant with unchecked data to avoid relation issues
          createdMerchant = await tx.merchant.create({
            data: {
              merchant_id: merchantId,
              company_name: otherFields.companyName,
              telegram_id: otherFields.telegramId,
              status: MerchantStatus.ACTIVE,
              group_id: groupId, // Use direct ID instead of relations
              created_by: adminUser.userId, // Use direct ID instead of relations
              virtual_accounts_limit: otherFields.virtualAccountsLimit,
              balance: 0,
              max_withdrawal_per_transaction:
                otherFields.maxWithdrawalPerTransaction,
              max_daily_withdrawal: otherFields.maxDailyWithdrawal,
              api_key: uuidv4(),
              affiliate: otherFields.affiliate,
              foreign_currency_fee_rate:
                otherFields.foreignCurrencyFeeRate || 0,
              settlement_fee_rate: otherFields.settlementFeeRate || 0,
              settlement_fee: otherFields.settlementFee || 0,
              foreign_bank_name: otherFields.foreignBankName,
              foreign_bank_account_number: otherFields.foreignBankAccountNumber,
              foreign_bank_account_holder: otherFields.foreignBankAccountHolder,
              merchant_account_number: otherFields.primaryBankAccountNumber,
            } as Prisma.MerchantUncheckedCreateInput,
          });

          // Create merchant fee
          await tx.merchantFee.create({
            data: {
              merchant_id: merchantId,
              deposit_fee_rate: otherFields.depositFeeRate,
              deposit_fee: otherFields.depositFee || 0,
              remittance_fee_rate: otherFields.remittanceFeeRate,
              remittance_fee: otherFields.remittanceFee || 0,
              foreign_remittance_fee_rate:
                otherFields.foreignCurrencyRemittanceFeeRate,
              reserve_rate: otherFields.reserveRate,
              updated_by: adminUser.userId,
            },
          });

          // Create merchant wallet
          await tx.merchantWallet.create({
            data: {
              merchant_id: merchantId,
              deposit_amount: 0,
              available_remittance_amount: 0,
              reserve_amount: otherFields.reserveAmount || 0,
              updated_by: adminUser.userId,
            },
          });

          // Create merchant transaction info
          await tx.merchantTransactionInfo.create({
            data: {
              merchant_id: merchantId,
              merchant_bank_code: otherFields.primaryBankCode,
              merchant_account_number: otherFields.primaryBankAccountNumber,
              settlement_type: "0", // Default value
              deposit_van_id: "0", // Default value
              remittance_van_id: "0", // Default value
              max_limit_amount: 1000000, // Default 1M KRW max limit
              updated_by: adminUser.userId,
            },
          });

          // Create virtual accounts if needed
          if (otherFields.virtualAccountsLimit > 0) {
            // Virtual account creation logic here
          }

          // Create agent distribution if provided
          if (otherFields.agents?.length) {
            await Promise.all(
              otherFields.agents.map((agent) =>
                tx.agent.create({
                  data: {
                    agent_id: agent.agentId,
                    agent_name: agent.agentId, // Use agent ID as name for now
                    merchant_id: merchantId,
                    distribution_rate: agent.distributionRate,
                    mid: merchantId, // Use merchant ID as MID
                    created_by: adminUser.userId,
                  },
                }),
              ),
            );
          }
        },
        {
          timeout: 10000,
        },
      );

      // Get merchant details
      const merchantDetail = await this.findMerchantDetailById(
        merchantId,
        adminUser,
      );

      // Get user data
      const userData = await this.prisma.user.findUnique({
        where: { user_id: merchantId },
        include: { role: true },
      });

      // Return the created merchant with TFA and API details
      return {
        message: "Merchant created successfully",
        merchant: merchantDetail,
        user: this.mapToUserResponseDto(userData),
        tfaSetupUrl: tfaSecret?.otpAuthUrl,
        tfaQrCodeBase64: tfaSecret?.qrCodeBase64,
        apiKey: createdMerchant.api_key,
      };
    } catch (error) {
      // Handle specific error cases
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException("Username already exists");
      }
      throw error;
    }
  }

  /**
   * Generate a unique merchant ID
   * @returns A unique merchant ID
   */
  private async generateMerchantId(): Promise<string> {
    return this.idGeneratorService.generateUniqueMerchantId();
  }

  /**
   * Get and verify that a merchant group exists and the admin has permission to use it
   * @param groupId The group ID to verify
   * @param adminUser The admin user performing the operation
   * @returns The merchant group if found and authorized
   */
  private async getAndVerifyGroup(groupId: number, adminUser: JwtUser) {
    const group = await this.prisma.merchantGroup.findUnique({
      where: { group_id: groupId },
    });

    if (!group) {
      throw new NotFoundException(
        `Merchant group with ID ${groupId} not found`,
      );
    }

    // Check if admin is authorized to use this group
    const isSuperAdmin = await this.adminService.isSuperAdmin(adminUser.userId);
    if (!isSuperAdmin && group.created_by !== adminUser.userId) {
      throw new ForbiddenException(
        `You are not authorized to create merchants in group ${groupId}`,
      );
    }

    return group;
  }

  /**
   * Hash a password using bcrypt
   * @param password The plain text password to hash
   * @returns The hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Find a merchant by ID with all details
   * @param merchantId The merchant ID to find
   * @param adminUser The admin user performing the query
   * @returns Detailed merchant data
   */
  async findMerchantDetailById(
    merchantId: string,
    adminUser: JwtUser,
  ): Promise<MerchantDetailResponseDto> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { merchant_id: merchantId },
      include: this.getMerchantIncludeConfig(),
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${merchantId} not found`);
    }

    // Authorization check
    const isSuperAdmin = await this.adminService.isSuperAdmin(adminUser.userId);
    if (!isSuperAdmin && merchant.created_by !== adminUser.userId) {
      throw new ForbiddenException(
        `You are not authorized to view merchant ${merchantId}`,
      );
    }

    // Fetch transaction summaries and map to response DTO
    const txSummaryMap = await this.fetchMerchantTransactionData([merchant]);
    const [mappedMerchant] = await this.enrichAndMapMerchants(
      [merchant],
      txSummaryMap,
    );

    return mappedMerchant;
  }

  /**
   * Map a user to a response DTO
   * @param user The user to map
   * @returns Mapped user response
   */
  private mapToUserResponseDto(user: any): any {
    return {
      userId: user.user_id,
      username: user.username,
      isActive: user.is_active,
      firstLogin: user.first_login,
      tfaEnabled: !!user.tfa_secret,
      roleName: user.role?.role_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
    };
  }

  /**
   * Get all merchants for an admin with complete details
   *
   * @param query - The query parameters for the merchants
   * @param adminId - The current admin requesting the merchants
   * @param viewAsAdminId - For superadmin: view merchants as if they were this admin
   * @returns Paginated response of merchants with complete details
   */
  async findAll(
    query: AdminMerchantsQueryDto,
    adminId: string,
    viewAsAdminId?: string,
  ): Promise<PaginatedResponse<MerchantDetailResponseDto>> {
    const { page = 1, limit = 10, includeDeleted = false } = query;

    // Determine which admin's merchants to show
    const effectiveAdminId = viewAsAdminId || adminId;

    // Use the query builder to get the where condition
    const where = this.buildMerchantQueryFilter(
      query,
      effectiveAdminId,
      includeDeleted,
    );

    // First, get the count for pagination info
    const total = await this.prisma.merchant.count({ where });

    // Get merchant data with all related tables
    const merchants = await this.prisma.merchant.findMany({
      where,
      include: this.getMerchantIncludeConfig(),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    });

    // Get transaction summaries for all merchants using the helper method
    const txSummaryMap = await this.fetchMerchantTransactionData(merchants);

    // Map merchant data to DTOs with enriched data
    const merchantDtos = await this.enrichAndMapMerchants(
      merchants,
      txSummaryMap,
      (page - 1) * limit,
    );

    return this.formatPaginatedResponse(
      merchantDtos,
      this.buildPaginationMeta(total, page, limit),
    );
  }

  /**
   * Get a merchant by ID
   *
   * @param merchantId - The unique ID of the merchant to get
   * @param user - The current admin performing the request
   * @param viewAsAdminId - For superadmin: view another admin's merchant
   * @returns The merchant details
   */
  async findOne(
    merchantId: string,
    user: JwtUser,
    viewAsAdminId?: string,
  ): Promise<MerchantDetailResponseDto> {
    // Fetch merchant with all related entities
    const merchant = await this.prisma.merchant.findUnique({
      where: { merchant_id: merchantId },
      include: this.getMerchantIncludeConfig(),
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${merchantId} not found.`);
    }

    // Authorization Check - allow access if:
    // 1. User is superadmin
    // 2. User is the creator of the merchant OR user is the admin whose view the superadmin is using
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
    const isCreator = merchant.created_by === user.userId.toString(); // User ID is already string
    const isViewingAsDifferentAdmin =
      viewAsAdminId && viewAsAdminId === merchant.created_by;

    if (!isSuperAdmin && !isCreator && !isViewingAsDifferentAdmin) {
      throw new ForbiddenException("You do not have access to this merchant.");
    }

    // Use the same transaction data helper as the list methods
    const txSummaryMap = await this.fetchMerchantTransactionData([merchant]);

    // Use shared helper to map and enrich - this returns an array but we only want the first element
    const merchantDtos = await this.enrichAndMapMerchants(
      [merchant],
      txSummaryMap,
    );

    return merchantDtos[0];
  }

  /**
   * Update a merchant
   *
   * @param merchantId - The unique ID of the merchant to update
   * @param updateMerchantDto - The DTO containing the update data
   * @param user - The current admin performing the update
   * @returns The updated merchant
   */
  async update(
    merchantId: string,
    updateMerchantDto: UpdateMerchantDto,
    user: JwtUser,
  ): Promise<MerchantDetailResponseDto> {
    const { ...updateData } = updateMerchantDto;

    // Use transaction for consistency, especially if updating related User
    return this.prisma.$transaction(async (tx) => {
      // Fetch merchant WITH creator info for auth check
      const merchant = await tx.merchant.findFirst({
        where: { merchant_id: merchantId },
        include: {
          user: true,
          agents: true,
        },
      });

      if (!merchant || merchant.deleted_at !== null) {
        throw new NotFoundException(
          `Merchant with ID ${merchantId} not found or has been deleted.`,
        );
      }

      // Authorization Check - allow access if:
      // 1. User is superadmin
      // 2. User is the creator of the merchant
      const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
      const isCreator = merchant.created_by === user.userId.toString(); // User ID is already string

      if (!isSuperAdmin && !isCreator) {
        throw new ForbiddenException(
          "You are not authorized to update this merchant.",
        );
      }

      // Prepare data with the correct Prisma property names
      const prismaUpdateData: Prisma.MerchantUpdateInput = {};

      // Prepare MerchantFee update data
      const merchantFeeUpdateData: any = {};
      let shouldUpdateMerchantFee = false;

      if (updateData.affiliate !== undefined) {
        prismaUpdateData.affiliate = updateData.affiliate;
      }

      if (updateData.groupId !== undefined) {
        if (updateData.groupId) {
          prismaUpdateData.group = {
            connect: { group_id: updateData.groupId },
          };
        } else {
          // If groupId is null/0, we need to find a default group or throw an error
          // since the group relation is required
          throw new BadRequestException(
            "Group ID cannot be null - merchant must belong to a group",
          );
        }
      }

      if (updateData.depositFeeRate !== undefined) {
        merchantFeeUpdateData.deposit_fee_rate = new Decimal(
          updateData.depositFeeRate,
        );
        shouldUpdateMerchantFee = true;
      }

      if (updateData.remittanceFeeRate !== undefined) {
        merchantFeeUpdateData.remittance_fee_rate = new Decimal(
          updateData.remittanceFeeRate,
        );
        shouldUpdateMerchantFee = true;
      }

      if (updateData.reserveRate !== undefined) {
        merchantFeeUpdateData.reserve_rate = new Decimal(
          updateData.reserveRate,
        );
        shouldUpdateMerchantFee = true;
      }

      if (updateData.foreignCurrencyFeeRate !== undefined) {
        merchantFeeUpdateData.foreign_remittance_fee_rate = new Decimal(
          updateData.foreignCurrencyFeeRate,
        );
        shouldUpdateMerchantFee = true;
      }

      // Check if we need to make any updates
      if (
        Object.keys(prismaUpdateData).length === 0 &&
        !shouldUpdateMerchantFee
      ) {
        throw new BadRequestException("No valid fields provided for update.");
      }

      // Update the merchant record if needed
      let updatedMerchant;
      if (Object.keys(prismaUpdateData).length > 0) {
        updatedMerchant = await tx.merchant.update({
          where: { merchant_id: merchantId },
          data: prismaUpdateData,
          include: this.getMerchantIncludeConfig(),
        });
      } else {
        updatedMerchant = await tx.merchant.findUnique({
          where: { merchant_id: merchantId },
          include: this.getMerchantIncludeConfig(),
        });
      }

      // Update merchant fee separately if needed
      if (shouldUpdateMerchantFee) {
        await tx.merchantFee.update({
          where: { merchant_id: merchantId },
          data: merchantFeeUpdateData,
        });
      }

      // Log the update action using logUserAction - use the actual admin who made the change
      await this.logger.logUserAction(
        user, // Pass the full JwtUser object
        LogAction.MERCHANT_UPDATE,
        LogSeverity.INFO,
        EntityType.MERCHANT,
        updatedMerchant.merchant_id,
        {
          updatedFields: Object.keys(updateMerchantDto),
          merchantId: merchantId, // Include external ID for reference
        },
      );

      // Fetch transaction data to match other endpoints
      const txSummaryMap = await this.fetchMerchantTransactionData([
        updatedMerchant,
      ]);

      // Use the same enrichAndMapMerchants helper for consistency
      const merchantDtos = await this.enrichAndMapMerchants(
        [updatedMerchant],
        txSummaryMap,
      );

      return merchantDtos[0];
    });
  }

  /**
   * Delete a merchant
   *
   * @param merchantId - The unique ID of the merchant to delete
   * @param user - The current admin performing the deletion
   * @returns void
   */
  async remove(merchantId: string, user: JwtUser): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Fetch merchant WITH creator info for auth check
      const merchant = await tx.merchant.findUnique({
        where: { merchant_id: merchantId },
        select: {
          merchant_id: true,
          created_by: true,
          user: {
            select: {
              user_id: true,
            },
          },
          deleted_at: true,
        },
      });

      if (!merchant || merchant.deleted_at !== null) {
        // Allow deleting already deleted? Or throw error? Let's throw NotFound for now.
        throw new NotFoundException(
          `Merchant with ID ${merchantId} not found or already deleted.`,
        );
      }

      // Authorization Check - allow access if:
      // 1. User is superadmin
      // 2. User is the creator of the merchant
      const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
      const isCreator = merchant.created_by === user.userId.toString(); // User ID is already string

      if (!isSuperAdmin && !isCreator) {
        throw new ForbiddenException(
          "You are not authorized to delete this merchant.",
        );
      }

      // Use PrismaService's reusable softDelete method instead of direct update
      await this.prisma.softDelete("merchant", merchant.merchant_id);

      // Optionally deactivate associated user
      if (merchant.user?.user_id) {
        await tx.user.update({
          where: { user_id: merchant.user.user_id },
          data: { is_active: false }, // Deactivate user
        });
      }
      // Optionally delete/deactivate related Agents? Depends on requirements.

      // Log the delete action using logUserAction - use the actual admin who made the change
      await this.logger.logUserAction(
        user, // Pass the full JwtUser object
        LogAction.MERCHANT_DELETE,
        LogSeverity.WARNING, // Use WARNING for deletions
        EntityType.MERCHANT,
        merchant.merchant_id,
        { merchantId: merchantId }, // Include external ID
      );
    });
  }

  /**
   * Get deleted merchants
   *
   * @param query - The query parameters for the merchants
   * @param adminId - The current admin requesting the merchants
   * @param viewAsAdminId - For superadmin: view merchants as if they were this admin
   * @returns Paginated response of deleted merchants
   */
  async findAllDeleted(
    query: AdminMerchantsQueryDto,
    adminId: string,
    viewAsAdminId?: string, // Changed from number to string
  ): Promise<PaginatedResponse<MerchantDetailResponseDto>> {
    const { page = 1, limit = 10 } = query;

    // Determine which admin's merchants to show
    const effectiveAdminId = viewAsAdminId || adminId;

    // Use the query builder but force deleted_at to be not null
    const baseWhere = this.buildMerchantQueryFilter(query, effectiveAdminId);

    // Override the deleted_at property to ensure we only get deleted merchants
    const where: Prisma.MerchantWhereInput = {
      ...baseWhere,
      deleted_at: { not: null },
    };

    // First, get the count for pagination info
    const total = await this.prisma.merchant.count({ where });

    // Get merchant data with all related tables - same as findAll
    const merchants = await this.prisma.merchant.findMany({
      where,
      include: this.getMerchantIncludeConfig(),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    });

    // Get transaction summaries for all merchants using the helper method
    const txSummaryMap = await this.fetchMerchantTransactionData(merchants);

    // Map merchant data to DTOs with enriched data
    const merchantDtos = await this.enrichAndMapMerchants(
      merchants,
      txSummaryMap,
      (page - 1) * limit,
    );

    return this.formatPaginatedResponse(
      merchantDtos,
      this.buildPaginationMeta(total, page, limit),
    );
  }

  /**
   * Get balance logs for a merchant
   *
   * @param query - The query parameters for the logs
   * @param adminId - The current admin requesting the logs
   * @param viewAsAdminId - For superadmin: view logs as if they were this admin
   * @returns Paginated response of balance logs
   */
  async getBalanceLogs(
    query: MerchantBalanceLogQueryDto,
    adminId?: string, // Changed from number? to string?
    viewAsAdminId?: string, // Changed from number? to string?
  ): Promise<PaginatedResponse<MerchantBalanceLogEntryDto>> {
    // Extract pagination and filter values from query
    const page = query.page || 1;
    const limit = query.limit || 50; // Default to 50 per screenshot
    const skip = query.skip || (page - 1) * limit;

    // Build where condition
    const where: Prisma.LogWhereInput = {
      target_entity_type: EntityType.MERCHANT,
      action: {
        in: [
          LogAction.MERCHANT_BALANCE_DEPOSIT,
          LogAction.MERCHANT_BALANCE_WITHDRAW,
          LogAction.MERCHANT_BALANCE_ADJUST,
          LogAction.MERCHANT_FEE_SETTLEMENT,
        ],
      },
    };

    // If a specific merchantId is provided, add it to the where condition
    if (query.merchantId && query.merchantId !== "all") {
      // Find the merchant by its ID
      const merchant = await this.prisma.merchant.findUnique({
        where: { merchant_id: query.merchantId },
        select: { merchant_id: true },
      });

      if (merchant) {
        where.target_entity_id = merchant.merchant_id;
      } else {
        // Return empty result if merchant not found
        return this.formatPaginatedResponse(
          [],
          this.buildPaginationMeta(0, query.page || 1, query.limit || 10),
        );
      }
    }

    // Determine which admin's merchants to show
    const effectiveAdminId = viewAsAdminId || adminId;

    // Handle admin_id to limit to merchants created by this admin
    if (effectiveAdminId) {
      // Get all merchants created by this admin
      const merchants = await this.prisma.merchant.findMany({
        where: { created_by: effectiveAdminId.toString() }, // Use as string
        select: { merchant_id: true },
      });

      if (merchants.length === 0) {
        // No merchants found, return empty result
        return this.formatPaginatedResponse(
          [],
          this.buildPaginationMeta(0, query.page || 1, query.limit || 10),
        );
      }

      // Get logs for all these merchants
      where.target_entity_id = {
        in: merchants.map((m) => m.merchant_id),
      };
    }

    // Apply end date filter only (as specified)
    if (query.endDate) {
      where.created_at = {
        lte: new Date(`${query.endDate}T23:59:59.999Z`),
      };
    }

    // Apply affiliate filter if specified
    if (query.sortBy === "affiliate" && query.sortOrder) {
      where.details = {
        path: ["affiliate"],
        equals: query.sortOrder,
      };
    }

    // Determine order by based on sortBy
    let orderBy: Prisma.LogOrderByWithRelationInput;
    if (query.sortBy === "affiliate" && !query.sortOrder) {
      // When sortBy is affiliate but no specific affiliate is provided,
      // sort by the affiliate field using a raw SQL expression since JsonPath is not directly supported in type
      orderBy = {
        details: {
          // @ts-ignore - JsonPath sorting is not fully typed in Prisma client
          path: ["affiliate"],
          order: "asc",
        },
      };
    } else {
      // Default or explicit created_at sorting
      const direction =
        query.sortBy === "createdAt" && query.sortOrder?.toLowerCase() === "asc"
          ? "asc"
          : "desc";
      orderBy = { created_at: direction };
    }

    // Query for total count
    const totalItems = await this.prisma.log.count({ where });

    // Query logs with pagination
    const logs = await this.prisma.log.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    // Get merchant IDs from logs to fetch affiliate names
    const merchantInternalIds = logs
      .map((log) => log.target_entity_id)
      .filter((id, index, array) => array.indexOf(id) === index); // Get unique IDs

    // Fetch merchant data for these IDs
    const merchants = await this.prisma.merchant.findMany({
      where: {
        merchant_id: { in: merchantInternalIds },
      },
      select: {
        merchant_id: true,
        affiliate: true,
      },
    });

    // Create a lookup map for merchants
    const merchantMap = new Map();
    merchants.forEach((m) => {
      merchantMap.set(m.merchant_id, {
        merchantId: m.merchant_id,
        affiliate: m.affiliate,
      });
    });

    // Convert logs to MerchantBalanceLogEntryDto format
    const data = logs.map((log, idx) => {
      // Parse details from the JSON field with proper type casting
      const parsedDetails = log.details as unknown as Record<string, unknown>;

      // Create a properly typed details object with defaults for all properties
      const details: MerchantBalanceLogDetailsDto = {
        merchant_id: (parsedDetails?.merchant_id as string) || "",
        affiliate: (parsedDetails?.affiliate as string) || "",
        amount: (parsedDetails?.amount as string) || "0",
        previous_balance: (parsedDetails?.previous_balance as string) || "0",
        new_balance: (parsedDetails?.new_balance as string) || "0",
        type:
          (parsedDetails?.type as BalanceChangeType) ||
          BalanceChangeType.ADJUSTMENT_ADD,
        reason: (parsedDetails?.reason as string) || "",
        related_transaction_id:
          (parsedDetails?.related_transaction_id as string) || undefined,
      };

      // Get merchant info from our map
      const merchantInfo = merchantMap.get(log.target_entity_id) || {};

      // Calculate the change amount value
      const changeAmount =
        typeof details.amount === "string" ? parseFloat(details.amount) : 0;

      // Calculate the after change amount value
      const amountAfterChange =
        typeof details.new_balance === "string"
          ? parseFloat(details.new_balance)
          : 0;

      // Get the merchant ID
      const merchantId = merchantInfo.merchantId || details.merchant_id || "";

      return {
        number: skip + idx + 1,
        date: log.created_at,
        affiliate: details.affiliate || merchantInfo.affiliate || "",
        detail: details.reason || log.action,
        changeAmount,
        amountAfterChange,
        type: log.action as BalanceChangeType,
        merchantId,
      };
    });

    // Return paginated response
    return this.formatPaginatedResponse(
      data,
      this.buildPaginationMeta(totalItems, query.page || 1, query.limit || 10),
    );
  }

  /**
   * Restores a soft-deleted merchant
   *
   * @param merchantId - The merchant ID to restore
   * @param user - The current admin performing the restoration
   * @returns The restored merchant
   */
  async restoreMerchant(
    merchantId: string,
    user: JwtUser,
  ): Promise<MerchantDetailResponseDto> {
    await this.prisma.$transaction(async (tx) => {
      // Fetch merchant to verify it's deleted
      const merchant = await tx.merchant.findUnique({
        where: { merchant_id: merchantId },
        select: {
          merchant_id: true,
          created_by: true,
          deleted_at: true,
          user: {
            select: {
              user_id: true,
            },
          },
        },
      });

      if (!merchant) {
        throw new NotFoundException(
          `Merchant with ID ${merchantId} not found.`,
        );
      }

      if (merchant.deleted_at === null) {
        throw new BadRequestException(
          `Merchant with ID ${merchantId} is not deleted.`,
        );
      }

      // Authorization Check - allow access if:
      // 1. User is superadmin
      // 2. User is the creator of the merchant
      const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
      const isCreator = merchant.created_by === user.userId.toString();

      if (!isSuperAdmin && !isCreator) {
        throw new ForbiddenException(
          "You are not authorized to restore this merchant.",
        );
      }

      // Use PrismaService's reusable restore method instead of direct update
      await this.prisma.restore("merchant", merchant.merchant_id);

      // Reactivate the associated user if present
      if (merchant.user?.user_id) {
        await tx.user.update({
          where: { user_id: merchant.user.user_id },
          data: { is_active: true },
        });
      }
    });

    // Return the restored merchant with full details
    return this.findOne(merchantId, user);
  }

  /**
   * Exports merchants data to Excel format
   *
   * @param query - Query parameters for filtering
   * @param user - The authenticated admin user
   * @param viewAsAdminId - Optional admin ID to view merchants as (SuperAdmin only)
   * @returns Object with URL to download the Excel file
   */
  async exportMerchantsToExcel(
    query: AdminMerchantsQueryDto,
    user: JwtUser,
    viewAsAdminId?: string, // Changed from number? to string?
  ): Promise<{ url: string }> {
    // For superadmin, allow viewing as another admin
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
    const effectiveAdminId =
      isSuperAdmin && viewAsAdminId ? viewAsAdminId : user.userId.toString();

    // Remove pagination for export
    const { page, limit, ...filters } = query;

    // Get all merchants matching the filter (increase limit for export)
    const merchantsData = await this.findAll(
      {
        ...filters,
        page: 1,
        limit: 1000, // Set a larger limit for export
      } as AdminMerchantsQueryDto,
      effectiveAdminId,
      isSuperAdmin && viewAsAdminId ? viewAsAdminId : undefined,
    );

    // Transform data for Excel export - match exactly what's shown on the UI
    const excelData = merchantsData.data.map((merchant, index) => {
      // Extract agent distribution rates (up to 5)
      const agentRates = Array.isArray(merchant.agents) ? merchant.agents : [];
      const agent1 = agentRates.length > 0 ? agentRates[0] : 0;
      const agent2 = agentRates.length > 1 ? agentRates[1] : 0;
      const agent3 = agentRates.length > 2 ? agentRates[2] : 0;
      const agent4 = agentRates.length > 3 ? agentRates[3] : 0;
      const agent5 = agentRates.length > 4 ? agentRates[4] : 0;

      return {
        number: index + 1, // 번호
        groupName: merchant.groupName || "", // 가맹점그룹
        affiliate: merchant.affiliate || "", // 가맹점
        companyName: merchant.companyName || "", // 업체명
        numberOfMembers: merchant.numberOfMembers || 0, // 회원가입수
        depositFeeRate: merchant.depositFeeRate || 0, // 입금수수료
        remittanceFeeRate: merchant.remittanceFeeRate || 0, // 원화수수료
        foreignCurrencyFeeRate: merchant.foreignCurrencyFeeRate || 0, // 외화수수료
        agent1, // 에이전트1
        agent2, // 에이전트2
        agent3, // 에이전트3
        agent4, // 에이전트4
        agent5, // 에이전트5
        virtualAccountUsage: "N/A", // 가상계좌사용
        virtualAccountLimit: "N/A", // 가상계좌제한
        totalDeposit: 0, // 총입금
        depositFee: 0, // 입금수수료
        totalWithdrawal: 0, // 총출금금액
        withdrawalFee: 0, // 출금수수료
        disputeAmount: 0, // 민원금액
        reserveAmount: 0, // 유보금액
        balance: merchant.balance || 0, // 잔액
        status: merchant.status || (merchant.isActive ? "활성" : "비활성"), // 상태
      };
    });

    // Define headers for Excel file
    const headers = [
      { key: "number", header: "번호" },
      { key: "groupName", header: "가맹점그룹" },
      { key: "affiliate", header: "가맹점" },
      { key: "companyName", header: "업체명" },
      { key: "numberOfMembers", header: "회원가입수" },
      { key: "depositFeeRate", header: "입금수수료" },
      { key: "remittanceFeeRate", header: "원화수수료" },
      { key: "foreignCurrencyFeeRate", header: "외화수수료" },
      { key: "agent1", header: "에이전트1" },
      { key: "agent2", header: "에이전트2" },
      { key: "agent3", header: "에이전트3" },
      { key: "agent4", header: "에이전트4" },
      { key: "agent5", header: "에이전트5" },
      { key: "virtualAccountUsage", header: "가상계좌사용" },
      { key: "virtualAccountLimit", header: "가상계좌제한" },
      { key: "totalDeposit", header: "총입금" },
      { key: "depositFee", header: "입금수수료" },
      { key: "totalWithdrawal", header: "총출금금액" },
      { key: "withdrawalFee", header: "출금수수료" },
      { key: "disputeAmount", header: "민원금액" },
      { key: "reserveAmount", header: "유보금액" },
      { key: "balance", header: "잔액" },
      { key: "status", header: "상태" },
    ];

    // Use the centralized DownloadService to create and store the Excel file
    return this.downloadService.createExcelFile(
      excelData,
      "merchants-export",
      { headers },
      user.userId,
    );
  }

  /**
   * Exports merchant balance logs to Excel format
   *
   * @param merchantId - Merchant ID to export logs for, 'all' for all merchants
   * @param user - The authenticated admin user
   * @param viewAsAdminId - Optional admin ID to view as (for superadmins)
   * @returns URL for downloading the Excel file
   */
  async exportBalanceLogsToExcel(
    merchantId: string = "all",
    user: JwtUser,
    viewAsAdminId?: string, // Changed from number? to string?
  ): Promise<{ url: string }> {
    // For superadmin, allow viewing as another admin
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
    const effectiveAdminId =
      isSuperAdmin && viewAsAdminId ? viewAsAdminId : user.userId.toString();

    // Get all balance logs without pagination
    const logsData = await this.getBalanceLogs(
      {
        page: 1,
        limit: 1000, // Set a larger limit for export
        skip: 0,
        orderBy: { created_at: "desc" },
        merchantId: merchantId, // Add merchantId to the query object
      } as MerchantBalanceLogQueryDto,
      effectiveAdminId,
      isSuperAdmin && viewAsAdminId ? viewAsAdminId : undefined,
    );

    // Transform data for Excel export - match exactly what's shown on the UI
    const excelData = logsData.data.map((log) => ({
      number: log.number, // 번호
      date: log.date ? new Date(log.date).toLocaleString() : "", // 날짜
      affiliate: log.affiliate || "", // 가맹점
      detail: log.detail || "", // 내용
      changeAmount: log.changeAmount || 0, // 변경금액(수수료포함금액)
      amountAfterChange: log.amountAfterChange || 0, // 변경후금액
    }));

    // Define headers for Excel file
    const headers = [
      { key: "number", header: "번호" },
      { key: "date", header: "날짜" },
      { key: "affiliate", header: "가맹점" },
      { key: "detail", header: "내용" },
      { key: "changeAmount", header: "변경금액(수수료포함금액)" },
      { key: "amountAfterChange", header: "변경후금액" },
    ];

    // Use the centralized DownloadService to create and store the Excel file
    return this.downloadService.createExcelFile(
      excelData,
      "merchant-balance-logs-export",
      { headers },
      user.userId,
    );
  }

  /**
   * Updates a merchant's balance (deposit, withdraw, or adjust)
   *
   * @param merchantId - The unique ID of the merchant to update
   * @param amount - Amount to add/remove/set
   * @param operationType - Type of operation (deposit, withdraw, adjust)
   * @param reason - Reason for the balance change
   * @param user - Current authenticated admin user
   * @returns Updated merchant data
   */
  async updateMerchantBalance(
    merchantId: string,
    amount: number,
    operationType: BalanceChangeType,
    reason: string,
    user: JwtUser,
  ): Promise<MerchantDetailResponseDto> {
    if (amount <= 0) {
      throw new BadRequestException("Amount must be greater than zero");
    }

    return this.prisma.$transaction(async (tx) => {
      // Check if merchant exists
      const merchant = await tx.merchant.findUnique({
        where: { merchant_id: merchantId },
        include: {
          user: true, // Include the user associated with this merchant
        },
      });

      if (!merchant) {
        throw new NotFoundException(
          `Merchant with ID ${merchantId} not found.`,
        );
      }

      if (merchant.deleted_at) {
        throw new BadRequestException(
          `Cannot update balance for deleted merchant with ID ${merchantId}.`,
        );
      }

      // Authorization check - only the admin who created the merchant can update its balance
      if (
        !(await this.adminService.isSuperAdmin(user.userId)) &&
        merchant.created_by !== user.userId.toString()
      ) {
        throw new ForbiddenException(
          `You are not authorized to update the balance of merchant ${merchantId}.`,
        );
      }

      // Get current balance
      const currentBalance = Number(merchant.balance);

      let newBalance: number;
      let changeAmount: number;
      let changeType: BalanceChangeType;

      // Calculate new balance based on operation type
      switch (operationType) {
        case BalanceChangeType.ADJUSTMENT_ADD:
          changeAmount = amount;
          newBalance = currentBalance + amount;
          changeType = BalanceChangeType.ADJUSTMENT_ADD;
          break;
        case BalanceChangeType.ADJUSTMENT_DEDUCT:
          if (currentBalance < amount) {
            throw new BadRequestException(
              "Insufficient balance for withdrawal",
            );
          }
          changeAmount = -amount;
          newBalance = currentBalance - amount;
          changeType = BalanceChangeType.ADJUSTMENT_DEDUCT;
          break;
        case BalanceChangeType.ADJUSTMENT_ADD:
          changeAmount = amount - currentBalance;
          newBalance = amount;
          changeType =
            changeAmount >= 0
              ? BalanceChangeType.ADJUSTMENT_ADD
              : BalanceChangeType.ADJUSTMENT_DEDUCT;
          break;
        default:
          throw new BadRequestException("Invalid operation type");
      }

      // Update merchant balance
      const updatedMerchant = await tx.merchant.update({
        where: { merchant_id: merchantId },
        data: { balance: newBalance },
        include: {
          user: true,
          creator: {
            select: {
              user_id: true,
              username: true,
            },
          },
          group: true,
        },
      });

      // Create balance log entry for manual admin adjustments only
      //
      // IMPORTANT: This manual balance log creation is ONLY for explicit admin adjustments:
      // - ADJUSTMENT_ADD: Manual addition to balance by admin
      // - ADJUSTMENT_DEDUCT: Manual deduction from balance by admin
      // - Other manual adjustment operations
      //
      // Database triggers automatically handle balance logs for:
      // - DEPOSIT_COMMISSION: Created by transaction trigger when deposits occur
      // - WITHDRAWAL_REQUEST: Created when withdrawal is requested
      // - WITHDRAWAL_COMPLETE: Created when withdrawal is completed
      // - WITHDRAWAL_REJECT: Created when withdrawal is rejected
      //
      // This separation ensures balance integrity and proper audit trails
      await tx.balanceLogs.create({
        data: {
          entity_type: EntityType.MERCHANT,
          entity_id: merchant.merchant_id,
          change_type: changeType,
          amount: new Decimal(changeAmount),
          balance_before: new Decimal(currentBalance),
          balance_after: new Decimal(newBalance),
          created_by: user.userId.toString(),
          notes:
            reason ||
            `Merchant balance ${operationType.toLowerCase()} by admin`,
        },
      });

      // Also log to standard logs for audit purposes only, not for balance tracking
      // This separates admin action audit logs from financial records
      await tx.log.create({
        data: {
          user_id: user.userId.toString(),
          action: `MERCHANT_BALANCE_${operationType}`,
          severity: LogSeverity.INFO,
          target_entity_type: EntityType.MERCHANT,
          target_entity_id: merchant.merchant_id,
          details: {
            merchantId: merchant.merchant_id,
            amount: changeAmount,
            reason: reason || null,
          },
        },
      });

      // Log the balance update using the standard logging service
      await this.logger.logUserAction(
        user,
        LogAction.MERCHANT_BALANCE_ADJUST,
        LogSeverity.INFO,
        EntityType.MERCHANT,
        String(merchant.merchant_id),
        {
          merchantId: merchant.merchant_id,
          amount: changeAmount,
          reason,
        },
      );

      // Return the updated merchant
      return this.mapToMerchantDetailResponseDto(updatedMerchant);
    });
  }

  /**
   * Gets balance history for a merchant using the new balance log structure
   *
   * @param merchantId - The merchant ID to get history for
   * @param page - Page number for pagination
   * @param limit - Items per page
   * @param user - Current authenticated user
   * @returns Paginated list of balance log entries
   */
  async getMerchantBalanceHistory(
    merchantId: string,
    page: number = 1,
    limit: number = 10,
    user: JwtUser,
  ) {
    // Check if merchant exists and user has access
    const merchant = await this.prisma.merchant.findUnique({
      where: { merchant_id: merchantId },
      include: {
        user: true,
      },
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${merchantId} not found.`);
    }

    // Authorization check
    if (
      !(await this.adminService.isSuperAdmin(user.userId)) &&
      merchant.created_by !== user.userId.toString()
    ) {
      throw new ForbiddenException(
        `You are not authorized to view this merchant's balance history.`,
      );
    }

    const skip = (page - 1) * limit;

    try {
      // Count total items for balance logs
      const totalItems = await this.prisma.balanceLogs.count({
        where: {
          entity_type: EntityType.MERCHANT,
          entity_id: merchant.merchant_id,
        },
      });

      // Get paginated logs
      const logs = await this.prisma.balanceLogs.findMany({
        where: {
          entity_type: EntityType.MERCHANT,
          entity_id: merchant.merchant_id,
        },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          users: true,
        },
      });

      // Map to response DTOs
      const mappedLogs = logs.map((log) => {
        return {
          number: skip + logs.indexOf(log) + 1,
          date: log.created_at,
          affiliate: merchant.affiliate,
          detail: log.notes || "",
          changeAmount: Number(log.amount),
          amountAfterChange: Number(log.balance_after),
          type: log.change_type,
          merchantId: merchantId,
        };
      });

      return {
        data: mappedLogs,
        meta: {
          total: totalItems,
          page,
          limit,
          totalPages: Math.ceil(totalItems / limit),
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(
        `Error retrieving balance history: ${errorMessage}`,
      );
    }
  }

  // Max withdrawal = (deposit_amount + available_remittance_amount) - reserve_amount - withdrawal_fee
  async calculateMaxWithdrawal(merchantId: string) {
    const wallet = await this.prisma.merchantWallet.findUnique({
      where: { merchant_id: merchantId },
    });

    // Direct query instead of relationship
    const merchantFee = await this.prisma.merchantFee.findUnique({
      where: { merchant_id: merchantId },
    });

    const merchant = await this.prisma.merchant.findUnique({
      where: { merchant_id: merchantId },
    });

    if (!wallet || !merchant || !merchantFee) {
      throw new NotFoundException(
        "Merchant wallet or fee information not found",
      );
    }

    const totalBalance =
      Number(wallet.deposit_amount) +
      Number(wallet.available_remittance_amount);
    const reserveAmount = Number(wallet.reserve_amount);

    // Use direct merchantFee reference
    const withdrawalFeeRate = Number(merchantFee.remittance_fee_rate);
    const withdrawalFeeAmount =
      (totalBalance - reserveAmount) * (withdrawalFeeRate / 100);

    const maxWithdrawal = totalBalance - reserveAmount - withdrawalFeeAmount;

    return Math.max(0, maxWithdrawal);
  }

  /**
   * Update a merchant's status (active/inactive)
   *
   * @param id Merchant ID
   * @param dto Status update DTO
   * @param admin Admin user making the update
   * @returns Updated merchant details
   */
  async updateStatus(
    id: string,
    dto: UpdateMerchantStatusDto,
    admin: JwtUser,
  ): Promise<MerchantDetailResponseDto> {
    // Use AdminUsersService's centralized user status update method
    await this.usersService.updateUserRoleStatus(id, dto.isActive, admin);

    // Return updated merchant
    return this.findOne(id, admin);
  }

  /**
   * Fetches and calculates transaction data for a list of merchants
   *
   * @param merchants List of merchant entities
   * @returns Map of merchant IDs to transaction summary data
   */
  private async fetchMerchantTransactionData(
    merchants: Array<{
      merchant_id: string;
      merchantFee?: {
        deposit_fee_rate?: any;
        remittance_fee_rate?: any;
      };
    }>,
  ): Promise<
    Map<
      string,
      {
        totalDeposit: number;
        totalDepositFee: number;
        totalWithdrawal: number;
        totalWithdrawalFee: number;
        disputeAmount: number;
      }
    >
  > {
    // Get merchant IDs from the passed merchants
    const merchantIds = merchants.map((m) => m.merchant_id);

    // Define types for the groupBy results
    type TransactionSummaryResult = Array<{
      merchant_id: string;
      _sum: {
        deposit_amount: number | null;
        deposit_count: number | null;
        cancel_amount: number | null;
        cancel_count: number | null;
      };
    }>;

    type BalanceLogsResult = Array<{
      entity_id: string;
      _sum: {
        amount: number | null;
      };
    }>;

    type CivilComplaintResult = Array<{
      merchant_id: string;
      _sum: {
        amount_deducted: number | null;
      };
    }>;

    // Query transaction data from various sources
    const [transactionSummaries, withdrawalLogs, civilComplaints] =
      await Promise.all([
        // Get deposit amounts from transaction summaries
        this.prisma.transactionSummary.groupBy({
          by: ["merchant_id"],
          where: { merchant_id: { in: merchantIds } },
          _sum: {
            deposit_amount: true,
            deposit_count: true,
            // Cancel amounts if needed
            cancel_amount: true,
            cancel_count: true,
          },
        }) as unknown as Promise<TransactionSummaryResult>,

        // Get withdrawal info from balance logs
        this.prisma.balanceLogs.groupBy({
          by: ["entity_id"],
          where: {
            entity_id: { in: merchantIds },
            entity_type: EntityType.MERCHANT,
            change_type: {
              in: [
                BalanceChangeType.WITHDRAWAL_COMPLETE,
                BalanceChangeType.WITHDRAWAL_REQUEST,
              ],
            },
          },
          _sum: {
            amount: true,
          },
        }) as unknown as Promise<BalanceLogsResult>,

        // Get dispute/civil complaint amounts
        this.prisma.civilComplaint.groupBy({
          by: ["merchant_id"],
          where: { merchant_id: { in: merchantIds } },
          _sum: {
            amount_deducted: true,
          },
        }) as unknown as Promise<CivilComplaintResult>,
      ]);

    // Create a map for the transaction data
    const txSummaryMap = new Map<
      string,
      {
        totalDeposit: number;
        totalDepositFee: number;
        totalWithdrawal: number;
        totalWithdrawalFee: number;
        disputeAmount: number;
      }
    >();

    // Initialize with zeros for all merchants
    for (const merchantId of merchantIds) {
      txSummaryMap.set(merchantId, {
        totalDeposit: 0,
        totalDepositFee: 0,
        totalWithdrawal: 0,
        totalWithdrawalFee: 0,
        disputeAmount: 0,
      });
    }

    // Fill in deposit data
    for (const summary of transactionSummaries) {
      const data = txSummaryMap.get(summary.merchant_id);
      if (data) {
        const depositAmount = Number(summary._sum.deposit_amount || 0);
        // Get the merchant's fee rate for calculating deposit fees
        const merchant = merchants.find(
          (m) => m.merchant_id === summary.merchant_id,
        );

        const depositFeeRate = Number(
          merchant?.merchantFee?.deposit_fee_rate || 0,
        );

        data.totalDeposit = depositAmount;
        data.totalDepositFee = Math.round(
          depositAmount * (depositFeeRate / 100),
        );
        txSummaryMap.set(summary.merchant_id, data);
      }
    }

    // Fill in withdrawal data
    for (const log of withdrawalLogs) {
      const data = txSummaryMap.get(log.entity_id);
      if (data) {
        // Withdrawal amounts are negative in logs, so we use absolute value
        const withdrawalAmount = Math.abs(Number(log._sum.amount || 0));
        // Get the merchant's fee rate for calculating withdrawal fees
        const merchant = merchants.find((m) => m.merchant_id === log.entity_id);

        const remittanceFeeRate = Number(
          merchant?.merchantFee?.remittance_fee_rate || 0,
        );

        data.totalWithdrawal = withdrawalAmount;
        data.totalWithdrawalFee = Math.round(
          withdrawalAmount * (remittanceFeeRate / 100),
        );
        txSummaryMap.set(log.entity_id, data);
      }
    }

    // Fill in dispute amounts
    for (const complaint of civilComplaints) {
      const data = txSummaryMap.get(complaint.merchant_id);
      if (data) {
        data.disputeAmount = Number(complaint._sum.amount_deducted || 0);
        txSummaryMap.set(complaint.merchant_id, data);
      }
    }

    return txSummaryMap;
  }

  /**
   * Enriches merchants with transaction data and maps to DTOs
   *
   * @param merchants List of merchant entities
   * @param txSummaryMap Map of merchant IDs to transaction data
   * @param startIndex Starting index for pagination numbering
   * @returns List of merchant DTOs with enriched data
   */
  private async enrichAndMapMerchants(
    merchants: any[],
    txSummaryMap: Map<
      string,
      {
        totalDeposit: number;
        totalDepositFee: number;
        totalWithdrawal: number;
        totalWithdrawalFee: number;
        disputeAmount: number;
      }
    >,
    startIndex: number = 0,
  ): Promise<MerchantDetailResponseDto[]> {
    const results: MerchantDetailResponseDto[] = [];

    for (let idx = 0; idx < merchants.length; idx++) {
      const merchant = merchants[idx];
      // Get transaction data for this merchant
      const txSummary = txSummaryMap.get(merchant.merchant_id) || {
        totalDeposit: 0,
        totalDepositFee: 0,
        totalWithdrawal: 0,
        totalWithdrawalFee: 0,
        disputeAmount: 0,
      };

      // Enrich merchant with transaction data
      const enrichedMerchant = {
        ...merchant,
        totalDeposit: txSummary.totalDeposit,
        totalDepositFee: txSummary.totalDepositFee,
        totalWithdrawal: txSummary.totalWithdrawal,
        totalWithdrawalFee: txSummary.totalWithdrawalFee,
        disputeAmount: txSummary.disputeAmount,
      };

      // Map to DTO
      const detailDto =
        await this.mapToMerchantDetailResponseDto(enrichedMerchant);

      // Add pagination number
      detailDto.number = startIndex + idx + 1;

      results.push(detailDto);
    }

    return results;
  }

  /**
   * Creates a standard merchant query filter with common parameters
   *
   * @param query Query parameters from controller
   * @param effectiveAdminId Admin ID to filter merchants by
   * @param includeDeleted Whether to include deleted merchants
   * @returns Prisma where condition for merchant queries
   */
  private buildMerchantQueryFilter(
    query: AdminMerchantsQueryDto,
    effectiveAdminId: string,
    includeDeleted: boolean = false,
  ): Prisma.MerchantWhereInput {
    const { search, isActive, groupId } = query;

    // Base where condition - filter by admin who created the merchant
    let where: Prisma.MerchantWhereInput = {
      created_by: effectiveAdminId,
    };

    // Apply search filter across multiple fields
    if (search) {
      where.OR = [
        { affiliate: { contains: search, mode: "insensitive" } },
        { company_name: { contains: search, mode: "insensitive" } },
        { telegram_id: { contains: search, mode: "insensitive" } },
        { merchant_id: { contains: search, mode: "insensitive" } },
      ];
    }

    // Apply active status filter through the user relation
    if (isActive !== undefined) {
      where.user = {
        is_active: isActive,
      };
    }

    // Apply merchant group filter
    if (groupId) {
      if (typeof groupId === "string") {
        // Parse string to number if needed
        const numericGroupId = parseInt(groupId as string, 10);
        if (!isNaN(numericGroupId)) {
          where.group_id = numericGroupId;
        }
      } else {
        // Direct numeric group ID
        where.group_id = groupId;
      }
    }

    // Apply deleted filter - this should eventually use a reusable method from PrismaService
    if (!includeDeleted) {
      // For active merchants only
      where.deleted_at = null;
    }
    // When includeDeleted is true, we don't add any filter, which includes both active and deleted merchants

    return where;
  }

  /**
   * Gets the bank name from its code by querying the database
   *
   * @param bankCode - The bank code to look up
   * @returns The bank name or null if not found
   */
  private async getBankNameFromCode(
    bankCode: string,
  ): Promise<string | undefined> {
    if (!bankCode) return undefined;

    const bank = await this.prisma.bank.findUnique({
      where: { bank_code: bankCode },
      select: { bank_name: true },
    });

    return bank?.bank_name || undefined;
  }

  /**
   * Maps a merchant entity to a response DTO for detail views
   *
   * @param merchant Merchant entity with relations
   * @returns Formatted merchant detail response DTO
   */
  private async mapToMerchantDetailResponseDto(
    merchant: any,
  ): Promise<MerchantDetailResponseDto> {
    const merchantFee = merchant.merchantFee;
    const merchantWallet = merchant.merchantWallet;
    const merchantTransactionInfo = merchant.merchantTransactionInfo;
    const virtualAccounts = merchant.virtualAccounts || [];
    const topAgents = merchant.agents || [];

    const dto = new MerchantDetailResponseDto();

    // Basic merchant info
    dto.merchantId = merchant.merchant_id;
    dto.affiliate = merchant.affiliate;
    dto.companyName = merchant.company_name;
    dto.groupId = merchant.group_id;
    dto.groupName = merchant.group?.group_name || "Unknown Group";
    dto.numberOfMembers = await this.countMembersForMerchant(
      merchant.merchant_id,
    );
    dto.status = merchant.status;
    dto.isActive = merchant.status === MerchantStatus.ACTIVE;
    dto.createdAt = merchant.created_at;
    dto.createdBy = merchant.created_by;

    // Fee information
    dto.depositFeeRate = Number(merchantFee?.deposit_fee_rate || 0);
    dto.depositFee = Number(merchantFee?.deposit_fee || 0);
    dto.remittanceFeeRate = Number(merchantFee?.remittance_fee_rate || 0);
    dto.remittanceFee = Number(merchantFee?.remittance_fee || 0);
    dto.foreignCurrencyRemittanceFeeRate = Number(
      merchantFee?.foreign_remittance_fee_rate || 0,
    );
    dto.foreignCurrencyFeeRate = Number(
      merchant.foreign_currency_fee_rate || 0,
    );
    dto.settlementFeeRate = Number(merchant.settlement_fee_rate || 0);
    dto.settlementFee = Number(merchant.settlement_fee || 0);
    dto.reserveRate = Number(merchantFee?.reserve_rate || 0);
    dto.balance = Number(merchant.balance || 0);

    // Bank information
    dto.selectedBanks =
      merchant.selected_banks?.filter(
        (bank: string | null): bank is string => bank !== null,
      ) || [];

    // Withdrawal information
    dto.withdrawalBankName = merchantTransactionInfo?.merchant_bank_code
      ? await this.getBankNameFromCode(
          merchantTransactionInfo.merchant_bank_code,
        )
      : undefined;
    dto.withdrawalAccountNumber =
      merchantTransactionInfo?.merchant_account_number;
    dto.withdrawalAccountHolder = merchant.company_name;

    // Foreign bank information
    dto.foreignBankName = merchant.foreign_bank_name;
    dto.foreignBankAccountNumber = merchant.foreign_bank_account_number;
    dto.foreignBankAccountHolder = merchant.foreign_bank_account_holder;

    // Dashboard access
    dto.dashboardId = merchant.user?.username;
    dto.dashboardPassword = merchant.user?.password_hash
      ? "••••••••"
      : undefined;

    // Virtual account settings
    dto.virtualAccountUsage = virtualAccounts.some(
      (va: any) => va.issue_status === "Y",
    )
      ? "Y"
      : "N";
    dto.virtualAccountLimit = virtualAccounts[0]?.max_limit_amount
      ? Number(virtualAccounts[0].max_limit_amount)
      : undefined;

    // Financial calculations
    dto.totalDeposit =
      Number(merchantWallet?.deposit_amount || 0) +
      Number(merchantWallet?.available_remittance_amount || 0);
    dto.totalDepositFee = Number(
      dto.totalDeposit * dto.depositFeeRate * 0.01 || 0,
    );
    dto.totalWithdrawal = Number(
      merchantWallet?.available_remittance_amount || 0,
    );
    dto.totalWithdrawalFee = Number(
      dto.totalWithdrawal * dto.remittanceFeeRate * 0.01 || 0,
    );

    // Agent distribution rates
    dto.agents = topAgents.map((agent: any) => ({
      agentId: agent.agent_id,
      agentName: agent.agent_name,
      distributionRate: Number(agent.distribution_rate),
    }));

    // API integration
    dto.mid = merchant.mid;
    dto.mkey = merchant.mkey;
    dto.callbackUrl = merchant.callback_url;

    // Notification settings
    dto.telegramId = merchant.telegram_id;
    dto.notificationTypes = Array.isArray(merchant.notification_types)
      ? merchant.notification_types.filter(
          (type): type is string => typeof type === "string",
        )
      : [];
    dto.notificationTime = merchant.notification_time;

    return dto;
  }

  /**
   * Get standard merchant include configuration for querying merchants with related entities
   *
   * @returns Prisma include object for merchant queries
   */
  private getMerchantIncludeConfig(): Prisma.MerchantInclude {
    // This could eventually use a PrismaService method for standard includes
    return {
      // User account related info
      user: {
        select: {
          user_id: true,
          username: true,
          is_active: true,
          first_login: true,
          tfa_secret: true,
        },
      },

      // Related entities
      group: true,
      agents: {
        orderBy: { distribution_rate: "desc" }, // Get highest rate agents first
        include: {
          user: {
            select: { username: true },
          },
        },
      },
      banks: true,
      creator: {
        select: {
          user_id: true,
          username: true,
        },
      },
    };
  }

  /**
   * Build standard pagination metadata object
   *
   * @param total Total number of items
   * @param page Current page number
   * @param limit Items per page
   * @returns Pagination metadata object
   */
  private buildPaginationMeta(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private formatPaginatedResponse<T>(
    data: T[],
    meta: any,
  ): PaginatedResponse<T> {
    return {
      data,
      items: data, // Add items field with same content as data to satisfy OpenAPI requirements
      meta,
      currentPage: meta.page,
      totalPages: meta.totalPages,
    };
  }

  /**
   * Counts the number of members (agents and virtual accounts) for a merchant
   *
   * @param merchantId - The merchant ID to count members for
   * @returns The total number of members
   */
  private async countMembersForMerchant(merchantId: string): Promise<number> {
    const [agentCount, vaCount] = await Promise.all([
      this.prisma.agent.count({
        where: { merchant_id: merchantId },
      }),
      this.prisma.virtualAccount.count({
        where: { merchant_id: merchantId },
      }),
    ]);

    return agentCount + vaCount;
  }
}
