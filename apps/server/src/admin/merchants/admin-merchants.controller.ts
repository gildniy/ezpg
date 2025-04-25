import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AdminMerchantsService } from "./admin-merchants.service";
import { CreateMerchantDto } from "./dto/create-merchant.dto";
import { UpdateMerchantDto } from "./dto/update-merchant.dto";
import { AdminMerchantsQueryDto } from "./dto/merchant-query.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { TfaSessionGuard } from "../../auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "../../auth/guards/first-login.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";
import { MerchantDetailResponseDto } from "./dto/merchant-detail-response.dto";
import { PaginatedResponse } from "../../common/dto/paginated-response.dto";
import { CreateMerchantResponseDto } from "./dto/create-merchant-response.dto";
import { UpdateMerchantBalanceDto } from "./dto/update-merchant-balance.dto";
import { RoleName } from "@ezpg/database";
import { ExportUrlResponseDto } from "../../common/dto/export-url-response.dto";
import { AdminAdminsService } from "../admins/admin-admins.service";
import { MerchantBalanceLogQueryDto } from "../logs/dto/log-query.dto";

/**
 * Controller responsible for handling all merchant-related API endpoints for admin users.
 * Provides functionality for creating, listing, updating, and deleting merchants.
 *
 * All endpoints require authentication via JWT, TFA verification, and admin role.
 * Regular admins can only access merchants they created.
 * SuperAdmin users can view merchants created by any admin by using the viewAsAdminId parameter.
 */
@ApiTags("Admin - Merchants")
@ApiBearerAuth("jwt-bearer-auth")
@ApiExtraModels(AdminMerchantsQueryDto)
@Controller("admin/merchants")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@UseInterceptors(ClassSerializerInterceptor)
export class AdminMerchantsController {
  constructor(
    private readonly merchantsService: AdminMerchantsService,
    private readonly adminService: AdminAdminsService,
  ) {}

