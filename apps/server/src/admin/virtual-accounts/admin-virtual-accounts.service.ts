import { Injectable } from "@nestjs/common";
import { VirtualAccountQueryDto } from "./dto/virtual-account-query.dto";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import {
  LogSeverity,
  Prisma,
  PrismaService,
  VirtualAccount,
} from "@ezpg/database";
import { LoggingService } from "../../core/logging/logging.service";
import { LogAction } from "src/core/logging/log-action.enum";

// import { LogSeverity } from "../../core/logging/log-severity.enum";

@Injectable()
export class AdminVirtualAccountsService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggingService,
  ) {
    this.logger.setContext(AdminVirtualAccountsService.name);
  }

  async findAll(
    query: VirtualAccountQueryDto,
  ): Promise<PaginatedResult<VirtualAccount>> {
    const {
      page,
      limit,
      skip,
      orderBy,
      search,
      merchantId,
      bankCode,
      accountNumber,
      accountType,
      issueStatus,
      registrationStatus,
    } = query;
    const where: Prisma.VirtualAccountWhereInput = {};

    if (merchantId) where.merchant_id = merchantId;
    if (bankCode) where.bank_code = bankCode;
    if (accountNumber) where.account_number = { contains: accountNumber }; // Use contains for partial match
    if (issueStatus) where.issue_status = issueStatus;

    if (search) {
      where.OR = [
        { merchant_id: { contains: search, mode: "insensitive" } },
        { account_number: { contains: search, mode: "insensitive" } },
        { user_name: { contains: search, mode: "insensitive" } },
      ];
    }

    try {
      const totalItems = await this.prisma.virtualAccount.count({ where });
      const accounts = await this.prisma.virtualAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      });
      return {
        data: accounts,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      };
    } catch (error) {
      this.logger.error(
        LogSeverity.ERROR,
        AdminVirtualAccountsService.name,
        LogAction.ADMIN_VIRTUAL_ACCOUNT_FIND_ALL_FAILED,
        `Failed to retrieve virtual accounts: ${(error as Error).message}`,
        null,
        (error as Error).stack,
      );
      throw new Error(
        `Failed to retrieve virtual accounts: ${(error as Error).message}`,
      );
    }
  }
}
