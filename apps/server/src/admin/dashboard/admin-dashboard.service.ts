import { Injectable } from "@nestjs/common";
import {
  AgentStatus,
  EntityType,
  LogSeverity,
  MerchantStatus,
  NoticeStatus,
  NoticeType,
  Prisma,
  PrismaService,
  WithdrawalStatus,
} from "@ezpg/database";
import {
  ActivityType,
  AdminDashboardActivityDto,
  AdminDashboardAnnouncementDto,
  AdminDashboardMerchantPerformanceDto,
  AdminDashboardRecentTransactionsDto,
  AdminDashboardSummaryStatsDto,
  AdminDashboardTimezoneStatsDto,
  AdminDashboardTransactionTrendsDto,
  TransactionType,
  UserType,
} from "./dto";
import { LoggingService } from "../../core/logging/logging.service";
import { LogAction } from "../../core/logging/log-action.enum";
import { SortOrder, TimePeriod } from "@ezpg/types";
import { JwtUser } from "src/auth/interfaces/jwt-user.interface"; // Assuming JwtUser has userId and username
import { Decimal } from "@prisma/client/runtime/library";
import { AdminAdminsService } from "../admins/admin-admins.service"; // Import AdminAdminsService

@Injectable()
export class AdminDashboardService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggingService,
    private readonly adminAdminsService: AdminAdminsService, // Inject AdminAdminsService
  ) {}

  // Updated service implementation
  async getSummary(
    user: JwtUser,
    period: TimePeriod = TimePeriod.DAILY,
    endDate?: string,
    viewAsAdminId?: string,
  ): Promise<AdminDashboardSummaryStatsDto> {
    const logDetails = JSON.stringify({
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
      endDate: endDate,
    });

    this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
      message: `[getSummary] User: ${user.userId}, Period: ${period}, EndDate: ${endDate}, ViewAs: ${viewAsAdminId}`,
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
      endDate: endDate,
    });
    // Use helper method to get targeting info
    const { targetAdminId, filterMerchantIds, filterMerchantInternalIds } =
      await this._getAdminTargetingInfo(user, viewAsAdminId);

    const end = endDate ? new Date(endDate) : new Date();
    const start = this.setDateRangeForPeriod(end, period);
    const prevEnd = new Date(start);
    const prevStart = this.setDateRangeForPeriod(prevEnd, period);
    const startStr = start.toISOString().slice(0, 10).replace(/-/g, "");
    const endStr = end.toISOString().slice(0, 10).replace(/-/g, "");

    // --- Deposit Stats (Apply filter if needed) ---
    const depositWhereClause: Prisma.TransactionSummaryWhereInput = {
      transaction_date: { gte: startStr, lte: endStr },
    };
    if (filterMerchantIds !== undefined) {
      depositWhereClause.merchant_id = { in: filterMerchantIds };
    }
    const currentPeriodDepositStats =
      await this.prisma.transactionSummary.aggregate({
        where: depositWhereClause,
        _sum: { deposit_count: true },
      });

    const prevDepositWhereClause: Prisma.TransactionSummaryWhereInput = {
      transaction_date: {
        gte: prevStart.toISOString().slice(0, 10).replace(/-/g, ""),
        lte: prevEnd.toISOString().slice(0, 10).replace(/-/g, ""),
      },
    };
    if (filterMerchantIds !== undefined) {
      prevDepositWhereClause.merchant_id = { in: filterMerchantIds };
    }
    const prevPeriodDepositStats =
      await this.prisma.transactionSummary.aggregate({
        where: prevDepositWhereClause,
        _sum: { deposit_count: true },
      });

    // --- Withdrawal Stats (Apply filter if needed) ---
    const withdrawalWhereClause: Prisma.WithdrawalWhereInput = {
      status: WithdrawalStatus.COMPLETED,
      processed_at: { gte: start, lt: end },
    };
    if (filterMerchantInternalIds !== undefined) {
      withdrawalWhereClause.entity_type = EntityType.MERCHANT;
      withdrawalWhereClause.entity_id = { in: filterMerchantInternalIds };
      // TODO: Extend if filtering by agents is needed
    }
    const currentWithdrawalCount = await this.prisma.withdrawal.count({
      where: withdrawalWhereClause,
    });

    const prevWithdrawalWhereClause: Prisma.WithdrawalWhereInput = {
      ...withdrawalWhereClause,
    }; // Copy base
    prevWithdrawalWhereClause.processed_at = { gte: prevStart, lt: prevEnd }; // Adjust date range
    const prevWithdrawalCount = await this.prisma.withdrawal.count({
      where: prevWithdrawalWhereClause,
    });

    // --- Merchant Count (Apply filter if needed) ---
    const merchantWhereClause: Prisma.MerchantWhereInput = {};
    if (targetAdminId !== null) {
      merchantWhereClause.created_by = targetAdminId;
    }
    const prevMerchantCount = await this.prisma.merchant.count({
      where: { ...merchantWhereClause, created_at: { lt: start } },
    });
    const currentMerchantCount = await this.prisma.merchant.count({
      where: merchantWhereClause,
    });

    // --- Calculations (remain the same) ---
    const merchantCountChange =
      prevMerchantCount > 0
        ? Math.round(
            ((currentMerchantCount - prevMerchantCount) / prevMerchantCount) *
              100,
          )
        : currentMerchantCount > 0
          ? 100
          : 0;

    const depositCount = Number(
      currentPeriodDepositStats._sum.deposit_count ?? 0,
    );
    const prevDepositCount = Number(
      prevPeriodDepositStats._sum.deposit_count ?? 0,
    );

    const withdrawalCount = currentWithdrawalCount;

    const depositChangePercent =
      prevDepositCount > 0
        ? Math.round(
            ((depositCount - prevDepositCount) / prevDepositCount) * 100,
          )
        : depositCount > 0
          ? 100
          : 0;

    const withdrawalChangePercent =
      prevWithdrawalCount > 0
        ? Math.round(
            ((withdrawalCount - prevWithdrawalCount) / prevWithdrawalCount) *
              100,
          )
        : withdrawalCount > 0
          ? 100
          : 0;

    // Calculate the total balance by summing up all merchant and agent balances
    // Get the sum of all merchant balances
    const merchantBalanceSum = await this.prisma.merchant.aggregate({
      where: {
        status: { not: MerchantStatus.INACTIVE },
        ...(filterMerchantInternalIds !== undefined && {
          merchant_id: { in: filterMerchantInternalIds },
        }),
      },
      _sum: { balance: true },
    });

    // Get the sum of all agent balances
    const agentBalanceSum = await this.prisma.agent.aggregate({
      where: {
        status: { not: AgentStatus.INACTIVE },
        ...(targetAdminId !== null && {
          created_by: targetAdminId,
        }),
      },
      _sum: { balance: true },
    });

    // Sum up the merchant and agent balances
    const totalBalance = new Decimal(merchantBalanceSum._sum.balance || 0).add(
      new Decimal(agentBalanceSum._sum.balance || 0),
    );

    // Convert to millions (assuming balance is in KRW)
    const totalBalanceInMillions = Number(
      (totalBalance.toNumber() / 1000000).toFixed(1),
    );

    return {
      totalDepositCount: depositCount,
      depositChangePercent,
      totalWithdrawalCount: withdrawalCount,
      withdrawalChangePercent,
      merchantCount: currentMerchantCount,
      merchantCountChange,
      totalBalance: totalBalanceInMillions,
      period,
    };
  }

  async getTransactionTrends(
    user: JwtUser,
    period: TimePeriod = TimePeriod.MONTHLY,
    endDate?: string,
    viewAsAdminId?: string,
  ): Promise<AdminDashboardTransactionTrendsDto> {
    const logDetails = JSON.stringify({
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
      endDate: endDate,
    });

    this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
      message: `[getTransactionTrends] User: ${user.userId}, Period: ${period}, EndDate: ${endDate}, ViewAs: ${viewAsAdminId}`,
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
      endDate: endDate,
    });
    // Use helper method to get targeting info
    const { targetAdminId, filterMerchantIds, filterMerchantInternalIds } =
      await this._getAdminTargetingInfo(user, viewAsAdminId);

    const end = endDate ? new Date(endDate) : new Date();
    // Adjust end date for precise window ending
    if (period === TimePeriod.DAILY) {
      // No adjustment needed if using a precise start (24h before end)
    } else {
      // Adjust end date to include the full day/period end for other periods
      end.setHours(23, 59, 59, 999);
      if (period === TimePeriod.WEEKLY) {
        end.setDate(end.getDate() + (6 - end.getDay())); // End of week (Saturday)
      } else if (period === TimePeriod.MONTHLY) {
        end.setMonth(end.getMonth() + 1, 0); // Last day of month
      } else if (period === TimePeriod.YEARLY) {
        end.setMonth(11, 31); // Last day of year
      }
    }

    const start = this.setDateRangeForPeriod(end, period); // Calculates rolling start
    this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
      message: `[getTransactionTrends] Period: ${period}, Start: ${start.toISOString()}, End: ${end.toISOString()}`,
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
      start: start.toISOString(),
      end: end.toISOString(),
    });

    // --- Data Fetching ---
    let depositPromise;
    if (period === TimePeriod.DAILY) {
      // Fetch individual DEPOSITS for hourly grouping
      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[getTransactionTrends] Fetching hourly deposit data (Transaction table)...`,
        userId: user.userId,
        viewAsAdmin: viewAsAdminId,
        period: period,
      });
      depositPromise = this.prisma.transaction.findMany({
        where: {
          transaction_status: "0",
          updated_at: { gte: start, lt: end },
          // Apply merchant filter if needed
          ...(filterMerchantIds !== undefined && {
            merchant_id: { in: filterMerchantIds },
          }),
        },
        select: { updated_at: true },
      });
    } else {
      // Fetch daily summaries for other periods
      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[getTransactionTrends] Fetching daily deposit summaries (TransactionSummary table)...`,
        userId: user.userId,
        viewAsAdmin: viewAsAdminId,
        period: period,
      });
      const startStr = start.toISOString().slice(0, 10).replace(/-/g, "");
      const endStr = end.toISOString().slice(0, 10).replace(/-/g, "");
      depositPromise = this.prisma.transactionSummary.findMany({
        where: {
          transaction_date: { gte: startStr, lte: endStr },
          // Apply merchant filter if needed
          ...(filterMerchantIds !== undefined && {
            merchant_id: { in: filterMerchantIds },
          }),
        },
        select: { transaction_date: true, deposit_count: true },
      });
    }

    // Fetch COMPLETED withdrawal data (always has timestamp)
    this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
      message: `[getTransactionTrends] Fetching withdrawal data...`,
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
    });
    const withdrawalPromise = this.prisma.withdrawal.findMany({
      where: {
        status: WithdrawalStatus.COMPLETED,
        processed_at: { gte: start, lt: end },
      },
      select: { processed_at: true },
      orderBy: { processed_at: "asc" },
    });

    // Execute fetches in parallel
    const [depositResults, withdrawalRawData] = await Promise.all([
      depositPromise,
      withdrawalPromise,
    ]);
    this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
      message: `[getTransactionTrends] Fetched ${depositResults.length} deposit items and ${withdrawalRawData.length} withdrawals.`,
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
      depositCount: depositResults.length,
      withdrawalCount: withdrawalRawData.length,
    });

    // --- Aggregation & Label Generation ---
    let labels: string[] = [];
    let depositData: number[] = [];
    let withdrawalData: number[] = [];

    if (period === TimePeriod.DAILY) {
      // HOURLY aggregation for DAILY period
      const hourlyDepositCounts = new Map<number, number>();
      const hourlyWithdrawalCounts = new Map<number, number>();
      for (let i = 0; i < 24; i++) {
        // Initialize 24 hours
        hourlyDepositCounts.set(i, 0);
        hourlyWithdrawalCounts.set(i, 0);
      }

      // Aggregate Deposits (from Transaction table)
      (depositResults as { updated_at: Date }[]).forEach((dep) => {
        if (!dep.updated_at) return;
        const hour = dep.updated_at.getHours(); // Group by hour (0-23)
        hourlyDepositCounts.set(hour, (hourlyDepositCounts.get(hour) || 0) + 1);
      });

      // Aggregate Withdrawals
      withdrawalRawData.forEach((wd) => {
        if (!wd.processed_at) return;
        const hour = wd.processed_at.getHours(); // Group by hour (0-23)
        hourlyWithdrawalCounts.set(
          hour,
          (hourlyWithdrawalCounts.get(hour) || 0) + 1,
        );
      });

      // Populate labels and data arrays for the 24 hours
      for (let i = 0; i < 24; i++) {
        labels.push(`${i.toString().padStart(2, "0")}:00`); // HH:00 format
        depositData.push(hourlyDepositCounts.get(i) || 0);
        withdrawalData.push(hourlyWithdrawalCounts.get(i) || 0);
      }
    } else {
      // DAILY/MONTHLY/YEARLY aggregation (using dates/months)
      const depositCounts = new Map<string, number>();
      const withdrawalCounts = new Map<string, number>();
      const allDateKeys = new Set<string>();

      // Helper to format date as YYYY-MM-DD
      const formatDateKey = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      // Helper to format date as YYYY-MM (for yearly grouping)
      const formatMonthKey = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        return `${year}-${month}`;
      };

      // Generate all expected date/month keys within the range for labels
      const tempDate = new Date(start);
      while (tempDate <= end) {
        const key =
          period === TimePeriod.YEARLY
            ? formatMonthKey(tempDate)
            : formatDateKey(tempDate);
        allDateKeys.add(key);
        if (period === TimePeriod.YEARLY) {
          tempDate.setMonth(tempDate.getMonth() + 1);
        } else {
          // WEEKLY, MONTHLY use day-level keys
          tempDate.setDate(tempDate.getDate() + 1);
        }
      }

      // Aggregate Deposit Data from TransactionSummary
      (
        depositResults as {
          transaction_date: string;
          deposit_count: bigint | null;
        }[]
      ).forEach((summary) => {
        const year = parseInt(summary.transaction_date.substring(0, 4));
        const month = parseInt(summary.transaction_date.substring(4, 6)) - 1;
        const day = parseInt(summary.transaction_date.substring(6, 8));
        const date = new Date(year, month, day);
        const key =
          period === TimePeriod.YEARLY
            ? formatMonthKey(date)
            : formatDateKey(date);
        if (allDateKeys.has(key)) {
          const current = depositCounts.get(key) || 0;
          depositCounts.set(key, current + Number(summary.deposit_count ?? 0));
        }
      });

      // Aggregate Withdrawal Data
      withdrawalRawData.forEach((withdrawal) => {
        const date = withdrawal.processed_at;
        if (!date) return;
        const key =
          period === TimePeriod.YEARLY
            ? formatMonthKey(date)
            : formatDateKey(date);
        if (allDateKeys.has(key)) {
          const current = withdrawalCounts.get(key) || 0;
          withdrawalCounts.set(key, current + 1);
        }
      });

      // Populate labels and data arrays using the generated keys
      const sortedKeys = Array.from(allDateKeys).sort();
      sortedKeys.forEach((key) => {
        if (period === TimePeriod.YEARLY) {
          const [year, month] = key.split("-");
          const monthName = new Date(
            parseInt(year),
            parseInt(month) - 1,
          ).toLocaleString("default", { month: "short" });
          labels.push(`${monthName} ${year}`);
        } else {
          // WEEKLY, MONTHLY use MM-DD for labels
          labels.push(key.substring(5));
        }
        depositData.push(depositCounts.get(key) || 0);
        withdrawalData.push(withdrawalCounts.get(key) || 0);
      });
    }

    this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
      message: `[getTransactionTrends] Aggregation complete. Labels: ${labels.length}, Deposits: ${depositData.length}, Withdrawals: ${withdrawalData.length}`,
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
      labelCount: labels.length,
      depositCount: depositData.length,
      withdrawalCount: withdrawalData.length,
    });

    // Transform the data to match the DTO structure
    const trends = labels.map((label, index) => ({
      label,
      depositCount: depositData[index] || 0,
      depositAmount: 0, // Not provided in the original implementation
      withdrawalCount: withdrawalData[index] || 0,
      withdrawalAmount: 0, // Not provided in the original implementation
      netBalance: 0, // Can calculate if amounts are available
    }));

    return {
      period,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      trends,
    };
  }

  async getMerchantPerformance(
    user: JwtUser,
    period: TimePeriod = TimePeriod.MONTHLY,
    endDate?: string,
    viewAsAdminId?: string,
  ): Promise<AdminDashboardMerchantPerformanceDto> {
    const logDetails = JSON.stringify({
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
      endDate: endDate,
    });

    this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
      message: `[getMerchantPerformance] User: ${user.userId}, Period: ${period}, EndDate: ${endDate}, ViewAs: ${viewAsAdminId}`,
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
      endDate: endDate,
    });
    // Use helper method to get targeting info
    const { targetAdminId, filterMerchantIds, filterMerchantInternalIds } =
      await this._getAdminTargetingInfo(user, viewAsAdminId);

    const end = endDate ? new Date(endDate) : new Date();
    const start = this.setDateRangeForPeriod(end, period);

    if (period === TimePeriod.DAILY) {
      end.setHours(23, 59, 59, 999);
    }

    // Fetch merchants: All if SuperAdmin viewing all, otherwise filter by targetAdminId
    const merchantWhereClause: Prisma.MerchantWhereInput = {};
    if (targetAdminId !== null) {
      merchantWhereClause.created_by = targetAdminId;
    }
    const merchants = await this.prisma.merchant.findMany({
      where: merchantWhereClause,
      select: {
        merchant_id: true,
        affiliate: true,
      }, // Select needed fields
    });
    this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
      message: `[getMerchantPerformance] Processing ${merchants.length} merchants.`,
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
      merchantCount: merchants.length,
    });
    if (merchants.length === 0) {
      // Early exit if no merchants to process
      return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
        merchants: [],
      };
    }

    // Get TOTAL deposit amount across ALL merchants for percentage calculation
    const totalDepositSummary = await this.prisma.transactionSummary.aggregate({
      where: {
        transaction_date: {
          gte: start.toISOString().slice(0, 10).replace(/-/g, ""),
          lte: end.toISOString().slice(0, 10).replace(/-/g, ""),
        },
        // Apply filter if needed
        ...(filterMerchantIds !== undefined && {
          merchant_id: { in: filterMerchantIds },
        }),
      },
      _sum: {
        deposit_amount: true,
      },
    });
    const totalDepositAmountAllMerchants = Number(
      totalDepositSummary._sum.deposit_amount || 0,
    );

    const merchantPerformanceData = [];

    for (const merchant of merchants) {
      // --- New Logic: Deposit Amount ---
      const depositSummary = await this.prisma.transactionSummary.aggregate({
        where: {
          merchant_id: merchant.merchant_id,
          transaction_date: {
            gte: start.toISOString().slice(0, 10).replace(/-/g, ""),
            lte: end.toISOString().slice(0, 10).replace(/-/g, ""),
          },
        },
        _sum: {
          deposit_amount: true, // Aggregate amount
        },
      });
      const depositAmount = Number(depositSummary._sum.deposit_amount || 0);
      // --- End New Logic ---

      merchantPerformanceData.push({
        merchantId: merchant.merchant_id,
        name: merchant.affiliate,
        volume: depositAmount, // Use deposit amount as volume
      });
    }

    // Calculate percentages based on deposit amount and sort
    const merchantsData = merchantPerformanceData
      .map((m) => ({
        merchantId: m.merchantId,
        name: m.name,
        volume: m.volume, // volume now represents deposit amount
        percentage:
          totalDepositAmountAllMerchants !== 0
            ? Math.round((m.volume / totalDepositAmountAllMerchants) * 100)
            : 0, // Avoid division by zero
      }))
      .sort((a, b) => b.volume - a.volume); // Sort by amount

    // Format merchantsData to match the DTO structure
    const formattedMerchants = merchantsData.map((m) => ({
      merchantId: m.merchantId,
      merchantName: m.name,
      totalDepositAmount: Number(m.volume) || 0,
      depositCount: 0, // Not in original data
      averageDepositAmount: 0, // Can be calculated if we have count
      totalWithdrawalAmount: 0, // Not in original data
      withdrawalCount: 0, // Not in original data
      averageWithdrawalAmount: 0, // Not in original data
      netBalance: Number(m.volume) || 0, // Using deposit amount as net balance for now
    }));

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      merchants: formattedMerchants,
    };
  }

  async getAnnouncements(
    user: JwtUser,
    limit: number = 5,
    includeExpired: boolean = false,
    viewAsAdminId?: string,
  ): Promise<AdminDashboardAnnouncementDto[]> {
    const { targetAdminId, filterMerchantIds, filterMerchantInternalIds } =
      await this._getAdminTargetingInfo(user, viewAsAdminId);

    const now = new Date();

    // Get active notices
    const noticeQuery: Prisma.NoticeWhereInput = {
      type: NoticeType.NOTICE,
      status: NoticeStatus.PUBLISHED,
    };

    if (!includeExpired) {
      noticeQuery.created_at = {
        gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      };
    }

    if (targetAdminId !== null) {
      noticeQuery.author_user_id = targetAdminId;
    }

    const announcements = await this.prisma.notice.findMany({
      where: noticeQuery,
      orderBy: { created_at: "desc" },
      take: limit,
    });

    // Transform to match the expected DTO format
    return announcements.map((notice) => ({
      id: `ann_${notice.notice_id}`,
      title: notice.title,
      content: notice.content,
      createdAt: notice.created_at,
      expiresAt: new Date(
        notice.created_at.getTime() + 7 * 24 * 60 * 60 * 1000,
      ),
      isActive: notice.status === NoticeStatus.PUBLISHED,
    }));
  }

  async getRecentTransactions(
    user: JwtUser,
    limit: number = 10,
    viewAsAdminId?: string,
  ): Promise<AdminDashboardRecentTransactionsDto> {
    const logDetails = JSON.stringify({
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      limit: limit,
    });

    this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
      message: `[getRecentTransactions] User: ${user.userId}, Limit: ${limit}, ViewAs: ${viewAsAdminId}`,
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      limit: limit,
    });
    // Use helper method to get targeting info
    const { targetAdminId, filterMerchantIds, filterMerchantInternalIds } =
      await this._getAdminTargetingInfo(user, viewAsAdminId);

    try {
      const fetchLimit = limit * 2;

      // --- Fetch Recent Deposits (Apply filter) ---
      const depositWhere: Prisma.TransactionWhereInput = {
        transaction_status: "0",
      };
      if (filterMerchantIds !== undefined) {
        // Apply filter using helper data
        depositWhere.merchant_id = { in: filterMerchantIds };
      }
      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[getRecentTransactions] Fetching deposits...`,
        userId: user.userId,
        viewAsAdmin: viewAsAdminId,
        limit: limit,
        filterMerchantCount: filterMerchantIds?.length || 0,
      });
      const recentDeposits = await this.prisma.transaction.findMany({
        where: depositWhere,
        orderBy: { updated_at: SortOrder.DESC },
        take: fetchLimit,
      });
      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[getRecentTransactions] Fetched ${recentDeposits.length} deposits.`,
        userId: user.userId,
        viewAsAdmin: viewAsAdminId,
        limit: limit,
        depositCount: recentDeposits.length,
      });

      // --- Fetch Recent Completed Withdrawals (Apply filter) ---
      const withdrawalWhere: Prisma.WithdrawalWhereInput = {
        status: WithdrawalStatus.COMPLETED,
      };
      if (filterMerchantInternalIds !== undefined) {
        // Apply filter using helper data
        withdrawalWhere.entity_type = EntityType.MERCHANT;
        withdrawalWhere.entity_id = { in: filterMerchantInternalIds };
        // TODO: Extend if filtering by agents is needed
      }
      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[getRecentTransactions] Fetching withdrawals...`,
        userId: user.userId,
        viewAsAdmin: viewAsAdminId,
        limit: limit,
        filterMerchantInternalCount: filterMerchantInternalIds?.length || 0,
      });
      const recentWithdrawals = await this.prisma.withdrawal.findMany({
        where: withdrawalWhere,
        orderBy: { processed_at: SortOrder.DESC },
        take: fetchLimit,
      });
      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[getRecentTransactions] Fetched ${recentWithdrawals.length} withdrawals.`,
        userId: user.userId,
        viewAsAdmin: viewAsAdminId,
        limit: limit,
        withdrawalCount: recentWithdrawals.length,
      });

      // --- Map to Common Structure ---
      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[getRecentTransactions] Mapping data...`,
        userId: user.userId,
        viewAsAdmin: viewAsAdminId,
        limit: limit,
      });

      // Format to match the DTO structure
      const mappedDeposits = recentDeposits.map((tx) => ({
        type: "deposit" as const,
        date: tx.updated_at,
        amount: tx.transaction_amount,
        status: "complete",
        merchantId: tx.merchant_id,
        merchantName: `Merchant (${tx.merchant_id})`,
      }));

      const mappedWithdrawals = recentWithdrawals.map((wd) => ({
        type: "withdrawal" as const,
        date: wd.processed_at,
        amount: wd.amount,
        status: "complete",
        merchantId: wd.entity_type === EntityType.MERCHANT ? null : null,
        merchantName:
          wd.entity_type === EntityType.MERCHANT
            ? `Merchant (Int. ID: ${wd.entity_id})`
            : `Agent (ID: ${wd.entity_id})`,
      }));

      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[getRecentTransactions] Mapping complete.`,
        userId: user.userId,
        viewAsAdmin: viewAsAdminId,
        limit: limit,
      });

      // --- Combine, Sort, and Limit ---
      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[getRecentTransactions] Combining and sorting...`,
        userId: user.userId,
        viewAsAdmin: viewAsAdminId,
        limit: limit,
        depositCount: recentDeposits.length,
        withdrawalCount: recentWithdrawals.length,
      });

      const combinedActivities = [...mappedDeposits, ...mappedWithdrawals]
        .sort((a, b) => {
          // Add null/undefined checks for date before calling getTime()
          const dateA = a.date?.getTime() ?? 0;
          const dateB = b.date?.getTime() ?? 0;
          return dateB - dateA;
        })
        .slice(0, limit);

      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[getRecentTransactions] Combined/sorted ${combinedActivities.length} activities.`,
        userId: user.userId,
        viewAsAdmin: viewAsAdminId,
        limit: limit,
        combinedCount: combinedActivities.length,
      });

      // --- Format Final Output ---
      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[getRecentTransactions] Formatting final output...`,
        userId: user.userId,
        viewAsAdmin: viewAsAdminId,
        limit: limit,
        combinedCount: combinedActivities.length,
      });

      // Format to match the DTO structure
      const formattedTransactions = combinedActivities.map(
        (activity, index) => ({
          id: `txn_${index + 1}`, // Generate placeholder IDs
          type:
            activity.type === "deposit"
              ? TransactionType.DEPOSIT
              : TransactionType.WITHDRAW,
          merchantId: activity.merchantId || "unknown",
          merchantName: activity.merchantName || "Unknown Entity",
          amount: Number(activity.amount) || 0,
          timestamp: activity.date || new Date(),
        }),
      );

      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[getRecentTransactions] Formatting complete. Returning ${formattedTransactions.length} items.`,
        userId: user.userId,
        viewAsAdmin: viewAsAdminId,
        limit: limit,
        resultCount: formattedTransactions.length,
      });

      return { transactions: formattedTransactions };
    } catch (error) {
      // Add type check
      if (error instanceof Error) {
        this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.ERROR, {
          message: `[getRecentTransactions] Error occurred: ${error.message}`,
          userId: user.userId,
          viewAsAdmin: viewAsAdminId,
          limit: limit,
          error: error.message,
        });
      } else {
        this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.ERROR, {
          message: `[getRecentTransactions] Error occurred: ${String(error)}`,
          userId: user.userId,
          viewAsAdmin: viewAsAdminId,
          limit: limit,
          error: String(error),
        });
      }
      // Re-throw the error or handle it as appropriate for NestJS error handling
      throw error;
    }
  }

  async getAdminActivity(
    user: JwtUser,
    limit: number = 10,
    viewAsAdminId?: string,
  ): Promise<AdminDashboardActivityDto[]> {
    const { targetAdminId, filterMerchantIds, filterMerchantInternalIds } =
      await this._getAdminTargetingInfo(user, viewAsAdminId);

    // Query alarm logs (system-generated alerts)
    const alarmQuery: Prisma.LogWhereInput = {
      system_generated: true,
      severity: { in: [LogSeverity.WARNING, LogSeverity.ERROR] },
    };

    // Only filter logs if we're not super admin
    if (targetAdminId !== null) {
      // Not sure how to filter system alarms by admin, perhaps by related merchant?
      // This would depend on your log structure
    }

    const alarmLogs = await this.prisma.log.findMany({
      where: alarmQuery,
      orderBy: { created_at: "desc" },
      take: limit,
    });

    // Query admin activity logs (non-system-generated)
    const activityQuery: Prisma.LogWhereInput = {
      system_generated: false,
    };

    if (targetAdminId !== null) {
      // Filter for just this admin's actions
      activityQuery.user_id = targetAdminId;
    }

    const activityLogs = await this.prisma.log.findMany({
      where: activityQuery,
      orderBy: { created_at: "desc" },
      take: limit,
    });

    /**
     * Interface for the log entity used in the formatLog function
     * Contains the necessary properties to format a log entry into an AdminDashboardActivityDto
     */
    interface SystemLogEntry {
      log_id: number;
      user_id?: string | null;
      action: string;
      system_generated?: boolean;
      ip_address?: string | null;
      created_at: Date;
      details?: Prisma.JsonValue; // JSON value type from Prisma
      target_entity_type?: string;
      target_entity_id?: string;
      severity?: LogSeverity;
    }

    // Function to format logs to the expected DTO structure
    const formatLog = (log: SystemLogEntry): AdminDashboardActivityDto => {
      const userIdStr = log.user_id || "system";
      const activityType = log.system_generated
        ? ActivityType.UPDATE // Default for system logs
        : determineActivityType(log.action);

      return {
        id: `act_${log.log_id}`,
        userId: userIdStr,
        username: userIdStr === "system" ? "SYSTEM" : `admin_${userIdStr}`,
        userType: UserType.ADMIN,
        ipAddress: log.ip_address || "0.0.0.0",
        activityType,
        description: log.action,
        timestamp: log.created_at,
      };
    };

    // Helper to determine activity type
    function determineActivityType(action: string): ActivityType {
      if (action.includes("login")) return ActivityType.LOGIN;
      if (action.includes("logout")) return ActivityType.LOGOUT;
      if (action.includes("create")) return ActivityType.CREATE;
      if (action.includes("update") || action.includes("edit"))
        return ActivityType.UPDATE;
      if (action.includes("delete")) return ActivityType.DELETE;
      return ActivityType.UPDATE; // Default
    }

    // Combine, transform, and return both sets of activities
    const combinedResults = [
      ...alarmLogs.map((log) => formatLog(log)),
      ...activityLogs.map((log) => formatLog(log)),
    ]
      .sort((a, b) => {
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .slice(0, limit);

    return combinedResults;
  }

  async getTimeZoneStats(
    user: JwtUser,
    period: TimePeriod = TimePeriod.DAILY,
    endDate?: string,
    viewAsAdminId?: string,
  ): Promise<AdminDashboardTimezoneStatsDto> {
    const logDetails = JSON.stringify({
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
      endDate: endDate,
    });

    this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
      message: `[getTimeZoneStats] User: ${user.userId}, Period: ${period}, EndDate: ${endDate}, ViewAs: ${viewAsAdminId}`,
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
      endDate: endDate,
    });
    // Use helper method to get targeting info
    const { targetAdminId, filterMerchantIds, filterMerchantInternalIds } =
      await this._getAdminTargetingInfo(user, viewAsAdminId);

    const end = endDate ? new Date(endDate) : new Date();
    const start = this.setDateRangeForPeriod(end, period);

    // Handle special case for DAILY
    if (period === TimePeriod.DAILY) {
      end.setHours(23, 59, 59, 999);
    }

    // Format dates for transaction summary query
    const startStr = start.toISOString().slice(0, 10).replace(/-/g, "");
    const endStr = end.toISOString().slice(0, 10).replace(/-/g, "");

    // Get deposit counts from TransactionSummary (doesn't have time info)
    const depositSummaries = await this.prisma.transactionSummary.findMany({
      where: {
        transaction_date: { gte: startStr, lte: endStr },
        // Apply filter if needed
        ...(filterMerchantIds !== undefined && {
          merchant_id: { in: filterMerchantIds },
        }),
      },
      select: {
        transaction_date: true,
        deposit_count: true,
      },
    });

    // Get completed withdrawal times
    const withdrawalTimes = await this.prisma.withdrawal.findMany({
      where: {
        status: WithdrawalStatus.COMPLETED,
        processed_at: {
          gte: start,
          lt: end,
        },
        // Apply filter if needed
        ...(filterMerchantInternalIds !== undefined && {
          entity_type: EntityType.MERCHANT,
          entity_id: { in: filterMerchantInternalIds },
          // TODO: Extend if filtering by agents is needed
        }),
      },
      select: {
        processed_at: true,
      },
    });

    let labels: (string | number)[] = [];
    let counts: number[] = [];
    const activityCounts = new Map<number, number>(); // Map to store counts per time unit

    // Helper to get the grouping key based on period and date
    const getGroupKey = (date: Date, period: TimePeriod): number => {
      switch (period) {
        case TimePeriod.DAILY:
          return date.getHours(); // 0-23
        case TimePeriod.WEEKLY:
          return date.getDay(); // 0 (Sun) - 6 (Sat)
        case TimePeriod.MONTHLY:
          return date.getDate(); // 1-31
        case TimePeriod.YEARLY:
          return date.getMonth(); // 0 (Jan) - 11 (Dec)
      }
    };

    // Initialize counts for the period
    if (period === TimePeriod.DAILY) {
      for (let i = 0; i < 24; i++) activityCounts.set(i, 0);
    } else if (period === TimePeriod.WEEKLY) {
      for (let i = 0; i < 7; i++) activityCounts.set(i, 0);
    } else if (period === TimePeriod.MONTHLY) {
      const daysInMonth = new Date(
        end.getFullYear(),
        end.getMonth() + 1,
        0,
      ).getDate();
      for (let i = 1; i <= daysInMonth; i++) activityCounts.set(i, 0);
    } else if (period === TimePeriod.YEARLY) {
      for (let i = 0; i < 12; i++) activityCounts.set(i, 0);
    }

    // Aggregate Deposits (Approximation for DAILY)
    depositSummaries.forEach((summary) => {
      const year = parseInt(summary.transaction_date.substring(0, 4));
      const month = parseInt(summary.transaction_date.substring(4, 6)) - 1;
      const day = parseInt(summary.transaction_date.substring(6, 8));
      const date = new Date(year, month, day);
      const count = Number(summary.deposit_count ?? 0);

      if (period === TimePeriod.DAILY) {
        // Distribute daily count evenly across hours
        const countPerHour = count > 0 ? Math.ceil(count / 24) : 0;
        for (let hour = 0; hour < 24; hour++) {
          activityCounts.set(
            hour,
            (activityCounts.get(hour) || 0) + countPerHour,
          );
        }
      } else {
        const key = getGroupKey(date, period);
        activityCounts.set(key, (activityCounts.get(key) || 0) + count);
      }
    });

    // Aggregate Withdrawals
    withdrawalTimes.forEach((wd) => {
      if (!wd.processed_at) return;
      const key = getGroupKey(wd.processed_at, period);
      activityCounts.set(key, (activityCounts.get(key) || 0) + 1);
    });

    // Populate labels and counts arrays
    if (period === TimePeriod.DAILY) {
      // Create arrays for chart (only include even hours for readability)
      for (let i = 0; i < 24; i += 2) {
        labels.push(i.toString());
        counts.push(
          (activityCounts.get(i) || 0) + (activityCounts.get(i + 1) || 0),
        );
      }
    } else if (period === TimePeriod.WEEKLY) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 0; i < 7; i++) {
        labels.push(dayNames[i]);
        counts.push(activityCounts.get(i) || 0);
      }
    } else if (period === TimePeriod.MONTHLY) {
      const daysInMonth = new Date(
        end.getFullYear(),
        end.getMonth() + 1,
        0,
      ).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        labels.push(i.toString());
        counts.push(activityCounts.get(i) || 0);
      }
    } else if (period === TimePeriod.YEARLY) {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      for (let i = 0; i < 12; i++) {
        labels.push(monthNames[i]);
        counts.push(activityCounts.get(i) || 0);
      }
    }

    // Format data to match the DTO structure
    const hourlyStats = labels.map((label, index) => ({
      hour: Number(label), // Convert label to number (hour of day)
      depositCount: counts[index] || 0,
      depositAmount: 0, // Not in original data
      withdrawalCount: 0, // Not in original data
      withdrawalAmount: 0, // Not in original data
    }));

    this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
      message: `[getTimeZoneStats] Analyzing time-based patterns for period: ${period}`,
      userId: user.userId,
      viewAsAdmin: viewAsAdminId,
      period: period,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });

    return {
      hourlyStats,
    };
  }

  private async _getAdminTargetingInfo(
    user: JwtUser,
    viewAsAdminId?: string,
  ): Promise<{
    targetAdminId: string | null;
    filterMerchantIds: string[] | undefined;
    filterMerchantInternalIds: string[] | undefined;
  }> {
    const userIsSuperAdmin = await this.adminAdminsService.isSuperAdmin(
      user.userId,
    );
    let targetAdminId: string | null = null;

    if (viewAsAdminId && userIsSuperAdmin) {
      // Check if the superadmin is viewing as themselves
      if (viewAsAdminId === user.userId.toString()) {
        this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
          message: `[_getAdminTargetingInfo] SuperAdmin viewing as self (ID: ${viewAsAdminId}). Showing all data.`,
          userId: user.userId,
          viewAsAdminId,
          isSuperAdmin: userIsSuperAdmin,
        });
        // Set targetAdminId to null to skip filtering (same as not providing viewAsAdminId)
        targetAdminId = null;
      } else {
        // Original behavior: Superadmin views as another specific admin
        targetAdminId = viewAsAdminId;
        this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
          message: `[_getAdminTargetingInfo] SuperAdmin viewing as Admin ID: ${targetAdminId}`,
          userId: user.userId,
          viewAsAdminId,
          targetAdminId,
          isSuperAdmin: userIsSuperAdmin,
        });
      }
    } else if (!userIsSuperAdmin) {
      targetAdminId = user.userId.toString();
      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[_getAdminTargetingInfo] Regular Admin view for Admin ID: ${targetAdminId}`,
        userId: user.userId,
        targetAdminId,
        isSuperAdmin: userIsSuperAdmin,
      });
    } else {
      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[_getAdminTargetingInfo] SuperAdmin viewing all data.`,
        userId: user.userId,
        isSuperAdmin: userIsSuperAdmin,
      });
      // targetAdminId remains null for SuperAdmin viewing all
    }

    let filterMerchantIds: string[] | undefined = undefined;
    let filterMerchantInternalIds: string[] | undefined = undefined;

    if (targetAdminId !== null) {
      const targetMerchants = await this.prisma.merchant.findMany({
        where: { created_by: targetAdminId },
        select: {
          merchant_id: true,
          affiliate: true,
        },
      });
      filterMerchantIds = targetMerchants.map((m) => m.merchant_id);
      filterMerchantInternalIds = targetMerchants.map((m) => m.merchant_id);
      this.logger.logSystemAction(LogAction.SYSTEM, LogSeverity.INFO, {
        message: `[_getAdminTargetingInfo] Filtering for ${filterMerchantIds.length} merchants.`,
        userId: user.userId,
        targetAdminId,
        merchantCount: filterMerchantIds.length,
      });
    }

    return { targetAdminId, filterMerchantIds, filterMerchantInternalIds };
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) {
      return "just now";
    } else if (diff < 3600) {
      return Math.floor(diff / 60) + " minutes ago";
    } else if (diff < 86400) {
      return Math.floor(diff / 3600) + " hours ago";
    } else if (diff < 2592000) {
      return Math.floor(diff / 86400) + " days ago";
    } else if (diff < 31536000) {
      return Math.floor(diff / 2592000) + " months ago";
    } else {
      return Math.floor(diff / 31536000) + " years ago";
    }
  }

  private setDateRangeForPeriod(end: Date, period: TimePeriod): Date {
    const start = new Date(end);
    // Set start time to 00:00:00.000 for consistency
    start.setHours(0, 0, 0, 0);

    switch (period) {
      case TimePeriod.DAILY:
        // Start is 24 hours before the end time (which is usually set to 23:59:59.999)
        start.setTime(end.getTime() - 24 * 60 * 60 * 1000);
        break;
      case TimePeriod.WEEKLY:
        // Start is 7 days before the end date
        start.setDate(end.getDate() - 6); // -6 to get a total of 7 days including end date
        break;
      case TimePeriod.MONTHLY:
        // Start is approx 30 days before the end date (can adjust if specific month logic needed)
        start.setDate(end.getDate() - 29); // -29 to get a total of 30 days including end date
        break;
      case TimePeriod.YEARLY:
        // Start is 12 months before the end date
        start.setMonth(end.getMonth() - 11); // -11 to get 12 months including end month
        // Ensure year wraps correctly
        if (end.getMonth() - 11 < 0) {
          start.setFullYear(end.getFullYear() - 1);
        }
        start.setDate(1); // Start from the 1st of that month for simplicity in yearly view
        break;
    }

    return start;
  }
}
