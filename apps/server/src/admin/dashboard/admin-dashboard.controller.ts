import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AdminDashboardService } from "./admin-dashboard.service";
// ... import guards, decorators, RoleName ...
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RoleName } from "@ezpg/database";
import { TfaSessionGuard } from "../../auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "../../auth/guards/first-login.guard";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { TimePeriod } from "@ezpg/types";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";

// Import individual DTOs from their respective files
import { AdminDashboardSummaryStatsDto } from "./dto/admin-dashboard-summary-stats.dto";
import { AdminDashboardTransactionTrendsDto } from "./dto/admin-dashboard-transaction-trends.dto";
import { AdminDashboardMerchantPerformanceDto } from "./dto/admin-dashboard-merchant-performance.dto";
import { AdminDashboardRecentTransactionsDto } from "./dto/admin-dashboard-recent-transactions.dto";
import { AdminDashboardActivityDto } from "./dto/admin-dashboard-activity.dto";
import { AdminDashboardTimezoneStatsDto } from "./dto/admin-dashboard-timezone-stats.dto";
import { AdminDashboardAnnouncementDto } from "./dto/admin-dashboard-announcement.dto";

/**
 * Controller responsible for handling all dashboard-related API endpoints for admin users.
 * Provides endpoints for retrieving various dashboard statistics, trends, and data.
 *
 * All endpoints require authentication via JWT, TFA verification, and admin role.
 * SuperAdmin users can view data for all admins or filter by specific admin.
 */