  /**
   * Creates a new merchant account and associated user
   *
   * @param createMerchantDto - Data for the new merchant
   * @param user - The authenticated admin user
   * @returns Newly created merchant and user details, with TFA setup info if enabled
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register New Merchant",
    description: "Creates a new merchant account and associated login user.",
    operationId: "registerNewMerchant",
  })
  @ApiBody({ type: CreateMerchantDto })
  @ApiCreatedResponse({
    description:
      "Merchant and user created successfully. Includes TFA setup info if requested.",
    type: CreateMerchantResponseDto,
  })
  async createMerchant(
    @Body() createMerchantDto: CreateMerchantDto,
    @CurrentUser() user: JwtUser,
  ): Promise<CreateMerchantResponseDto> {
    return this.merchantsService.create(createMerchantDto, user);
  }

  /**
   * Retrieves a paginated list of merchants with optional filtering
   * SuperAdmin users can view merchants for any admin by providing viewAsAdminId
   * Returns complete merchant details to avoid reloading when a row is clicked
   *
   * @param query - Query parameters for filtering and pagination
   * @param user - The authenticated admin user
   * @param viewAsAdminId - Optional admin ID to view merchants as (SuperAdmin only)
   * @returns Paginated list of merchants with complete details
   */
  @Get()
  @ApiOperation({
    summary: "List Merchants",
    description:
      "Retrieves a paginated list of merchants with complete details based on query filters. Includes all merchant information to avoid additional loading when selecting a row.",
  })
  @ApiQuery({
    type: AdminMerchantsQueryDto,
    style: "form",
    explode: true,
    name: "sortOrder",
    enumName: "SortOrderEnum",
  })
  @ApiQuery({
    name: "viewAsAdminId",
    type: String,
    required: false,
    description: "(SuperAdmin only) View merchants created by this Admin ID",
  })
  @ApiResponse({
    status: 200,
    description: "List of merchants with complete details retrieved.",
    type: PaginatedResponse<MerchantDetailResponseDto>,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  async findAll(
    @Query() query: AdminMerchantsQueryDto,
    @CurrentUser() user: JwtUser,
    @Query("viewAsAdminId") viewAsAdminId?: string,
  ): Promise<PaginatedResponse<MerchantDetailResponseDto>> {
    // Check if user is a super admin
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);

    // Only allow viewAsAdminId for superadmins
    const effectiveViewAsAdminId =
      isSuperAdmin && viewAsAdminId ? viewAsAdminId : undefined;

    return this.merchantsService.findAll(
      query,
      user.userId,
      effectiveViewAsAdminId,
    );
  }

  /**
   * Retrieves a paginated list of deleted merchants
   * SuperAdmin users can view deleted merchants for any admin by providing viewAsAdminId
   *
   * @param query - Query parameters for filtering and pagination
   * @param user - The authenticated admin user
   * @param viewAsAdminId - Optional admin ID to view merchants as (SuperAdmin only)
   * @returns Paginated list of deleted merchants matching the criteria
   */
  @Get("deleted")
  @ApiOperation({
    summary: "Get Deleted Merchants",
    description: "Retrieves a list of deleted merchants.",
  })
  @ApiResponse({
    status: 200,
    description: "List of deleted merchants retrieved.",
    type: PaginatedResponse<MerchantDetailResponseDto>,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiQuery({
    type: AdminMerchantsQueryDto,
    style: "form",
    explode: true,
    name: "sortOrder",
    enumName: "SortOrderEnum",
  })
  @ApiQuery({
    name: "viewAsAdminId",
    type: String,
    required: false,
    description: "(SuperAdmin only) View merchants created by this Admin ID",
  })
  async findDeleted(
    @Query() query: AdminMerchantsQueryDto,
    @CurrentUser() user: JwtUser,
    @Query("viewAsAdminId") viewAsAdminId?: string,
  ): Promise<PaginatedResponse<MerchantDetailResponseDto>> {
    // Check if user is a super admin
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);

    // Only allow viewAsAdminId for superadmins
    const effectiveViewAsAdminId =
      isSuperAdmin && viewAsAdminId ? viewAsAdminId : undefined;

    return this.merchantsService.findAllDeleted(
      query,
      user.userId,
      effectiveViewAsAdminId,
    );
  }

  /**
   * Retrieves details for a specific merchant by ID
   * SuperAdmin users can view merchants for any admin by providing viewAsAdminId
   *
   * @param merchantId - The unique ID of the merchant
   * @param user - The authenticated admin user
   * @param viewAsAdminId - Optional admin ID to view merchants as (SuperAdmin only)
   * @returns Detailed merchant information
   */
  @Get(":merchantId")
  @ApiOperation({
    summary: "Get Merchant Details",
    description:
      "Retrieves details for a specific merchant by their Merchant ID. Regular admins can only access merchants they created, while superadmins can view any merchant.",
  })
  @ApiParam({
    name: "merchantId",
    description: "The unique VARCHAR(8) ID of the merchant",
    example: "sticpay",
  })
  @ApiQuery({
    name: "viewAsAdminId",
    type: String,
    required: false,
    description: "(SuperAdmin only) View as this Admin ID",
  })
  @ApiResponse({
    status: 200,
    description: "Merchant details retrieved.",
    type: MerchantDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description:
      "Forbidden - You did not create this merchant and are not a superadmin.",
  })
  @ApiResponse({
    status: 404,
    description: "Not Found. Merchant with the specified ID does not exist.",
  })
  async findOne(
    @Param("merchantId") merchantId: string,
    @CurrentUser() user: JwtUser,
    @Query("viewAsAdminId") viewAsAdminId?: string,
  ): Promise<MerchantDetailResponseDto> {
    // Check if user is a super admin using the AdminAdminsService
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);

    return this.merchantsService.findOne(
      merchantId,
      user,
      isSuperAdmin && viewAsAdminId ? viewAsAdminId : undefined,
    );
  }

  /**
   * Updates a merchant by ID
   * Only the admin who created the merchant or a superadmin can update it
   *
   * @param merchantId - The unique ID of the merchant to update
   * @param updateMerchantDto - The update data
   * @param user - The authenticated admin user
   * @returns Updated merchant information
   */
  @Patch(":merchantId")
  @ApiOperation({
    summary: "Update Merchant",
    description: "Updates details for a specific merchant.",
  })
  @ApiParam({
    name: "merchantId",
    description: "The unique VARCHAR(8) ID of the merchant to update",
    example: "sticpay",
  })
  @ApiBody({ type: UpdateMerchantDto })
  @ApiResponse({
    status: 200,
    description: "Merchant updated successfully.",
    type: MerchantDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request. Invalid update data.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description:
      "Forbidden - You did not create this merchant and are not a superadmin.",
  })
  @ApiResponse({ status: 404, description: "Not Found. Merchant not found." })
  update(
    @Param("merchantId") merchantId: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
    @CurrentUser() user: JwtUser,
  ): Promise<MerchantDetailResponseDto> {
    return this.merchantsService.update(merchantId, updateMerchantDto, user);
  }

  /**
   * Soft deletes a merchant by ID
   * Only the admin who created the merchant or a superadmin can delete it
   *
   * @param merchantId - The unique ID of the merchant to delete
   * @param user - The authenticated admin user
   */
  @Delete(":merchantId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete Merchant (Soft)",
    description:
      "Soft deletes a merchant and deactivates associated user/agents.",
  })
  @ApiParam({
    name: "merchantId",
    description: "The unique VARCHAR(8) ID of the merchant to delete",
    example: "oldmerc",
  })
  @ApiResponse({
    status: 204,
    description: "Merchant soft deleted successfully.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description:
      "Forbidden - You did not create this merchant and are not a superadmin.",
  })
  @ApiResponse({ status: 404, description: "Not Found. Merchant not found." })
  remove(
    @Param("merchantId") merchantId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    return this.merchantsService.remove(merchantId, user);
  }

