import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  BalanceChangeType,
  EntityType,
  LogSeverity,
  Prisma,
  PrismaService,
  RoleName,
  Withdrawal,
  WithdrawalMethod,
  WithdrawalStatus as PrismaWithdrawalStatus,
} from "@ezpg/database";
import { AdminWithdrawalQueryDto } from "./dto/withdrawal-query.dto";
import { UpdateWithdrawalStatusDto } from "./dto/update-withdrawal.dto";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { Decimal } from "@prisma/client/runtime/library";
import { WithdrawalUpdateResponseDto } from "./dto/withdrawal-response.dto";
import { LoggingService } from "../../core/logging/logging.service";
import { toCamelSync as toCamel } from "@ezpg/helpers";
import { LogAction } from "../../core/logging/log-action.enum";
import { MerchantWithdrawalQueryDto } from "./dto/merchant-withdrawal-query.dto";
import { MerchantSearchType } from "../../common/enums/merchant-search-type.enum";
import { AgentWithdrawalQueryDto } from "./dto/agent-withdrawal-query.dto";
import { AgentSearchType } from "../../common/enums/agent-search-type.enum";
import { MerchantWithdrawalStatsDto } from "./dto/merchant-withdrawal-stats.dto";
import { AgentWithdrawalStatsDto } from "./dto/agent-withdrawal-stats.dto";
import { SearchCriteriaType } from "../../common/enums/search-criteria-type.enum";
import { UpdateMerchantWithdrawalDto } from "./dto/merchant-withdrawal-update.dto";
import { UpdateAgentWithdrawalDto } from "./dto/agent-withdrawal-update.dto";
import { AdminAdminsService } from "../admins/admin-admins.service";
import { DownloadService } from "../../core/download/download.service";

// Add a MerchantWithdrawalResponse interface
export interface MerchantWithdrawalResponse {
  withdrawalId: number;
  entityId: string;
  requestedAt: Date;
  processedAt?: Date;
  accountDate?: Date;
  accountHolder: string;
  bank: string;
  accountNumber: string;
  amount: number;
  status: string;
  withdrawalMethod?: string;
  notes?: string;
  merchantId?: string;
  affiliate?: string;
  companyName?: string;
  requester?: { userId: string; username: string };
  processor?: { userId: string; username: string };
}

@Injectable()
export class AdminWithdrawalsService {
  constructor(
    private prisma: PrismaService,
    private loggingService: LoggingService,
    private adminService: AdminAdminsService,
    private downloadService: DownloadService,
  ) {}