@ApiTags("Admin - Dashboard")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/dashboard")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@UseInterceptors(ClassSerializerInterceptor)
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  /**
   * Retrieves summary statistics for the admin dashboard
   *
   * @param user - The authenticated user information
   * @param period - Time period for statistics (daily, weekly, monthly, etc.)
   * @param endDate - Optional end date for statistics range
   * @param viewAsAdminId - Optional admin ID for SuperAdmin to view as specific admin
   * @returns Summary statistics for the dashboard including transaction counts, amounts, and merchant metrics
   */
  @ApiOperation({ summary: "Get admin dashboard summary statistics" })
  @ApiResponse({ status: 200, type: AdminDashboardSummaryStatsDto })
  @ApiQuery({ name: "period", enum: TimePeriod, required: false })
  @ApiQuery({ name: "endDate", type: String, required: false })
  @ApiQuery({
    name: "viewAsAdminId",
    type: String,
    required: false,
    description: "(SuperAdmin only) View dashboard as this Admin ID",
  })
  @Get("summary-stats")
  async getSummaryStats(
    @CurrentUser() user: JwtUser,
    @Query("period") period: TimePeriod = TimePeriod.DAILY,
    @Query("endDate") endDate?: string,
    @Query("viewAsAdminId") viewAsAdminId?: string,
  ): Promise<AdminDashboardSummaryStatsDto> {
    return this.dashboardService.getSummary(
      user,
      period,
      endDate,
      viewAsAdminId,
    );
  }

  /**
   * Retrieves transaction trends data for the admin dashboard
   *
   * @param user - The authenticated user information
   * @param period - Time period for trend analysis (daily, weekly, monthly, etc.)
   * @param endDate - Optional end date for trends range
   * @param viewAsAdminId - Optional admin ID for SuperAdmin to view as specific admin
   * @returns Transaction trends including deposit and transaction metrics over time
   */
  @ApiOperation({ summary: "Get transaction trends" })
  @ApiResponse({ status: 200, type: AdminDashboardTransactionTrendsDto })
  @ApiQuery({ name: "period", enum: TimePeriod, required: false })
  @ApiQuery({ name: "endDate", type: String, required: false })
  @ApiQuery({
    name: "viewAsAdminId",
    type: String,
    required: false,
    description: "(SuperAdmin only) View dashboard as this Admin ID",
  })
  @Get("trends")
  async getTransactionTrends(
    @CurrentUser() user: JwtUser,
    @Query("period") period: TimePeriod = TimePeriod.MONTHLY,
    @Query("endDate") endDate?: string,
    @Query("viewAsAdminId") viewAsAdminId?: string,
  ): Promise<AdminDashboardTransactionTrendsDto> {
    return this.dashboardService.getTransactionTrends(
      user,
      period,
      endDate,
      viewAsAdminId,
    );
  }

  /**
   * Retrieves merchant performance distribution data for the admin dashboard
   *
   * @param user - The authenticated user information
   * @param period - Time period for merchant performance analysis
   * @param endDate - Optional end date for performance analysis
   * @param viewAsAdminId - Optional admin ID for SuperAdmin to view as specific admin
   * @returns Merchant performance data including deposit distribution and performance metrics
   */
  @ApiOperation({ summary: "Get merchant performance distribution" })
  @ApiResponse({ status: 200, type: AdminDashboardMerchantPerformanceDto })
  @ApiQuery({ name: "period", enum: TimePeriod, required: false })
  @ApiQuery({ name: "endDate", type: String, required: false })
  @ApiQuery({
    name: "viewAsAdminId",
    type: String,
    required: false,
    description: "(SuperAdmin only) View dashboard as this Admin ID",
  })
  @Get("merchant-performance")
  async getMerchantPerformance(
    @CurrentUser() user: JwtUser,
    @Query("period") period: TimePeriod = TimePeriod.MONTHLY,
    @Query("endDate") endDate?: string,
    @Query("viewAsAdminId") viewAsAdminId?: string,
  ): Promise<AdminDashboardMerchantPerformanceDto> {
    return this.dashboardService.getMerchantPerformance(
      user,
      period,
      endDate,
      viewAsAdminId,
    );
  }

  /**
   * Retrieves recent transactions for the admin dashboard
   *
   * @param user - The authenticated user information
   * @param limit - Maximum number of transactions to return
   * @param viewAsAdminId - Optional admin ID for SuperAdmin to view as specific admin
   * @returns List of recent transactions across all merchants the admin has access to
   */
  @ApiOperation({ summary: "Get recent transactions across all merchants" })
  @ApiResponse({ status: 200, type: AdminDashboardRecentTransactionsDto })
  @ApiQuery({ name: "limit", type: String, required: false })
  @ApiQuery({
    name: "viewAsAdminId",
    type: String,
    required: false,
    description: "(SuperAdmin only) View dashboard as this Admin ID",
  })
  @Get("recent-transactions")
  async getRecentTransactions(
    @CurrentUser() user: JwtUser,
    @Query("limit") limit?: string,
    @Query("viewAsAdminId") viewAsAdminId?: string,
  ): Promise<AdminDashboardRecentTransactionsDto> {
    const numericLimit = (limit && parseInt(limit, 10)) || 10;
    const finalLimit =
      Number.isInteger(numericLimit) && numericLimit > 0 ? numericLimit : 10;

    return this.dashboardService.getRecentTransactions(
      user,
      finalLimit,
      viewAsAdminId,
    );
  }

  /**
   * Retrieves system and merchant announcements for the admin dashboard
   *
   * @param user - The authenticated user information
   * @param limit - Maximum number of announcements to return
   * @returns List of system and merchant announcements (info & success types)
   */
  @ApiOperation({
    summary: "Get system and merchant announcements (info & success)",
  })
  @ApiResponse({ status: 200, type: [AdminDashboardAnnouncementDto] })
  @ApiQuery({ name: "limit", type: String, required: false })
  @Get("announcements")
  async getAnnouncements(
    @CurrentUser() user: JwtUser,
    @Query("limit") limit?: string,
  ): Promise<AdminDashboardAnnouncementDto[]> {
    const numericLimit = (limit && parseInt(limit, 10)) || 10;
    const finalLimit =
      Number.isInteger(numericLimit) && numericLimit > 0 ? numericLimit : 10;

    return this.dashboardService.getAnnouncements(user, finalLimit);
  }

  /**
   * Retrieves dashboard alarms and admin activities
   *
   * @param user - The authenticated user information
   * @param limit - Maximum number of activities to return
   * @returns List of dashboard alarm and admin activity entries
   */
  @ApiOperation({ summary: "Get dashboard alarms and admin activities" })
  @ApiResponse({ status: 200, type: [AdminDashboardActivityDto] })
  @ApiQuery({ name: "limit", type: String, required: false })
  @Get("dashboard-activity")
  async getDashboardActivity(
    @CurrentUser() user: JwtUser,
    @Query("limit") limit?: string,
  ): Promise<AdminDashboardActivityDto[]> {
    const numericLimit = (limit && parseInt(limit, 10)) || 10;
    const finalLimit =
      Number.isInteger(numericLimit) && numericLimit > 0 ? numericLimit : 10;

    return this.dashboardService.getAdminActivity(user, finalLimit);
  }

  /**
   * Retrieves transaction statistics by time zone
   *
   * @param user - The authenticated user information
   * @param period - Time period for time zone statistics
   * @param endDate - Optional end date for time zone statistics
   * @param viewAsAdminId - Optional admin ID for SuperAdmin to view as specific admin
   * @returns Transaction statistics grouped by time zone
   */
  @ApiOperation({ summary: "Get transaction statistics by time zone" })
  @ApiResponse({ status: 200, type: AdminDashboardTimezoneStatsDto })
  @ApiQuery({ name: "period", enum: TimePeriod, required: false })
  @ApiQuery({ name: "endDate", type: String, required: false })
  @ApiQuery({
    name: "viewAsAdminId",
    type: String,
    required: false,
    description: "(SuperAdmin only) View dashboard as this Admin ID",
  })
  @Get("time-zone-stats")
  async getTimeZoneStats(
    @CurrentUser() user: JwtUser,
    @Query("period") period: TimePeriod = TimePeriod.DAILY,
    @Query("endDate") endDate?: string,
    @Query("viewAsAdminId") viewAsAdminId?: string,
  ): Promise<AdminDashboardTimezoneStatsDto> {
    return this.dashboardService.getTimeZoneStats(
      user,
      period,
      endDate,
      viewAsAdminId,
    );
  }
}
