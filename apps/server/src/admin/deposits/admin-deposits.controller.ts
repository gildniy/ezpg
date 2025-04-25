import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  AdminDepositsFilterDto,
  AdminDepositsItemDto,
  AdminDepositsStatsDto,
} from "./dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { TfaSessionGuard } from "../../auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "../../auth/guards/first-login.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RoleName } from "@ezpg/database";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AdminDepositsService } from "./admin-deposits.service";
import { AdminDepositsResponseDto } from "./dto/admin-deposits-response.dto";
import { DepositStatusType } from "../../common/enums/deposit-status-type.enum";
import { DepositSearchFieldEnum } from "../../common/enums/deposit-search-field.enum";

/**
 * Controller responsible for handling all deposit-related endpoints for admin users.
 * Provides functionality for listing, filtering, viewing details, and exporting deposits.
 *
 * All endpoints (except download) require authentication via JWT, TFA verification, and admin role.
 * Regular admins can only access deposits for merchants they created.
 * SuperAdmin users can access all deposits or filter by admin.
 */
@ApiTags("Admin - Deposits")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/deposits")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@UseInterceptors(ClassSerializerInterceptor)
export class AdminDepositsController {
  constructor(private readonly depositsService: AdminDepositsService) {}

  /**
   * Retrieves a paginated list of deposits with optional filtering criteria
   *
   * @param endDate - Optional end date for filtering deposits
   * @param merchantId - Optional merchant ID to filter deposits
   * @param groupId - Optional merchant group ID to filter deposits
   * @param adminId - Optional admin ID to filter deposits (SuperAdmin only)
   * @param status - Optional status to filter deposits (DEPOSIT or CANCEL)
   * @param searchField - Optional field to search on
   * @param searchValue - Optional value to search for
   * @param page - Page number for pagination (default: 1)
   * @param pageSize - Number of items per page (default: 10)
   * @param user - The authenticated user information
   * @returns Paginated list of deposits matching the criteria
   */
  @ApiOperation({ summary: "Get paginated deposits" })
  @ApiResponse({
    status: 200,
    description: "Returns paginated deposit transactions",
    type: AdminDepositsResponseDto,
  })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiQuery({ name: "merchantId", required: false, type: String })
  @ApiQuery({ name: "groupId", required: false, type: Number })
  @ApiQuery({ name: "adminId", required: false, type: String })
  @ApiQuery({ name: "status", required: false, enum: DepositStatusType })
  @ApiQuery({
    name: "searchField",
    required: false,
    enum: DepositSearchFieldEnum,
  })
  @ApiQuery({ name: "searchValue", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  @Get()
  async getDeposits(
    @Query("endDate") endDate?: string,
    @Query("merchantId") merchantId?: string,
    @Query("groupId") groupId?: number,
    @Query("adminId") adminId?: string,
    @Query("status") status?: DepositStatusType,
    @Query("searchField") searchField?: DepositSearchFieldEnum,
    @Query("searchValue") searchValue?: string,
    @Query("page") page = 1,
    @Query("pageSize") pageSize = 10,
    @CurrentUser() user?: JwtUser,
  ): Promise<AdminDepositsResponseDto> {
    const filterDto: AdminDepositsFilterDto = {
      merchantId,
      groupId: groupId ? +groupId : undefined,
      adminId,
      endDate: endDate || new Date().toISOString().split("T")[0],
      status,
      searchField,
      searchValue,
      page: +page,
      pageSize: +pageSize,
    };
    return this.depositsService.getDeposits(
      filterDto,
      user.userId,
      user.role as RoleName,
    );
  }

  /**
   * Retrieves deposit statistics based on optional filtering criteria
   *
   * @param user - The authenticated user information
   * @param startDate - Optional start date for statistics
   * @param endDate - Optional end date for statistics
   * @param merchantId - Optional merchant ID to filter statistics
   * @param groupId - Optional merchant group ID to filter statistics
   * @param adminId - Optional admin ID to filter statistics (SuperAdmin only)
   * @returns Deposit statistics including counts and amounts
   */
  @ApiOperation({ summary: "Get deposit statistics" })
  @ApiResponse({
    status: 200,
    description: "Returns deposit statistics",
    type: AdminDepositsStatsDto,
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Start date (YYYY-MM-DD)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "End date (YYYY-MM-DD)",
  })
  @ApiQuery({
    name: "merchantId",
    required: false,
    description: "Filter by merchant ID",
  })
  @ApiQuery({
    name: "groupId",
    required: false,
    description: "Filter by merchant group ID",
    type: Number,
  })
  @ApiQuery({
    name: "adminId",
    required: false,
    description: "Filter by admin ID (superadmin only)",
  })
  @Get("stats")
  async getDepositStats(
    @CurrentUser() user: JwtUser,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("merchantId") merchantId?: string,
    @Query("groupId") groupId?: number,
    @Query("adminId") adminId?: string,
  ): Promise<AdminDepositsStatsDto> {
    return this.depositsService.getDepositStats(
      startDate,
      endDate,
      merchantId,
      user.userId,
      user.role as RoleName,
      adminId,
      groupId ? +groupId : undefined,
    );
  }

  /**
   * Retrieves detailed information for a specific deposit by ID
   *
   * @param user - The authenticated user information
   * @param id - The deposit ID (composite key format: transaction_date|van_id|van_transaction_id)
   * @returns Detailed deposit information
   * @throws NotFoundException if deposit doesn't exist
   * @throws ForbiddenException if user doesn't have permission to view this deposit
   */
  @ApiOperation({ summary: "Get deposit details by ID" })
  @ApiResponse({
    status: 200,
    description: "Returns detailed deposit information",
    type: AdminDepositsItemDto,
  })
  @ApiResponse({ status: 404, description: "Deposit not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - No permission to view this deposit",
  })
  @ApiParam({
    name: "id",
    description: "Deposit ID (transaction_date|van_id|van_transaction_id)",
    type: String,
  })
  @Get(":id")
  async getDeposit(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ): Promise<AdminDepositsItemDto> {
    return this.depositsService.getDepositById(
      id,
      user.userId,
      user.role as RoleName,
    );
  }

  /**
   * Exports deposits to Excel file based on filter criteria
   *
   * @param user - The authenticated user information
   * @param filterDto - Filter criteria for deposits to export
   * @returns Object with URL to download the generated Excel file
   */
  @ApiOperation({ summary: "Export deposits to Excel" })
  @ApiResponse({
    status: 200,
    description: "Returns URL to download Excel file",
    schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          example: "/api/downloads/deposits-export-1234567890.xlsx",
        },
      },
    },
  })
  @ApiBody({
    type: AdminDepositsFilterDto,
    description: "Deposit filter criteria",
  })
  @Post("export")
  async exportDeposits(
    @CurrentUser() user: JwtUser,
    @Body() filterDto: AdminDepositsFilterDto,
  ): Promise<{ url: string }> {
    return this.depositsService.exportDepositsToExcel(
      filterDto,
      user.userId,
      user.role as RoleName,
    );
  }
}