  /**
   * Exports merchants data to Excel format
   *
   * @param user - The authenticated admin user
   * @param query - Query parameters for filtering
   * @param viewAsAdminId - Optional admin ID to view merchants as (SuperAdmin only)
   * @returns Object with URL to download the Excel file
   */
  @Post("export")
  @ApiOperation({ summary: "Export merchants to Excel" })
  @ApiResponse({
    status: 200,
    description: "Returns URL to download Excel file",
    type: ExportUrlResponseDto,
  })
  @ApiBody({
    type: AdminMerchantsQueryDto,
    description: "Merchant filter criteria",
  })
  @ApiQuery({
    name: "viewAsAdminId",
    type: String,
    required: false,
    description: "(SuperAdmin only) View merchants created by this Admin ID",
  })
  async exportMerchants(
    @CurrentUser() user: JwtUser,
    @Body() query: AdminMerchantsQueryDto,
    @Query("viewAsAdminId") viewAsAdminId?: string,
  ): Promise<ExportUrlResponseDto> {
    // Check if user is a super admin using the AdminAdminsService
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);

    return this.merchantsService.exportMerchantsToExcel(
      query,
      user,
      isSuperAdmin && viewAsAdminId ? viewAsAdminId : undefined,
    );
  }

  /**
   * Exports merchant balance logs to Excel format
   *
   * @param user - The authenticated admin user
   * @param query - Query parameters for filtering
   * @param viewAsAdminId - Optional admin ID to view logs as (SuperAdmin only)
   * @returns Object with URL to download the Excel file
   */
  @Post("balance-logs/export")
  @ApiOperation({ summary: "Export merchant balance logs to Excel" })
  @ApiResponse({
    status: 200,
    description: "Returns URL to download Excel file",
    type: ExportUrlResponseDto,
  })
  @ApiBody({
    type: MerchantBalanceLogQueryDto,
    description: "Balance log filter criteria",
  })
  @ApiQuery({
    name: "viewAsAdminId",
    type: String,
    required: false,
    description: "(SuperAdmin only) View logs created by this Admin ID",
  })
  async exportBalanceLogs(
    @CurrentUser() user: JwtUser,
    @Body() query: MerchantBalanceLogQueryDto,
    @Query("viewAsAdminId") viewAsAdminId?: string,
  ): Promise<ExportUrlResponseDto> {
    // Check if user is a super admin using the AdminAdminsService
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);

    return this.merchantsService.exportBalanceLogsToExcel(
      "all", // Always export all merchants
      user,
      isSuperAdmin && viewAsAdminId ? viewAsAdminId : undefined,
    );
  }

  /**
   * Restores a soft-deleted merchant
   * Only the admin who created the merchant or a superadmin can restore it
   *
   * @param merchantId - The unique ID of the merchant to restore
   * @param user - The authenticated admin user
   * @returns The restored merchant details
   */
  @Post(":merchantId/restore")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Restore Deleted Merchant",
    description:
      "Restores a previously deleted merchant and reactivates associated user account.",
  })
  @ApiParam({
    name: "merchantId",
    description: "The unique VARCHAR(8) ID of the merchant to restore",
    example: "oldmerc",
  })
  @ApiResponse({
    status: 200,
    description: "Merchant restored successfully.",
    type: MerchantDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description:
      "Forbidden - You did not create this merchant and are not a superadmin.",
  })
  @ApiResponse({ status: 404, description: "Not Found. Merchant not found." })
  @ApiResponse({
    status: 400,
    description: "Bad Request. Merchant is not deleted.",
  })
  async restoreMerchant(
    @Param("merchantId") merchantId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<MerchantDetailResponseDto> {
    return this.merchantsService.restoreMerchant(merchantId, user);
  }

  /**
   * Updates a merchant's balance (deposit, withdraw, or adjust)
   * Only the admin who created the merchant or a superadmin can update the balance
   *
   * @param merchantId - The unique ID of the merchant
   * @param updateBalanceDto - The balance update data
   * @param user - The authenticated admin user
   * @returns Updated merchant information
   */
  @Patch(":merchantId/balance")
  @ApiOperation({
    summary: "Update Merchant Balance",
    description: "Updates the balance for a specific merchant.",
  })
  @ApiParam({
    name: "merchantId",
    description: "The unique VARCHAR(8) ID of the merchant",
    example: "sticpay",
  })
  @ApiBody({ type: UpdateMerchantBalanceDto })
  @ApiResponse({
    status: 200,
    description: "Merchant balance updated successfully.",
    type: MerchantDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description:
      "Forbidden - You did not create this merchant and are not a superadmin.",
  })
  @ApiResponse({
    status: 404,
    description: "Not Found. Merchant with the specified ID does not exist.",
  })
  updateBalance(
    @Param("merchantId") merchantId: string,
    @Body() updateBalanceDto: UpdateMerchantBalanceDto,
    @CurrentUser() user: JwtUser,
  ): Promise<MerchantDetailResponseDto> {
    const { amount, operationType, reason } = updateBalanceDto;
    return this.merchantsService.updateMerchantBalance(
      merchantId,
      amount,
      operationType,
      reason,
      user,
    );
  }

  /**
   * Gets balance history for a merchant
   * Only the admin who created the merchant or a superadmin can view the history
   *
   * @param merchantId - The unique ID of the merchant
   * @param page - Page number for pagination
   * @param limit - Items per page
   * @param user - The authenticated admin user
   * @returns Paginated list of balance log entries
   */
  @Get(":merchantId/balance-history")
  @ApiOperation({
    summary: "Get Merchant Balance History",
    description: "Retrieves balance history for a specific merchant.",
  })
  @ApiParam({
    name: "merchantId",
    description: "The unique VARCHAR(8) ID of the merchant",
    example: "sticpay",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number for pagination",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of items per page",
  })
  @ApiResponse({
    status: 200,
    description: "Merchant balance history retrieved.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description:
      "Forbidden - You did not create this merchant and are not a superadmin.",
  })
  @ApiResponse({
    status: 404,
    description: "Not Found. Merchant with the specified ID does not exist.",
  })
  getBalanceHistory(
    @Param("merchantId") merchantId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @CurrentUser() user: JwtUser,
  ) {
    return this.merchantsService.getMerchantBalanceHistory(
      merchantId,
      page,
      limit,
      user,
    );
  }
}
