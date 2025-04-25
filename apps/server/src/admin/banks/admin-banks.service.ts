import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { LogSeverity, Prisma, PrismaService } from "@ezpg/database";
import {
  BankQueryDto,
  BankResponseDto,
  CreateBankDto,
  UpdateBankDto,
} from "./dto";
import { PaginatedResponse } from "../../common/dto/paginated-response.dto";
import { LoggingService } from "../../core/logging/logging.service";
import { LogAction } from "../../core/logging/log-action.enum";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";

@Injectable()
export class AdminBanksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Create a new bank
   *
   * @param createBankDto - Data to create the bank
   * @param user - Admin user creating the bank
   * @returns The created bank
   */
  async create(
    createBankDto: CreateBankDto,
    user: JwtUser,
  ): Promise<BankResponseDto> {
    try {
      // Check if bank with the same code already exists
      const existingBank = await this.prisma.bank.findUnique({
        where: { bank_code: createBankDto.bank_code },
      });

      if (existingBank) {
        throw new ConflictException(
          `Bank with code ${createBankDto.bank_code} already exists.`,
        );
      }

      // Create the new bank
      const bank = await this.prisma.bank.create({
        data: {
          bank_code: createBankDto.bank_code,
          bank_name: createBankDto.bank_name,
          is_active:
            createBankDto.is_active !== undefined
              ? createBankDto.is_active
              : true,
        },
      });

      // Log the bank creation
      await this.loggingService.log(
        LogSeverity.INFO,
        "AdminBanksService",
        LogAction.BANK_CREATE,
        { bankCode: bank.bank_code, bankName: bank.bank_name },
        user.userId,
      );

      return this.mapBankToResponse(bank);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to create bank.", error);
    }
  }

  /**
   * Get all banks with pagination
   *
   * @param query - Query parameters
   * @returns Paginated list of banks
   */
  async findAll(
    query: BankQueryDto,
  ): Promise<PaginatedResponse<BankResponseDto>> {
    const { page = 1, limit = 10, isActive, search } = query;

    const where: Prisma.BankWhereInput = {};

    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    if (search) {
      where.OR = [
        { bank_code: { contains: search, mode: "insensitive" } },
        { bank_name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, banks] = await Promise.all([
      this.prisma.bank.count({ where }),
      this.prisma.bank.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { bank_name: "asc" },
      }),
    ]);

    // Get count of groups for each bank
    const banksWithCounts = await Promise.all(
      banks.map(async (bank) => {
        const groupCount = await this.prisma.merchantGroup.count({
          where: {
            bank_code: bank.bank_code,
          } as Prisma.MerchantGroupWhereInput,
        });
        return this.mapBankToResponse(bank, groupCount);
      }),
    );

    return {
      data: banksWithCounts,
      items: banksWithCounts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    } as PaginatedResponse<BankResponseDto>;
  }

  /**
   * Get a bank by code
   *
   * @param code - Bank code
   * @returns Bank details
   */
  async findOne(code: string): Promise<BankResponseDto> {
    const bank = await this.prisma.bank.findUnique({
      where: { bank_code: code },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with code ${code} not found.`);
    }

    const groupCount = await this.prisma.merchantGroup.count({
      where: {
        bank_code: bank.bank_code,
      } as Prisma.MerchantGroupWhereInput,
    });

    return this.mapBankToResponse(bank, groupCount);
  }

  /**
   * Update a bank
   *
   * @param code - Bank code
   * @param updateBankDto - Data to update
   * @param user - Admin user updating the bank
   * @returns Updated bank
   */
  async update(
    code: string,
    updateBankDto: UpdateBankDto,
    user: JwtUser,
  ): Promise<BankResponseDto> {
    try {
      // Check if bank exists
      const existingBank = await this.prisma.bank.findUnique({
        where: { bank_code: code },
      });

      if (!existingBank) {
        throw new NotFoundException(`Bank with code ${code} not found.`);
      }

      // Update the bank
      const bank = await this.prisma.bank.update({
        where: { bank_code: code },
        data: {
          bank_name: updateBankDto.bank_name,
          is_active: updateBankDto.is_active,
        },
      });

      // Log the bank update
      await this.loggingService.log(
        LogSeverity.INFO,
        "AdminBanksService",
        LogAction.BANK_UPDATE,
        {
          before: {
            bankName: existingBank.bank_name,
            isActive: existingBank.is_active,
          },
          after: { bankName: bank.bank_name, isActive: bank.is_active },
          targetId: code,
        },
        user.userId,
      );

      const groupCount = await this.prisma.merchantGroup.count({
        where: {
          bank_code: bank.bank_code,
        } as Prisma.MerchantGroupWhereInput,
      });

      return this.mapBankToResponse(bank, groupCount);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to update bank.", error);
    }
  }

  /**
   * Delete a bank
   *
   * @param code - Bank code
   * @param user - Admin user deleting the bank
   */
  async remove(code: string, user: JwtUser): Promise<void> {
    try {
      // Check if bank exists
      const existingBank = await this.prisma.bank.findUnique({
        where: { bank_code: code },
      });

      if (!existingBank) {
        throw new NotFoundException(`Bank with code ${code} not found.`);
      }

      // Check if any merchant groups are using this bank
      const groupCount = await this.prisma.merchantGroup.count({
        where: {
          bank_code: code,
        } as Prisma.MerchantGroupWhereInput,
      });

      if (groupCount > 0) {
        throw new ConflictException(
          `Cannot delete bank with code ${code}. It is being used by ${groupCount} merchant groups.`,
        );
      }

      // Delete the bank
      await this.prisma.bank.delete({
        where: { bank_code: code },
      });

      // Log the bank deletion
      await this.loggingService.log(
        LogSeverity.WARNING,
        "AdminBanksService",
        LogAction.BANK_DELETE,
        { bankCode: code, bankName: existingBank.bank_name },
        user.userId,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to delete bank.", error);
    }
  }

  /**
   * Map a bank entity to a response DTO
   *
   * @param bank - Bank entity
   * @param groupCount - Optional count of groups using this bank
   * @returns Bank response DTO
   */
  private mapBankToResponse(
    bank: Prisma.BankGetPayload<{}>,
    groupCount?: number,
  ): BankResponseDto {
    return {
      bankCode: bank.bank_code,
      bankName: bank.bank_name,
      isActive: bank.is_active,
      groupCount: groupCount,
      createdAt: bank.created_at,
      updatedAt: bank.updated_at,
    };
  }
}
