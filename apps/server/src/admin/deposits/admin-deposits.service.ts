import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, PrismaService, RoleName } from "@ezpg/database";
import { ExcelService } from "../../core/excel/excel.service";
import {
  AdminDepositsFilterDto,
  AdminDepositsItemDto,
  AdminDepositsResponseDto,
  AdminDepositsStatsDto,
} from "./dto";
import { ConfigService } from "@nestjs/config";
import { toCamelSync as toCamel } from "@ezpg/helpers";
import { Merchant, MerchantFee, User } from "@prisma/client";
import { DepositFormatType } from "../../common/enums/deposit-format-type.enum";
import { DepositStatusType } from "../../common/enums/deposit-status-type.enum";
import { DepositSearchFieldEnum } from "../../common/enums/deposit-search-field.enum";
import { DownloadService } from "../../core/download/download.service";

// Define types for merchant and virtual account objects
type MerchantType = {
  merchant_id: string;
  affiliate: string;
  created_by: string;
  creator?: { username: string };
  user?: { username: string };
  merchantFee?: {
    deposit_fee_rate: Prisma.Decimal | number;
  } | null;
};

type VirtualAccountType = {
  account_number: string;
  account_type: string;
};

type MerchantWithRelations = Merchant & {
  merchantFee?: MerchantFee | null;
  user?: User | null;
  creator?: User | null;
};

@Injectable()
export class AdminDepositsService {
  constructor(
    private prisma: PrismaService,
    private excelService: ExcelService,
    private configService: ConfigService,
    private downloadService: DownloadService,
  ) {}

