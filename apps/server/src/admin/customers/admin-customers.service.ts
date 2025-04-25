import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { LogSeverity, Prisma, PrismaService } from "@ezpg/database";
import { AdminCustomerQueryDto } from "./dto/customer-query.dto";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { LoggingService } from "../../core/logging/logging.service";
import { LogAction } from "../../core/logging/log-action.enum";

interface AdminCustomerData {
  user_id: string | null;
  merchant_id: string | null;
  depositor_name: string | null;
  virtual_account_user_name: string | null;
  first_activity: string | null;
  last_activity: string | null;
  total_deposit_amount: string | null;
  deposit_count: string | null;
}

@Injectable()
export class AdminCustomersService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggingService,
  ) {}

  async findAll(
    query: AdminCustomerQueryDto,
  ): Promise<PaginatedResult<AdminCustomerData>> {
    const { page, limit, skip, search, merchantId } = query;
    // Use Prisma queryRaw for flexibility with read-only tables and aggregations
    let merchantFilter = Prisma.empty;
    if (merchantId)
      merchantFilter = Prisma.sql`AND t.merchant_id = ${merchantId}`;
    let searchFilter = Prisma.empty;
    if (search)
      searchFilter = Prisma.sql`AND (t.user_id ILIKE ${"%" + search + "%"} OR t.depositor_name ILIKE ${"%" + search + "%"} OR va.userName ILIKE ${"%" + search + "%"})`;

    try {
      const countResult: { count: bigint }[] = await this.prisma.$queryRaw`
                SELECT COUNT(DISTINCT t.user_id)
                FROM transaction t LEFT JOIN virtual_account va ON t.account_number = va.account_number AND t.bank_code = va.bank_code AND va.merchant_id = t.merchant_id
                WHERE 1=1 ${merchantFilter} ${searchFilter}`;
      const totalItems = Number(countResult[0].count);

      const customerData = await this.prisma.$queryRaw<AdminCustomerData[]>`
                SELECT DISTINCT ON (t.user_id) t.user_id, t.merchant_id, MAX(t.depositor_name) as depositor_name, MAX(va.userName) as virtual_account_user_name,
                       MIN(t.transaction_date || t.deposit_time) as first_activity, MAX(t.transaction_date || t.deposit_time) as last_activity,
                       SUM(CASE WHEN t.transaction_status = '0' THEN t.transaction_amount ELSE 0 END) as total_deposit_amount,
                       COUNT(CASE WHEN t.transaction_status = '0' THEN 1 END) as deposit_count
                FROM transaction t LEFT JOIN virtual_account va ON t.account_number = va.account_number AND t.bank_code = va.bank_code AND va.merchant_id = t.merchant_id
                WHERE 1=1 ${merchantFilter} ${searchFilter}
                GROUP BY t.user_id, t.merchant_id ORDER BY t.user_id, last_activity DESC LIMIT ${limit} OFFSET ${skip}`;

      const formattedData: AdminCustomerData[] = customerData.map((row) => ({
        user_id: row.user_id,
        merchant_id: row.merchant_id,
        depositor_name: row.depositor_name,
        virtual_account_user_name: row.virtual_account_user_name,
        first_activity: row.first_activity,
        last_activity: row.last_activity,
        total_deposit_amount: row.total_deposit_amount?.toString() ?? "0",
        deposit_count: row.deposit_count?.toString() ?? "0",
      }));

      return {
        data: formattedData,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      };
    } catch (error) {
      let stack: string | undefined;
      let message = "Failed to retrieve customer list.";
      if (error instanceof Error) {
        stack = error.stack;
        message = `Failed to retrieve admin customer view: ${error.message}`;
      }
      this.logger.error(
        LogSeverity.ERROR,
        AdminCustomersService.name,
        LogAction.ADMIN_CUSTOMER_OPERATION_FAILED,
        message,
        null,
        stack,
      );
      throw new InternalServerErrorException(
        "Failed to retrieve customer list.",
      );
    }
  }
}
