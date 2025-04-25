import { ApiProperty } from "@nestjs/swagger";
import { AdminDashboardSummaryStatsDto } from "./admin-dashboard-summary-stats.dto";
import { AdminDashboardTransactionTrendsDto } from "./admin-dashboard-transaction-trends.dto";
import { AdminDashboardMerchantPerformanceDto } from "./admin-dashboard-merchant-performance.dto";
import { AdminDashboardRecentTransactionsDto } from "./admin-dashboard-recent-transactions.dto";
import { AdminDashboardTimezoneStatsDto } from "./admin-dashboard-timezone-stats.dto";
import { AdminDashboardAlarmDto } from "./admin-dashboard-alarm.dto";
import { AdminDashboardAnnouncementDto } from "./admin-dashboard-announcement.dto";
import { AdminDashboardActivityDto } from "./admin-dashboard-activity.dto";

export class AdminDashboardResponseDto {
  @ApiProperty({
    description: "Summary statistics for the dashboard",
    type: AdminDashboardSummaryStatsDto,
  })
  summaryStats: AdminDashboardSummaryStatsDto;

  @ApiProperty({
    description: "Transaction trends data",
    type: AdminDashboardTransactionTrendsDto,
  })
  transactionTrends: AdminDashboardTransactionTrendsDto;

  @ApiProperty({
    description: "Merchant performance data",
    type: AdminDashboardMerchantPerformanceDto,
  })
  merchantPerformance: AdminDashboardMerchantPerformanceDto;

  @ApiProperty({
    description: "Recent transactions data",
    type: AdminDashboardRecentTransactionsDto,
  })
  recentTransactions: AdminDashboardRecentTransactionsDto;

  @ApiProperty({
    description: "Timezone statistics data",
    type: AdminDashboardTimezoneStatsDto,
  })
  timezoneStats: AdminDashboardTimezoneStatsDto;

  @ApiProperty({
    description: "System alarms",
    type: [AdminDashboardAlarmDto],
    isArray: true,
  })
  alarms: AdminDashboardAlarmDto[];

  @ApiProperty({
    description: "System announcements",
    type: [AdminDashboardAnnouncementDto],
    isArray: true,
  })
  announcements: AdminDashboardAnnouncementDto[];

  @ApiProperty({
    description: "Recent system activity",
    type: [AdminDashboardActivityDto],
    isArray: true,
  })
  recentActivity: AdminDashboardActivityDto[];

  @ApiProperty({ description: "Total number of merchants", example: 100 })
  totalMerchants: number;

  @ApiProperty({ description: "Total number of agents", example: 50 })
  totalAgents: number;

  @ApiProperty({ description: "Total number of transactions", example: 1000 })
  totalTransactions: number;

  @ApiProperty({ description: "Total deposit amount", example: 5000000 })
  totalDepositAmount: number;

  @ApiProperty({ description: "Total withdrawal amount", example: 3000000 })
  totalWithdrawalAmount: number;

  @ApiProperty({ description: "Total complaints", example: 5 })
  totalComplaints: number;

  @ApiProperty({ description: "Total blacklist entries", example: 2 })
  totalBlacklist: number;

  @ApiProperty({ description: "Total notices", example: 10 })
  totalNotices: number;

  @ApiProperty({ description: "Total QnA entries", example: 8 })
  totalQna: number;
}