  /**
   * Get a list of deposits with optional filtering and pagination
   * Admins can only see deposits from merchants they created
   * Superadmins can see all deposits or filter by admin
   */
  async getDeposits(
    filterDto: AdminDepositsFilterDto,
    userId?: string,
    userRole?: RoleName,
  ): Promise<AdminDepositsResponseDto> {
    const {
      merchantId,
      groupId,
      adminId,
      endDate,
      status,
      searchField = DepositSearchFieldEnum.TRANSACTION_ID,
      searchValue,
      page = 1,
      pageSize = 10,
    } = filterDto;

    // Build the where condition for Prisma
    const where: Prisma.TransactionWhereInput = {};

    // Filter by transaction_status if status is provided
    if (status) {
      where.transaction_status =
        status === DepositStatusType.DEPOSIT ? "0" : "1";
    }

    // If user is an admin (not superadmin), limit to their merchants
    if (userRole === RoleName.ADMIN && userId) {
      // Get merchants created by this admin
      const adminMerchants = await this.prisma.merchant.findMany({
        where: {
          created_by: userId,
          deleted_at: null, // Only include active merchants
        },
        select: { merchant_id: true },
      });

      const merchantIds = adminMerchants.map((m) => m.merchant_id);
      where.merchant_id = { in: merchantIds };
    }
    // If superadmin filtering by admin
    else if (userRole === RoleName.ADMIN && adminId) {
      // Get merchants created by specified admin
      const adminMerchants = await this.prisma.merchant.findMany({
        where: {
          created_by: adminId,
          deleted_at: null, // Only include active merchants
        },
        select: { merchant_id: true },
      });

      const merchantIds = adminMerchants.map((m) => m.merchant_id);
      where.merchant_id = { in: merchantIds };
    }

    // Filter by merchant group if provided
    if (groupId) {
      // Get merchants in the specified group
      const groupMerchants = await this.prisma.merchant.findMany({
        where: {
          group_id: groupId,
          deleted_at: null, // Ensure we only get active merchants
        },
        select: { merchant_id: true },
      });

      const groupMerchantIds = groupMerchants.map((m) => m.merchant_id);

      // If we already have merchant filters, use intersection
      if (
        where.merchant_id &&
        typeof where.merchant_id === "object" &&
        "in" in where.merchant_id
      ) {
        const currentIds = where.merchant_id.in as string[];
        where.merchant_id = {
          in: currentIds.filter((id) => groupMerchantIds.includes(id)),
        };
      } else {
        where.merchant_id = { in: groupMerchantIds };
      }
    }

    // Filter by specific merchant if provided
    if (merchantId) {
      where.merchant_id = merchantId;
    }

    // Only use endDate filtering - show all deposits up to and including endDate
    // Default to today's date if not provided
    const today = new Date().toISOString().slice(0, 10);
    const filterDate = endDate || today;
    const endDateFormatted = new Date(filterDate)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    where.transaction_date = { lte: endDateFormatted };

    // Apply search by field if provided
    if (searchField && searchValue) {
      switch (searchField) {
        case DepositSearchFieldEnum.TRANSACTION_ID:
          where.van_transaction_id = { contains: searchValue };
          break;
        case DepositSearchFieldEnum.BANK:
          where.bank_code = { contains: searchValue };
          break;
        case DepositSearchFieldEnum.VIRTUAL_ACCOUNT:
          where.account_number = { contains: searchValue };
          break;
        case DepositSearchFieldEnum.FORMAT:
          // We need to join with the virtual_account table to filter by account_type
          // This would require raw SQL or more complex join logic
          // For now, we'll filter after fetching data
          break;
        case DepositSearchFieldEnum.STATUS:
          where.transaction_status =
            searchValue === DepositStatusType.DEPOSIT ? "0" : "1";
          break;
        case DepositSearchFieldEnum.DEPOSITOR_NAME:
          where.depositor_name = { contains: searchValue };
          break;
        case DepositSearchFieldEnum.DEPOSIT_AMOUNT:
          // For amount searches, we need to convert the string to a number
          if (!isNaN(Number(searchValue))) {
            where.transaction_amount = BigInt(parseFloat(searchValue) * 100); // Convert to BigInt (cents)
          }
          break;
      }
    }

    // Get total count
    const total = await this.prisma.transaction.count({ where });

    // Get paginated transactions
    const transactions = await this.prisma.transaction.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ transaction_date: "desc" }, { deposit_time: "desc" }],
    });

    // Fetch merchant names for these transactions
    const merchantIds = [...new Set(transactions.map((t) => t.merchant_id))];
    const merchants = await this.prisma.merchant.findMany({
      where: {
        merchant_id: { in: merchantIds },
      },
      select: {
        merchant_id: true,
        affiliate: true,
        created_by: true, // To know which admin created this merchant
      },
    });

    // Fetch usernames for merchants and admins
    const userIds = [
      ...new Set([
        ...merchants.map((m) => m.merchant_id),
        ...merchants.map((m) => m.created_by),
      ]),
    ];
    const users = await this.prisma.user.findMany({
      where: { user_id: { in: userIds } },
      select: { user_id: true, username: true },
    });
    const userMap = new Map(users.map((u) => [u.user_id, u.username]));

    // Create a merchant lookup map for faster access
    const merchantMap = new Map(merchants.map((m) => [m.merchant_id, m]));

    // Fetch virtual accounts for format information
    const accountNumbers = transactions
      .filter((t) => t.account_number)
      .map((t) => t.account_number as string);

    const virtualAccounts = await this.prisma.virtualAccount.findMany({
      where: {
        account_number: { in: accountNumbers },
      },
      select: {
        account_number: true,
      },
    });

    // Create a virtual account lookup map
    const accountMap = new Map(
      virtualAccounts.map((va) => [va.account_number, va]),
    );

    // Fetch bank codes and names from bank table
    const bankCodes = [
      ...new Set(transactions.map((t) => t.bank_code).filter(Boolean)),
    ];
    const banks = await this.prisma.bank.findMany({
      where: {
        bank_code: { in: bankCodes as string[] },
      },
      select: {
        bank_code: true,
        bank_name: true,
      },
    });

    // Create a bank lookup map
    const bankMap = new Map(
      banks.map((bank) => [bank.bank_code, bank.bank_name]),
    );

    // Calculate stats based on the current filter (excluding pagination)
    // This provides summary information displayed at the top of the deposits management page
    const stats = await this.getDepositStats(
      undefined,
      filterDto.endDate,
      filterDto.merchantId,
      userId,
      userRole,
      filterDto.adminId,
      filterDto.groupId,
    );

    // Map to DTOs
    // These fields directly correspond to the columns displayed in the deposits table
    const depositDtos = transactions.map((transaction) => {
      const merchant = merchantMap.get(transaction.merchant_id);
      const merchantName = merchant ? merchant.affiliate : "";
      const merchantUsername = userMap.get(transaction.merchant_id) || "";
      const adminUsername = merchant
        ? userMap.get(merchant.created_by) || ""
        : "";

      // Get format from virtual account (set to STATIC for now)
      const format = DepositFormatType.STATIC;

      // Map transaction_status to StatusType
      const status =
        transaction.transaction_status === "0"
          ? DepositStatusType.DEPOSIT
          : DepositStatusType.CANCEL;

      // Calculate fees based on transaction amount
      const transactionAmount = Number(transaction.transaction_amount);
      const companyFee = Math.round(transactionAmount * (0 / 100));
      const agentFee = companyFee; // Assuming agent fee equals company fee, adjust as needed
      const settlementAmount = transactionAmount - companyFee - agentFee;

      // Format deposit date time
      const transactionDate = transaction.transaction_date; // YYYYMMDD format
      const depositTime = transaction.deposit_time || "000000"; // HHMMSS format
      const year = transactionDate.slice(0, 4);
      const month = transactionDate.slice(4, 6);
      const day = transactionDate.slice(6, 8);
      const hour = depositTime.slice(0, 2);
      const minute = depositTime.slice(2, 4);
      const second = depositTime.slice(4, 6);

      // Format date using YYYY/MM/DD HH:MM:SS format
      const depositDateTime = `${year}/${month}/${day} ${hour}:${minute}:${second}`;

      // Get bank name from bank map or fallback to bank code
      const bankName =
        bankMap.get(transaction.bank_code || "") || transaction.bank_code || "";

      // Use toCamel to convert from snake_case to camelCase for consistent frontend usage
      return toCamel({
        id: `${transaction.transaction_date}|${transaction.van_id}|${transaction.van_transaction_id}`,
        transaction_id: transaction.van_transaction_id,
        deposit_date_time: depositDateTime,
        merchant_id: transaction.merchant_id,
        merchant_name: merchantName,
        merchant_username: merchantUsername,
        admin_username: adminUsername,
        user_id: transaction.user_id || "",
        deposit_bank: bankName,
        virtual_account: transaction.account_number || "",
        format: format || DepositFormatType.STATIC, // Default to STATIC if unknown
        status: status,
        depositor_name: transaction.depositor_name || "",
        deposit_amount: transactionAmount,
        settlement_amount: settlementAmount,
        company_fee: companyFee,
        agent_fee: agentFee,
      }) as AdminDepositsItemDto;
    });

    // Filter by format if needed (for search)
    if (searchField === DepositSearchFieldEnum.FORMAT && searchValue) {
      const filteredDeposits = depositDtos.filter(
        (dto) => dto.format.toLowerCase() === searchValue.toLowerCase(),
      );

      return {
        data: filteredDeposits,
        meta: {
          total: filteredDeposits.length, // Adjusted total
          page,
          pageSize,
          totalPages: Math.ceil(filteredDeposits.length / pageSize),
        },
        stats,
      };
    }

    return {
      data: depositDtos,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      stats,
    };
  }

  /**
   * Get deposit statistics with optional filtering
   * Respects admin permissions (admins see only their merchants' stats)
   *
   * Used by the deposits management component to display summary statistics
   * at the top of the page, showing total amounts and counts.
   */
  async getDepositStats(
    startDate?: string,
    endDate?: string,
    merchantId?: string,
    userId?: string,
    userRole?: RoleName,
    adminId?: string,
    groupId?: number,
  ): Promise<AdminDepositsStatsDto> {
    // Build the where condition for Prisma
    const where: Prisma.TransactionWhereInput = {
      // Filter for deposit transactions only
      transaction_status: "0",
    };

    // If user is an admin (not superadmin), limit to their merchants
    if (userRole === RoleName.ADMIN && userId) {
      // Get merchants created by this admin
      const adminMerchants = await this.prisma.merchant.findMany({
        where: {
          created_by: userId,
          deleted_at: null, // Only include active merchants
        },
        select: { merchant_id: true },
      });

      const merchantIds = adminMerchants.map((m) => m.merchant_id);
      where.merchant_id = { in: merchantIds };
    }
    // If superadmin filtering by admin
    else if (userRole === RoleName.ADMIN && adminId) {
      // Get merchants created by specified admin
      const adminMerchants = await this.prisma.merchant.findMany({
        where: {
          created_by: adminId,
          deleted_at: null, // Only include active merchants
        },
        select: { merchant_id: true },
      });

      const merchantIds = adminMerchants.map((m) => m.merchant_id);
      where.merchant_id = { in: merchantIds };
    }

    // Filter by merchant group if provided
    if (groupId) {
      // Get merchants in the specified group
      const groupMerchants = await this.prisma.merchant.findMany({
        where: {
          group_id: groupId,
          deleted_at: null, // Ensure we only get active merchants
        },
        select: { merchant_id: true },
      });

      const groupMerchantIds = groupMerchants.map((m) => m.merchant_id);

      // If we already have merchant filters, use intersection
      if (
        where.merchant_id &&
        typeof where.merchant_id === "object" &&
        "in" in where.merchant_id
      ) {
        const currentIds = where.merchant_id.in as string[];
        where.merchant_id = {
          in: currentIds.filter((id) => groupMerchantIds.includes(id)),
        };
      } else {
        where.merchant_id = { in: groupMerchantIds };
      }
    }

    if (merchantId) {
      where.merchant_id = merchantId;
    }

    // Date filtering
    const today = new Date().toISOString().slice(0, 10);
    const filterEndDate = endDate || today;
    const endDateFormatted = new Date(filterEndDate)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

    if (startDate) {
      const startDateFormatted = new Date(startDate)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");
      where.transaction_date = {
        gte: startDateFormatted,
        lte: endDateFormatted,
      };
    } else {
      where.transaction_date = { lte: endDateFormatted };
    }

    // Get total count and sum of transaction amounts
    const [count, transactions] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        select: {
          merchant_id: true,
          transaction_amount: true,
        },
      }),
    ]);

    // Calculate total amounts and fees
    let totalAmount = 0;
    let totalCompanyFee = 0;
    let totalAgentFee = 0;

    for (const transaction of transactions) {
      const amount = Number(transaction.transaction_amount);
      totalAmount += amount;

      const companyFee = Math.round(amount * (0 / 100));
      totalCompanyFee += companyFee;

      // Assuming agent fee equals company fee
      totalAgentFee += companyFee;
    }

    // Return stats in the format expected by the frontend
    return {
      totalDepositCount: count,
      totalDepositAmount: totalAmount,
      totalCompanyFee: totalCompanyFee,
      totalAgentFee: totalAgentFee,
    };
  }

  /**
   * Get a specific deposit by ID
   * Respects admin permissions (admins can only see their merchants' deposits)
   *
   * Used by the deposit-details.tsx component to display detailed information
   * about a single deposit when the user clicks the "View" button.
   */
  async getDepositById(
    id: string,
    userId?: string,
    userRole?: RoleName,
  ): Promise<AdminDepositsItemDto> {
    // Parse the composite ID back into its components
    const [transactionDate, vanId, vanTransactionId] = id.split("|");

    if (!transactionDate || !vanId || !vanTransactionId) {
      throw new NotFoundException(`Invalid deposit ID: ${id}`);
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: {
        transaction_date_van_id_van_transaction_id: {
          transaction_date: transactionDate,
          van_id: vanId,
          van_transaction_id: vanTransactionId,
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Deposit with ID ${id} not found`);
    }

    // Fetch the merchant for this transaction
    const merchant = await this.prisma.merchant.findUnique({
      where: {
        merchant_id: transaction.merchant_id,
      },
      select: {
        merchant_id: true,
        affiliate: true,
        created_by: true,
      },
    });

    // Check if admin has access to this merchant's deposits
    if (
      userRole === RoleName.ADMIN &&
      userId &&
      merchant?.created_by !== userId
    ) {
      throw new ForbiddenException(
        "You do not have permission to view this deposit",
      );
    }

    // Fetch bank information
    let bankName = transaction.bank_code || "";
    if (transaction.bank_code) {
      const bank = await this.prisma.bank.findUnique({
        where: {
          bank_code: transaction.bank_code,
        },
        select: {
          bank_name: true,
        },
      });

      if (bank) {
        bankName = bank.bank_name;
      }
    }

    // Fetch usernames for merchant and admin
    const users = await this.prisma.user.findMany({
      where: {
        user_id: {
          in: [transaction.merchant_id, merchant?.created_by].filter(
            Boolean,
          ) as string[],
        },
      },
      select: { user_id: true, username: true },
    });
    const userMap = new Map(users.map((u) => [u.user_id, u.username]));

    // Fetch virtual account for format information
    let format = DepositFormatType.STATIC; // Default

    // Map transaction_status to StatusType
    const status =
      transaction.transaction_status === "0"
        ? DepositStatusType.DEPOSIT
        : DepositStatusType.CANCEL;

    // Calculate fees based on transaction amount
    const transactionAmount = Number(transaction.transaction_amount);
    const companyFee = Math.round(transactionAmount * (0 / 100));
    const agentFee = companyFee; // Assuming agent fee equals company fee
    const settlementAmount = transactionAmount - companyFee - agentFee;

    // Format deposit date time
    const transactionDateStr = transaction.transaction_date; // YYYYMMDD format
    const depositTime = transaction.deposit_time || "000000"; // HHMMSS format
    const year = transactionDateStr.slice(0, 4);
    const month = transactionDateStr.slice(4, 6);
    const day = transactionDateStr.slice(6, 8);
    const hour = depositTime.slice(0, 2);
    const minute = depositTime.slice(2, 4);
    const second = depositTime.slice(4, 6);

    // Format date using YYYY/MM/DD HH:MM:SS format
    const depositDateTime = `${year}/${month}/${day} ${hour}:${minute}:${second}`;

    return {
      id: id,
      transactionId: transaction.van_transaction_id,
      depositDateTime: depositDateTime,
      merchantId: transaction.merchant_id,
      merchantName: merchant?.affiliate || "",
      merchantUsername: userMap.get(transaction.merchant_id) || "",
      adminUsername: userMap.get(merchant?.created_by) || "",
      userId: transaction.user_id || "",
      depositBank: bankName,
      virtualAccount: transaction.account_number || "",
      format: format,
      status: status,
      depositorName: transaction.depositor_name || "",
      depositAmount: transactionAmount,
      settlementAmount: settlementAmount,
      companyFee: companyFee,
      agentFee: agentFee,
    };
  }

  /**
   * Export deposits to Excel
   * Respects admin permissions
   *
   * Used by the deposits management component when the user clicks the
   * "Export to Excel" button. Returns a URL that the frontend can use
   * to download the generated Excel file.
   */
  async exportDepositsToExcel(
    filterDto: AdminDepositsFilterDto,
    userId: string,
    userRole: RoleName,
  ): Promise<{ url: string }> {
    // Remove pagination for export
    const { page, pageSize, ...filters } = filterDto;

    // Create a new filter without pagination
    const exportFilter: AdminDepositsFilterDto = { ...filters };

    // Get all deposits matching the filter
    const { data: depositDtos } = await this.getDeposits(
      {
        ...exportFilter,
        page: 1,
        pageSize: 1000, // Set a larger limit for export
      },
      userId,
      userRole,
    );

    // Define headers for Excel file
    const headers = [
      { key: "id", header: "번호" },
      { key: "transactionId", header: "거래 ID" },
      { key: "depositDateTime", header: "입금일시" },
      { key: "merchantId", header: "가맹점" },
      { key: "merchantName", header: "업체명" },
      { key: "userId", header: "아이디" },
      { key: "depositBank", header: "입금은행" },
      { key: "virtualAccount", header: "가상계좌" },
      { key: "format", header: "형식" },
      { key: "status", header: "상태" },
      { key: "depositorName", header: "입금자명" },
      { key: "depositAmount", header: "입금금액" },
      { key: "settlementAmount", header: "정산금액" },
      { key: "companyFee", header: "본사수수료" },
      { key: "agentFee", header: "에이전트수수료" },
    ];

    // Use the download service to create the Excel file
    return this.downloadService.createExcelFile(
      depositDtos as unknown as Record<string, unknown>[],
      "deposits-export",
      { headers },
      userId,
    );
  }
}