  async findAll(
    query: AdminWithdrawalQueryDto,
  ): Promise<PaginatedResult<Withdrawal>> {
    const {
      page,
      limit,
      skip,
      orderBy,
      search,
      endDate,
      status,
      entityType,
      merchantId,
      agentId,
    } = query;

    const where: Prisma.WithdrawalWhereInput = {};
    if (status) where.status = status;
    if (entityType) where.entity_type = entityType;
    if (agentId) {
      where.entity_type = EntityType.AGENT; // Implicitly set if agentId provided
      where.entity_id = agentId;
    }

    if (endDate) {
      where.requested_at = new Date(endDate + "T23:59:59.999Z");
    }

    // Handle merchantId lookup
    if (merchantId) {
      const merchant = await this.prisma.merchant.findUnique({
        where: { merchant_id: merchantId },
        select: { merchant_id: true },
      });
      if (merchant) {
        where.entity_type = EntityType.MERCHANT; // Implicitly set
        where.entity_id = merchant.merchant_id;
      } else {
        // Merchant not found, return empty
        return { data: [], totalItems: 0, totalPages: 0, currentPage: page };
      }
    }

    // Add search capability if needed (e.g., search by account holder)
    if (search) {
      where.OR = [
        { account_holder: { contains: search, mode: "insensitive" } },
        { account_number: { contains: search, mode: "insensitive" } },
        // Add search on related entity name if possible/needed
      ];
    }

    try {
      const totalItems = await this.prisma.withdrawal.count({ where });
      const withdrawals = await this.prisma.withdrawal.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          requester: { select: { user_id: true, username: true } }, // User who requested (merchant user or admin for agent)
          processor: { select: { user_id: true, username: true } }, // Admin who processed
          // Conditionally include Merchant or Agent based on entity_type for more details
        },
      });

      // Enhance results with Merchant ID / Agent Username for display
      const enhancedWithdrawals = await Promise.all(
        withdrawals.map(async (w) => {
          let entityDetails: Record<string, unknown> = {};
          if (w.entity_type === EntityType.MERCHANT) {
            const m = await this.prisma.merchant.findUnique({
              where: { merchant_id: w.entity_id },
              select: { merchant_id: true, affiliate: true },
            });
            entityDetails = {
              merchant_id: m?.merchant_id,
              merchant_name: m?.affiliate,
            };
          } else if (w.entity_type === EntityType.AGENT) {
            const a = await this.prisma.agent.findUnique({
              where: { agent_id: w.entity_id },
              select: { agent_name: true },
            });
            entityDetails = {
              agent_name: a?.agent_name,
            };
          }
          // Convert Decimal amount
          return { ...w, amount: Number(w.amount), ...entityDetails };
        }),
      );

      return toCamel({
        data: enhancedWithdrawals.map((withdrawal) => toCamel(withdrawal)),
        total_items: totalItems,
        total_pages: Math.ceil(totalItems / limit),
        current_page: page,
      });
    } catch (error) {
      this.loggingService.error(
        LogSeverity.ERROR,
        "AdminWithdrawalsService",
        LogAction.SYSTEM,
        `Failed to retrieve withdrawals: ${(error as Error).message}`,
        null,
        (error as Error).stack,
      );
      throw new Error(
        `Failed to retrieve withdrawals: ${(error as Error).message}`,
      );
    }
  }

  async updateStatus(
    withdrawalId: number,
    dto: UpdateWithdrawalStatusDto,
    adminUserId: string,
  ): Promise<WithdrawalUpdateResponseDto> {
    const { status, notes } = dto;

    return this.prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findUnique({
        where: { withdrawal_id: withdrawalId },
      });
      if (!withdrawal)
        throw new NotFoundException(
          `Withdrawal request ${withdrawalId} not found.`,
        );

      // Basic state transition validation
      if (
        withdrawal.status === PrismaWithdrawalStatus.COMPLETED ||
        withdrawal.status === PrismaWithdrawalStatus.REJECTED ||
        withdrawal.status === PrismaWithdrawalStatus.FAILED
      ) {
        throw new BadRequestException(
          `Cannot update withdrawal already in '${withdrawal.status}' status.`,
        );
      }
      // Add more specific rules, e.g., cannot go from PENDING directly to COMPLETED without APPROVAL?

      const oldStatus = withdrawal.status;

      // --- Balance Adjustment Logic ---
      let balanceLogData: Prisma.BalanceLogsCreateInput | null = null;

      if (status === PrismaWithdrawalStatus.COMPLETED) {
        if (withdrawal.entity_type === EntityType.MERCHANT) {
          const merchant = await tx.merchant.findUnique({
            where: { merchant_id: withdrawal.entity_id },
          });
          if (!merchant)
            throw new InternalServerErrorException(
              "Merchant not found for balance update",
            );
          const newBalance = new Decimal(merchant.balance).minus(
            withdrawal.amount,
          );
          if (newBalance.isNegative())
            throw new BadRequestException(
              "Insufficient merchant balance for completion.",
            ); // Final check
          await tx.merchant.update({
            where: { merchant_id: withdrawal.entity_id },
            data: { balance: newBalance },
          });
          // TODO: Log merchant balance change if needed
        } else if (withdrawal.entity_type === EntityType.AGENT) {
          const agent = await tx.agent.findUnique({
            where: { agent_id: withdrawal.entity_id },
          });
          if (!agent)
            throw new InternalServerErrorException(
              "Agent not found for balance update",
            );
          const balanceBefore = new Decimal(agent.balance);
          const newBalance = balanceBefore.minus(withdrawal.amount);
          if (newBalance.isNegative())
            throw new BadRequestException(
              "Insufficient agent balance for completion.",
            ); // Final check
          await tx.agent.update({
            where: { agent_id: withdrawal.entity_id },
            data: { balance: newBalance },
          });
          // Prepare agent balance log entry
          balanceLogData = {
            entity_type: EntityType.AGENT,
            entity_id: agent.agent_id,
            change_type: BalanceChangeType.WITHDRAWAL_COMPLETE,
            amount: new Decimal(withdrawal.amount).negated(), // Store as negative
            balance_before: balanceBefore,
            balance_after: newBalance,
            notes: `Withdrawal ${withdrawalId} completed.`,
            withdrawals: {
              connect: { withdrawal_id: withdrawal.withdrawal_id },
            },
            users: {
              connect: { user_id: adminUserId },
            },
          };
        }
      } else if (
        status === PrismaWithdrawalStatus.REJECTED ||
        status === PrismaWithdrawalStatus.FAILED
      ) {
        // If rejecting/failing an 'APPROVED' withdrawal where funds were held, refund logic might be needed.
        // Simple case: If rejecting from 'PENDING', no balance change.
        if (withdrawal.entity_type === EntityType.AGENT) {
          // Log rejection for agents
          const agent = await tx.agent.findUnique({
            where: { agent_id: withdrawal.entity_id },
          });
          if (agent) {
            // Agent might be deleted, handle gracefully
            balanceLogData = {
              entity_type: EntityType.AGENT,
              entity_id: agent.agent_id,
              change_type: BalanceChangeType.WITHDRAWAL_REJECT, // Or FAILED
              amount: new Decimal(0), // No amount change usually on reject from pending
              balance_before: agent.balance,
              balance_after: agent.balance,
              notes:
                `Withdrawal ${withdrawalId} ${status.toLowerCase()}. ${notes || ""}`.trim(),
              withdrawals: {
                connect: { withdrawal_id: withdrawal.withdrawal_id },
              },
              users: {
                connect: { user_id: adminUserId },
              },
            };
          }
        }
      }
      // Add logic for APPROVAL step if needed (e.g., holding funds)

      // Update withdrawal status
      const updatedWithdrawal = await tx.withdrawal.update({
        where: { withdrawal_id: withdrawalId },
        data: {
          status: status,
          processed_at: new Date(),
          processed_by: adminUserId,
          processing_note: notes,
        },
        include: {
          requester: true,
        },
      });

      // Create agent balance log if prepared
      if (balanceLogData) {
        await tx.balanceLogs.create({ data: balanceLogData });
      }

      // TODO: Log admin action

      // Convert Decimal amount for response
      return toCamel({
        withdrawal: {
          ...updatedWithdrawal,
          entity_id: updatedWithdrawal.entity_id.toString(),
          amount: updatedWithdrawal.amount.toString(),
          account_number: updatedWithdrawal.account_number,
          account_holder: updatedWithdrawal.account_holder,
          bank_code: updatedWithdrawal.bank_name, // Using bank_name as bank_code
          bank_account_number: updatedWithdrawal.account_number,
          bank_account_holder: updatedWithdrawal.account_holder,
        },
        message: "Withdrawal status updated successfully",
      });
    });
  }

  // MERCHANT WITHDRAWAL METHODS
  async findAllMerchantWithdrawals(
    query: MerchantWithdrawalQueryDto,
    userId: string,
    role: RoleName,
  ): Promise<PaginatedResult<MerchantWithdrawalResponse>> {
    // First check if the user is a superadmin
    const isSuperAdmin = await this.adminService.isSuperAdmin(userId);

    const {
      page = 1,
      pageSize = 10,
      status,
      merchantId,
      searchType,
      searchValue,
      dateCriteria = SearchCriteriaType.REQUESTED_DATE,
      startDate,
      endDate,
      selectedDate,
      orderByField = "requestedAt",
      orderDirection = "desc",
    } = query;

    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // Determine date field to filter on
    let dateField: string;
    switch (dateCriteria) {
      case SearchCriteriaType.PROCESSED_DATE:
        dateField = "processed_at";
        break;
      case SearchCriteriaType.ACCOUNT_DATE:
        // No account_date field, use processed_at as a substitute
        dateField = "processed_at";
        break;
      case SearchCriteriaType.REQUESTED_DATE:
      default:
        dateField = "requested_at";
        break;
    }

    // Build query conditions
    const where: Prisma.WithdrawalWhereInput = {
      entity_type: EntityType.MERCHANT,
    };

    if (status) where.status = status;

    if (merchantId) {
      where.entity_id = merchantId;
    }

    // Date handling logic
    where[dateField] = {};

    if (startDate && endDate) {
      // Case 1: Date range provided
      where[dateField]["gte"] = new Date(startDate + "T00:00:00.000Z");
      where[dateField]["lte"] = new Date(endDate + "T23:59:59.999Z");
    } else if (selectedDate) {
      // Case 2: Single day selected
      where[dateField]["gte"] = new Date(selectedDate + "T00:00:00.000Z");
      where[dateField]["lte"] = new Date(selectedDate + "T23:59:59.999Z");
    } else {
      // Case 3: Default to today
      const today = new Date().toISOString().split("T")[0];
      where[dateField]["gte"] = new Date(today + "T00:00:00.000Z");
      where[dateField]["lte"] = new Date(today + "T23:59:59.999Z");
    }

    // Search options
    if (searchType && searchValue) {
      switch (searchType) {
        case MerchantSearchType.AFFILIATE:
          // First find merchant IDs matching the criteria
          const merchantsByAffiliate = await this.prisma.merchant.findMany({
            where: {
              affiliate: { contains: searchValue, mode: "insensitive" },
            },
            select: { merchant_id: true },
          });
          const affiliateMerchantIds = merchantsByAffiliate.map(
            (m) => m.merchant_id,
          );
          where.entity_id = { in: affiliateMerchantIds };
          break;
        case MerchantSearchType.COMPANY_NAME:
          // First find merchant IDs matching the criteria
          const merchantsByCompany = await this.prisma.merchant.findMany({
            where: {
              company_name: { contains: searchValue, mode: "insensitive" },
            },
            select: { merchant_id: true },
          });
          const companyMerchantIds = merchantsByCompany.map(
            (m) => m.merchant_id,
          );
          where.entity_id = { in: companyMerchantIds };
          break;
        case MerchantSearchType.ACCOUNT_HOLDER:
          where.account_holder = {
            contains: searchValue,
            mode: "insensitive",
          };
          break;
        case MerchantSearchType.ACCOUNT_NUMBER:
          where.account_number = {
            contains: searchValue,
            mode: "insensitive",
          };
          break;
      }
    }

    // If not a superadmin, restrict to own merchants
    if (!isSuperAdmin) {
      // Get merchant IDs owned by this admin
      const ownMerchants = await this.prisma.merchant.findMany({
        where: { created_by: userId },
        select: { merchant_id: true },
      });
      const ownMerchantIds = ownMerchants.map((m) => m.merchant_id);

      // Apply merchant ID filtering
      where.entity_id = { in: ownMerchantIds };
    }

    // Determine order by - need to handle the joined fields differently
    const orderBy: Prisma.WithdrawalOrderByWithRelationInput = {};
    switch (orderByField) {
      case "processedAt":
        orderBy.processed_at = orderDirection.toLowerCase() as "asc" | "desc";
        break;
      case "amount":
        orderBy.amount = orderDirection.toLowerCase() as "asc" | "desc";
        break;
      // Handle fields that don't exist directly on Withdrawal
      case "affiliate":
      case "companyName":
      case "accountDate":
      case "requestedAt":
      default:
        orderBy.requested_at = orderDirection.toLowerCase() as "asc" | "desc";
        break;
    }

    try {
      const totalItems = await this.prisma.withdrawal.count({ where });
      const withdrawals = await this.prisma.withdrawal.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          requester: { select: { user_id: true, username: true } },
          processor: { select: { user_id: true, username: true } },
        },
      });

      // Enhance results with Merchant info for display
      const enhancedWithdrawals = await Promise.all(
        withdrawals.map(async (w) => {
          // Get merchant data using the correct field name from your enhanced withdrawal objects
          const merchant = await this.prisma.merchant.findUnique({
            where: { merchant_id: w.entity_id },
            select: { affiliate: true, company_name: true },
          });

          return {
            entityId: w.entity_id,
            withdrawalId: w.withdrawal_id,
            requestedAt: w.requested_at,
            processedAt: w.processed_at,
            accountDate: w.processed_at, // Use processed_at as account date
            accountHolder: w.account_holder,
            bank: w.bank_name,
            accountNumber: w.account_number,
            amount: Number(w.amount),
            status: w.status,
            withdrawalMethod: w.method, // Use method instead of memo
            notes: w.processing_note, // Use processing_note as notes
            requester: w.requester
              ? {
                  userId: w.requester.user_id,
                  username: w.requester.username,
                }
              : null,
            processor: w.processor
              ? {
                  userId: w.processor.user_id,
                  username: w.processor.username,
                }
              : null,
            ...merchant,
          };
        }),
      );

      return {
        data: enhancedWithdrawals,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      };
    } catch (error) {
      this.loggingService.error(
        LogSeverity.ERROR,
        "AdminWithdrawalsService",
        LogAction.SYSTEM,
        `Failed to retrieve merchant withdrawals: ${(error as Error).message}`,
        null,
        (error as Error).stack,
      );
      throw new Error(
        `Failed to retrieve merchant withdrawals: ${(error as Error).message}`,
      );
    }
  }

  async getMerchantWithdrawalStats(
    query: MerchantWithdrawalQueryDto,
    userId: string,
    role: RoleName,
  ): Promise<MerchantWithdrawalStatsDto> {
    const {
      status,
      merchantId,
      searchType,
      searchValue,
      dateCriteria = SearchCriteriaType.REQUESTED_DATE,
      startDate,
      endDate,
      selectedDate,
    } = query;

    // First check if the user is a superadmin
    const isSuperAdmin = await this.adminService.isSuperAdmin(userId);

    // Determine date field to filter on
    let dateField: string;
    switch (dateCriteria) {
      case SearchCriteriaType.PROCESSED_DATE:
        dateField = "processed_at";
        break;
      case SearchCriteriaType.ACCOUNT_DATE:
        dateField = "account_date";
        break;
      case SearchCriteriaType.REQUESTED_DATE:
      default:
        dateField = "requested_at";
        break;
    }

    // Build query conditions - similar to findAllMerchantWithdrawals
    const where: Prisma.WithdrawalWhereInput = {
      entity_type: EntityType.MERCHANT,
    };

    if (status) where.status = status;

    if (merchantId) {
      where.entity_id = merchantId;
    }

    // Date handling logic
    where[dateField] = {};

    if (startDate && endDate) {
      // Case 1: Date range provided
      where[dateField]["gte"] = new Date(startDate + "T00:00:00.000Z");
      where[dateField]["lte"] = new Date(endDate + "T23:59:59.999Z");
    } else if (selectedDate) {
      // Case 2: Single day selected
      where[dateField]["gte"] = new Date(selectedDate + "T00:00:00.000Z");
      where[dateField]["lte"] = new Date(selectedDate + "T23:59:59.999Z");
    } else {
      // Case 3: Default to today
      const today = new Date().toISOString().split("T")[0];
      where[dateField]["gte"] = new Date(today + "T00:00:00.000Z");
      where[dateField]["lte"] = new Date(today + "T23:59:59.999Z");
    }

    if (searchType && searchValue) {
      switch (searchType) {
        case MerchantSearchType.AFFILIATE:
          // Find merchant IDs with matching affiliate
          const merchantsByAffiliate = await this.prisma.merchant.findMany({
            where: {
              affiliate: { contains: searchValue, mode: "insensitive" },
            },
            select: { merchant_id: true },
          });
          const affiliateMerchantIds = merchantsByAffiliate.map(
            (m) => m.merchant_id,
          );
          where.entity_id = { in: affiliateMerchantIds };
          break;
        case MerchantSearchType.COMPANY_NAME:
          // Find merchant IDs with matching company name
          const merchantsByCompany = await this.prisma.merchant.findMany({
            where: {
              company_name: { contains: searchValue, mode: "insensitive" },
            },
            select: { merchant_id: true },
          });
          const companyMerchantIds = merchantsByCompany.map(
            (m) => m.merchant_id,
          );
          where.entity_id = { in: companyMerchantIds };
          break;
        case MerchantSearchType.ACCOUNT_HOLDER:
          where.account_holder = {
            contains: searchValue,
            mode: "insensitive",
          };
          break;
        case MerchantSearchType.ACCOUNT_NUMBER:
          where.account_number = {
            contains: searchValue,
            mode: "insensitive",
          };
          break;
      }
    }

    // If not a superadmin, restrict to own merchants
    if (!isSuperAdmin) {
      // Find merchant IDs owned by this admin
      const ownMerchants = await this.prisma.merchant.findMany({
        where: { created_by: userId },
        select: { merchant_id: true },
      });
      const ownMerchantIds = ownMerchants.map((m) => m.merchant_id);

      // If we already have entity_id filtering, further restrict it
      if (
        where.entity_id &&
        typeof where.entity_id === "object" &&
        "in" in where.entity_id
      ) {
        // Get the current list of IDs
        const currentIds = where.entity_id.in as string[];
        // Restrict to the intersection of current IDs and admin's merchants
        where.entity_id = {
          in: currentIds.filter((id) => ownMerchantIds.includes(id)),
        };
      } else {
        // Just restrict to admin's merchants
        where.entity_id = { in: ownMerchantIds };
      }
    }

    try {
      // Count total withdrawals
      const totalCount = await this.prisma.withdrawal.count({ where });

      // Calculate total withdrawal amount
      const amountResult = await this.prisma.withdrawal.aggregate({
        where,
        _sum: {
          amount: true,
        },
      });

      const totalAmount = amountResult._sum.amount
        ? Number(amountResult._sum.amount)
        : 0;

      const stats = new MerchantWithdrawalStatsDto({
        totalCount,
        totalAmount,
      });

      return stats;
    } catch (error) {
      this.loggingService.error(
        LogSeverity.ERROR,
        "AdminWithdrawalsService",
        LogAction.SYSTEM,
        `Failed to retrieve merchant withdrawal stats: ${(error as Error).message}`,
        null,
        (error as Error).stack,
      );
      throw new Error(
        `Failed to retrieve merchant withdrawal stats: ${(error as Error).message}`,
      );
    }
  }

  async exportMerchantWithdrawals(
    query: MerchantWithdrawalQueryDto,
    userId: string,
    role: RoleName,
  ): Promise<{ url: string }> {
    // Add skip and orderBy to satisfy the DTO requirements
    const exportQuery: MerchantWithdrawalQueryDto = {
      ...query,
      page: 1,
      pageSize: 10000,
      skip: 0,
      orderBy: { requested_at: "desc" as "desc" },
    };

    // Get data using the same filtering logic
    const { data: withdrawals } = await this.findAllMerchantWithdrawals(
      exportQuery,
      userId,
      role,
    );

    if (!withdrawals || withdrawals.length === 0) {
      throw new BadRequestException("No data found to export");
    }

    try {
      // Create properly formatted objects with all required properties
      const formattedWithdrawals = await Promise.all(
        withdrawals.map(async (w) => {
          // Get merchant info for this withdrawal
          const merchant = await this.prisma.merchant.findUnique({
            where: { merchant_id: w.entityId },
            select: { affiliate: true, company_name: true },
          });

          return {
            withdrawalId: w.withdrawalId,
            requestedAt: w.requestedAt
              ? new Date(w.requestedAt).toLocaleString()
              : "",
            affiliate: merchant?.affiliate || "",
            companyName: merchant?.company_name || "",
            accountHolder: w.accountHolder,
            bank: w.bank,
            accountNumber: w.accountNumber,
            amount: w.amount,
            status: w.status,
            processedAt: w.processedAt
              ? new Date(w.processedAt).toLocaleString()
              : "",
            withdrawalMethod: w.withdrawalMethod || "",
            notes: w.notes || "",
          };
        }),
      );

      // Define headers for Excel file
      const headers = [
        { key: "withdrawalId", header: "번호" },
        { key: "requestedAt", header: "신청일시" },
        { key: "affiliate", header: "가맹점" },
        { key: "companyName", header: "업체명" },
        { key: "accountHolder", header: "예금주" },
        { key: "bank", header: "은행" },
        { key: "accountNumber", header: "계좌번호" },
        { key: "amount", header: "금액" },
        { key: "status", header: "상태" },
        { key: "processedAt", header: "출금일시" },
        { key: "withdrawalMethod", header: "출금방식" },
        { key: "notes", header: "비고" },
      ];

      // Use the centralized DownloadService to create Excel file
      return this.downloadService.createExcelFile(
        formattedWithdrawals,
        "merchant-withdrawals-export",
        { headers },
        userId,
      );
    } catch (error) {
      this.loggingService.error(
        LogSeverity.ERROR,
        "AdminWithdrawalsService",
        LogAction.SYSTEM,
        `Failed to export merchant withdrawals: ${(error as Error).message}`,
        null,
        (error as Error).stack,
      );
      throw new Error(
        `Failed to export merchant withdrawals: ${(error as Error).message}`,
      );
    }
  }

  async updateMerchantWithdrawalStatus(
    withdrawalId: string,
    dto: UpdateMerchantWithdrawalDto,
    adminUserId: string,
  ) {
    const { status, withdrawalMethod, notes } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Get the withdrawal - convert string ID to number
      const withdrawal = await tx.withdrawal.findUnique({
        where: { withdrawal_id: parseInt(withdrawalId, 10) },
      });

      if (!withdrawal) {
        throw new NotFoundException(
          `Withdrawal request ${withdrawalId} not found.`,
        );
      }

      // Verify it's a merchant withdrawal
      if (withdrawal.entity_type !== EntityType.MERCHANT) {
        throw new BadRequestException("This is not a merchant withdrawal.");
      }

      // Basic state transition validation
      if (
        withdrawal.status === PrismaWithdrawalStatus.COMPLETED ||
        withdrawal.status === PrismaWithdrawalStatus.REJECTED ||
        withdrawal.status === PrismaWithdrawalStatus.FAILED
      ) {
        throw new BadRequestException(
          `Cannot update withdrawal already in '${withdrawal.status}' status.`,
        );
      }

      const oldStatus = withdrawal.status;

      // Balance adjustment for merchant
      if (status === PrismaWithdrawalStatus.COMPLETED) {
        const merchant = await tx.merchant.findUnique({
          where: { merchant_id: withdrawal.entity_id },
        });

        if (!merchant) {
          throw new InternalServerErrorException(
            "Merchant not found for balance update",
          );
        }

        const newBalance = new Decimal(merchant.balance).minus(
          withdrawal.amount,
        );

        if (newBalance.isNegative()) {
          throw new BadRequestException(
            "Insufficient merchant balance for completion.",
          );
        }

        await tx.merchant.update({
          where: { merchant_id: withdrawal.entity_id },
          data: { balance: newBalance },
        });
      }

      // Update the withdrawal record - using method field for method and processing_note for notes
      const updatedWithdrawal = await tx.withdrawal.update({
        where: { withdrawal_id: parseInt(withdrawalId, 10) },
        data: {
          status,
          method: withdrawalMethod as WithdrawalMethod,
          processing_note: notes || undefined,
          processed_at: new Date(),
          processed_by: adminUserId,
        },
        include: {
          requester: { select: { user_id: true, username: true } },
          processor: { select: { user_id: true, username: true } },
        },
      });

      // Get merchant details
      const merchant = await tx.merchant.findUnique({
        where: { merchant_id: withdrawal.entity_id },
        select: {
          merchant_id: true,
          affiliate: true,
          company_name: true,
        },
      });

      // Log the status change - using MERCHANT_BALANCE_WITHDRAW instead of ADMIN
      this.loggingService.log(
        LogSeverity.INFO,
        "AdminWithdrawalsService",
        LogAction.MERCHANT_BALANCE_WITHDRAW,
        `Merchant withdrawal ${withdrawalId} status changed from ${oldStatus} to ${status}`,
        adminUserId,
      );

      // Return formatted result
      return {
        withdrawalId: updatedWithdrawal.withdrawal_id,
        requestedAt: updatedWithdrawal.requested_at,
        processedAt: updatedWithdrawal.processed_at,
        accountDate: updatedWithdrawal.processed_at, // Use processed_at as account date
        merchantId: merchant?.merchant_id,
        affiliate: merchant?.affiliate,
        companyName: merchant?.company_name,
        accountHolder: updatedWithdrawal.account_holder,
        bank: updatedWithdrawal.bank_name,
        accountNumber: updatedWithdrawal.account_number,
        amount: Number(updatedWithdrawal.amount),
        status: updatedWithdrawal.status,
        withdrawalMethod: updatedWithdrawal.method, // Use method field
        notes: updatedWithdrawal.processing_note, // Notes from processing_note field
      };
    });
  }

  // AGENT WITHDRAWAL METHODS
  async findAllAgentWithdrawals(
    query: AgentWithdrawalQueryDto,
    userId: string,
    role: RoleName,
  ) {
    // First check if the user is a superadmin
    const isSuperAdmin = await this.adminService.isSuperAdmin(userId);

    const {
      page = 1,
      pageSize = 10,
      status,
      agentId,
      searchType,
      searchValue,
      dateCriteria = SearchCriteriaType.REQUESTED_DATE,
      startDate,
      endDate,
      selectedDate,
      orderByField = "requestedAt",
      orderDirection = "desc",
    } = query;

    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // Determine date field to filter on
    let dateField: string;
    switch (dateCriteria) {
      case SearchCriteriaType.PROCESSED_DATE:
        dateField = "processed_at";
        break;
      case SearchCriteriaType.ACCOUNT_DATE:
        dateField = "account_date";
        break;
      case SearchCriteriaType.REQUESTED_DATE:
      default:
        dateField = "requested_at";
        break;
    }

    // Build query conditions
    const where: Prisma.WithdrawalWhereInput = {
      entity_type: EntityType.AGENT,
    };

    if (status) where.status = status;

    if (agentId) {
      where.entity_id = agentId;
    }

    // Date handling logic
    where[dateField] = {};

    if (startDate && endDate) {
      // Case 1: Date range provided
      where[dateField]["gte"] = new Date(startDate + "T00:00:00.000Z");
      where[dateField]["lte"] = new Date(endDate + "T23:59:59.999Z");
    } else if (selectedDate) {
      // Case 2: Single day selected
      where[dateField]["gte"] = new Date(selectedDate + "T00:00:00.000Z");
      where[dateField]["lte"] = new Date(selectedDate + "T23:59:59.999Z");
    } else {
      // Case 3: Default to today
      const today = new Date().toISOString().split("T")[0];
      where[dateField]["gte"] = new Date(today + "T00:00:00.000Z");
      where[dateField]["lte"] = new Date(today + "T23:59:59.999Z");
    }

    // Search options - similar pattern to merchant but for agent entities
    if (searchType && searchValue) {
      if (searchType === AgentSearchType.USERNAME) {
        // First find agent IDs with matching name
        const matchingAgents = await this.prisma.agent.findMany({
          where: {
            agent_name: { contains: searchValue, mode: "insensitive" },
          },
          select: { agent_id: true },
        });

        const matchingRequests = await this.prisma.user.findMany({
          where: {
            username: { contains: searchValue, mode: "insensitive" },
          },
          select: { user_id: true },
        });

        // Combine agent IDs and user IDs for filtering
        const agentIds = matchingAgents.map((a) => a.agent_id);
        const userIds = matchingRequests.map((u) => u.user_id);

        where.OR = [
          { entity_id: { in: agentIds } },
          { requested_by: { in: userIds } },
        ];
      } else if (searchType === AgentSearchType.ACCOUNT_HOLDER) {
        where.account_holder = { contains: searchValue, mode: "insensitive" };
      } else if (searchType === AgentSearchType.ACCOUNT_NUMBER) {
        where.account_number = { contains: searchValue, mode: "insensitive" };
      }
    }

    // If not a superadmin, restrict to own agents
    if (!isSuperAdmin) {
      // Get agent IDs owned by this admin
      const ownAgents = await this.prisma.agent.findMany({
        where: { created_by: userId },
        select: { agent_id: true },
      });
      const ownAgentIds = ownAgents.map((a) => a.agent_id);

      // Apply agent ID filtering
      where.entity_id = { in: ownAgentIds };
    }

    // Determine order by
    const orderBy: Prisma.WithdrawalOrderByWithRelationInput = {};
    switch (orderByField) {
      case "processedAt":
        orderBy.processed_at = orderDirection.toLowerCase() as "asc" | "desc";
        break;
      case "amount":
        orderBy.amount = orderDirection.toLowerCase() as "asc" | "desc";
        break;
      // Handle fields that don't exist directly
      case "agentName":
      case "accountDate":
      case "requestedAt":
      default:
        orderBy.requested_at = orderDirection.toLowerCase() as "asc" | "desc";
        break;
    }

    try {
      const totalItems = await this.prisma.withdrawal.count({ where });
      const withdrawals = await this.prisma.withdrawal.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          requester: { select: { user_id: true, username: true } },
          processor: { select: { user_id: true, username: true } },
        },
      });

      // Process results
      const enhancedWithdrawals = await Promise.all(
        withdrawals.map(async (w) => {
          // Default agent info object
          const agentInfo: Record<string, string | null> = {
            agentId: null,
            agentName: null,
          };

          if (w.entity_type === EntityType.AGENT) {
            const agent = await this.prisma.agent.findUnique({
              where: { agent_id: w.entity_id },
              select: { agent_id: true, agent_name: true },
            });
            if (agent) {
              agentInfo.agentId = agent.agent_id;
              agentInfo.agentName = agent.agent_name;
            }
          }

          return {
            entityId: w.entity_id,
            entityType: w.entity_type,
            withdrawalId: w.withdrawal_id,
            // Withdrawal details
            requestedAt: w.requested_at,
            processedAt: w.processed_at,
            accountDate: w.processed_at, // Use processed_at as account date
            agentId: agentInfo.agentId,
            agentName: agentInfo.agentName,
            accountHolder: w.account_holder,
            bank: w.bank_name,
            accountNumber: w.account_number,
            amount: Number(w.amount),
            status: w.status,
            withdrawalMethod: w.method, // Add method field to the output
            approved: false,
            notes: w.processing_note,
            requester: w.requester
              ? {
                  userId: w.requester.user_id,
                  username: w.requester.username,
                }
              : null,
            processor: w.processor
              ? {
                  userId: w.processor.user_id,
                  username: w.processor.username,
                }
              : null,
            ...agentInfo,
          };
        }),
      );

      return {
        data: enhancedWithdrawals,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      };
    } catch (error) {
      this.loggingService.error(
        LogSeverity.ERROR,
        "AdminWithdrawalsService",
        LogAction.SYSTEM,
        `Failed to retrieve agent withdrawals: ${(error as Error).message}`,
        null,
        (error as Error).stack,
      );
      throw new Error(
        `Failed to retrieve agent withdrawals: ${(error as Error).message}`,
      );
    }
  }

  async getAgentWithdrawalStats(
    query: AgentWithdrawalQueryDto,
    userId: string,
    role: RoleName,
  ): Promise<AgentWithdrawalStatsDto> {
    const {
      status,
      agentId,
      searchType,
      searchValue,
      dateCriteria = SearchCriteriaType.REQUESTED_DATE,
      startDate,
      endDate,
      selectedDate,
    } = query;

    // First check if the user is a superadmin
    const isSuperAdmin = await this.adminService.isSuperAdmin(userId);

    // Determine date field to filter on
    let dateField: string;
    switch (dateCriteria) {
      case SearchCriteriaType.PROCESSED_DATE:
        dateField = "processed_at";
        break;
      case SearchCriteriaType.ACCOUNT_DATE:
        dateField = "account_date";
        break;
      case SearchCriteriaType.REQUESTED_DATE:
      default:
        dateField = "requested_at";
        break;
    }

    // Build query conditions
    const where: Prisma.WithdrawalWhereInput = {
      entity_type: EntityType.AGENT,
    };

    if (status) where.status = status;

    if (agentId) {
      where.entity_id = agentId;
    }

    // Date handling logic
    where[dateField] = {};

    if (startDate && endDate) {
      // Case 1: Date range provided
      where[dateField]["gte"] = new Date(startDate + "T00:00:00.000Z");
      where[dateField]["lte"] = new Date(endDate + "T23:59:59.999Z");
    } else if (selectedDate) {
      // Case 2: Single day selected
      where[dateField]["gte"] = new Date(selectedDate + "T00:00:00.000Z");
      where[dateField]["lte"] = new Date(selectedDate + "T23:59:59.999Z");
    } else {
      // Case 3: Default to today
      const today = new Date().toISOString().split("T")[0];
      where[dateField]["gte"] = new Date(today + "T00:00:00.000Z");
      where[dateField]["lte"] = new Date(today + "T23:59:59.999Z");
    }

    // Search options
    if (searchType && searchValue) {
      switch (searchType) {
        case AgentSearchType.USERNAME:
          where.OR = [
            {
              requester: {
                username: { contains: searchValue, mode: "insensitive" },
              },
            },
          ];
          break;
        case AgentSearchType.ACCOUNT_HOLDER:
          where.account_holder = {
            contains: searchValue,
            mode: "insensitive",
          };
          break;
        case AgentSearchType.ACCOUNT_NUMBER:
          where.account_number = {
            contains: searchValue,
            mode: "insensitive",
          };
          break;
      }
    }

    // If not a superadmin, restrict to own agents
    if (!isSuperAdmin) {
      // Get agent IDs owned by this admin
      const ownAgents = await this.prisma.agent.findMany({
        where: { created_by: userId },
        select: { agent_id: true },
      });
      const ownAgentIds = ownAgents.map((a) => a.agent_id);

      // Apply agent ID filtering
      where.entity_id = { in: ownAgentIds };
    }

    try {
      // Count total withdrawals
      const totalCount = await this.prisma.withdrawal.count({ where });

      // Calculate total withdrawal amount
      const amountResult = await this.prisma.withdrawal.aggregate({
        where,
        _sum: {
          amount: true,
        },
      });

      const totalAmount = amountResult._sum.amount
        ? Number(amountResult._sum.amount)
        : 0;

      const stats = new AgentWithdrawalStatsDto({
        totalCount,
        totalAmount,
      });

      // // Add formatted display string
      // stats.displayText = this.formatStatsForDisplay(stats);

      return stats;
    } catch (error) {
      this.loggingService.error(
        LogSeverity.ERROR,
        "AdminWithdrawalsService",
        LogAction.SYSTEM,
        `Failed to retrieve agent withdrawal stats: ${(error as Error).message}`,
        null,
        (error as Error).stack,
      );
      throw new Error(
        `Failed to retrieve agent withdrawal stats: ${(error as Error).message}`,
      );
    }
  }

  async exportAgentWithdrawals(
    query: AgentWithdrawalQueryDto,
    userId: string,
    role: RoleName,
  ): Promise<{ url: string }> {
    // Remove pagination for export - get all matching records
    const exportQuery: AgentWithdrawalQueryDto = {
      ...query,
      page: 1,
      pageSize: 10000,
      skip: 0,
      orderBy: { requested_at: "desc" },
    };

    // Get data using the same filtering logic
    const { data: withdrawals } = await this.findAllAgentWithdrawals(
      exportQuery,
      userId,
      role,
    );

    if (!withdrawals || withdrawals.length === 0) {
      throw new BadRequestException("No data found to export");
    }

    try {
      // For Excel export, we need to create our own properly typed objects with the fields we need
      const formattedWithdrawals = await Promise.all(
        withdrawals.map(async (w) => {
          // Get agent info for this withdrawal
          const agent =
            w.entityType === EntityType.AGENT
              ? await this.prisma.agent.findUnique({
                  where: { agent_id: w.entityId },
                  select: { agent_id: true, agent_name: true },
                })
              : null;

          // Return formatted object with columns matching the worksheet definition
          return {
            withdrawalId: w.withdrawalId,
            requestedAt: w.requestedAt
              ? new Date(w.requestedAt).toLocaleString()
              : "",
            agentName: agent?.agent_name || "",
            accountHolder: w.accountHolder,
            bank: w.bank,
            accountNumber: w.accountNumber,
            amount: w.amount,
            status: w.status,
            processedAt: w.processedAt
              ? new Date(w.processedAt).toLocaleString()
              : "",
            withdrawalMethod: w.withdrawalMethod || "",
            notes: w.notes || "",
          };
        }),
      );

      // Define headers for Excel file
      const headers = [
        { key: "withdrawalId", header: "번호" },
        { key: "requestedAt", header: "신청일시" },
        { key: "agentName", header: "에이전트" },
        { key: "accountHolder", header: "예금주" },
        { key: "bank", header: "은행" },
        { key: "accountNumber", header: "계좌번호" },
        { key: "amount", header: "금액" },
        { key: "status", header: "상태" },
        { key: "processedAt", header: "출금일시" },
        { key: "withdrawalMethod", header: "출금방식" },
        { key: "notes", header: "메모" },
      ];

      // Use the centralized DownloadService to create Excel file
      return this.downloadService.createExcelFile(
        formattedWithdrawals,
        "agent-withdrawals-export",
        { headers },
        userId,
      );
    } catch (error) {
      this.loggingService.error(
        LogSeverity.ERROR,
        "AdminWithdrawalsService",
        LogAction.SYSTEM,
        `Failed to export agent withdrawals: ${(error as Error).message}`,
        null,
        (error as Error).stack,
      );
      throw new Error(
        `Failed to export agent withdrawals: ${(error as Error).message}`,
      );
    }
  }

  async updateAgentWithdrawalStatus(
    withdrawalId: string,
    dto: UpdateAgentWithdrawalDto,
    adminUserId: string,
  ) {
    const { status, approved, notes, withdrawalMethod } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Get the withdrawal
      const withdrawal = await tx.withdrawal.findUnique({
        where: { withdrawal_id: parseInt(withdrawalId, 10) },
      });

      if (!withdrawal) {
        throw new NotFoundException(
          `Withdrawal request ${withdrawalId} not found.`,
        );
      }

      // Verify it's an agent withdrawal
      if (withdrawal.entity_type !== EntityType.AGENT) {
        throw new BadRequestException("This is not an agent withdrawal.");
      }

      // Basic state transition validation
      if (
        withdrawal.status === PrismaWithdrawalStatus.COMPLETED ||
        withdrawal.status === PrismaWithdrawalStatus.REJECTED ||
        withdrawal.status === PrismaWithdrawalStatus.FAILED
      ) {
        throw new BadRequestException(
          `Cannot update withdrawal already in '${withdrawal.status}' status.`,
        );
      }

      const oldStatus = withdrawal.status;

      // Update the withdrawal record - using method field for method and processing_note for notes
      const updatedWithdrawal = await tx.withdrawal.update({
        where: { withdrawal_id: parseInt(withdrawalId, 10) },
        data: {
          status,
          method: withdrawalMethod as WithdrawalMethod,
          processing_note: notes || undefined,
          processed_at: new Date(),
          processed_by: adminUserId,
        },
        include: {
          requester: { select: { user_id: true, username: true } },
          processor: { select: { user_id: true, username: true } },
        },
      });

      // Get agent details
      const agent = await tx.agent.findUnique({
        where: { agent_id: withdrawal.entity_id },
        select: {
          agent_id: true,
          agent_name: true,
        },
      });

      // Log the status change - using AGENT_BALANCE_WITHDRAW instead of ADMIN
      this.loggingService.log(
        LogSeverity.INFO,
        "AdminWithdrawalsService",
        LogAction.AGENT_BALANCE_WITHDRAW,
        `Agent withdrawal ${withdrawalId} status changed from ${oldStatus} to ${status}`,
        adminUserId,
      );

      // Return formatted result
      return {
        withdrawalId: updatedWithdrawal.withdrawal_id,
        requestedAt: updatedWithdrawal.requested_at,
        processedAt: updatedWithdrawal.processed_at,
        accountDate: updatedWithdrawal.processed_at, // Use processed_at as account date
        agentId: agent?.agent_id,
        agentName: agent?.agent_name,
        accountHolder: updatedWithdrawal.account_holder,
        bank: updatedWithdrawal.bank_name,
        accountNumber: updatedWithdrawal.account_number,
        amount: Number(updatedWithdrawal.amount),
        status: updatedWithdrawal.status,
        withdrawalMethod: updatedWithdrawal.method, // Use method field
        notes: updatedWithdrawal.processing_note, // Notes from processing_note field
      };
    });
  }

  private async getEntityDetails(
    entityType: string,
    entityId: number,
  ): Promise<Record<string, unknown>> {
    let entityDetails: Record<string, unknown> = {};
    // Implementation
    return entityDetails;
  }
}
