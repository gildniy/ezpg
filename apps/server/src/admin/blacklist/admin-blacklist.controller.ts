import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminBlacklistService } from "./admin-blacklist.service";
import { CreateBlacklistDto } from "./dto/create-blacklist.dto";
import { BlacklistQueryDto } from "./dto/blacklist-query.dto";
// ... import guards, decorators, RoleName ...
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RoleName } from "@ezpg/database";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { TfaSessionGuard } from "../../auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "../../auth/guards/first-login.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";

// Define response schema for blacklist
class BlacklistEntryDto {
  @ApiProperty({ description: "Blacklist entry ID", example: 123 })
  blacklist_id: number;

  @ApiProperty({
    description: "Type of blacklisted value (BANK_ACCOUNT, PHONE, IP, etc.)",
    example: "BANK_ACCOUNT",
  })
  type: string;

  @ApiProperty({
    description: "The blacklisted value",
    example: "1234567890123456",
  })
  value: string;

  @ApiProperty({
    description: "Bank code if applicable",
    example: "088",
    required: false,
  })
  bank_code?: string;

  @ApiProperty({
    description: "Bank account holder name if applicable",
    example: "John Doe",
    required: false,
  })
  bank_account_holder?: string;

  @ApiProperty({
    description: "Reason for blacklisting",
    example: "Fraudulent activity detected",
  })
  reason: string;

  @ApiProperty({
    description: "Admin user ID who created this entry",
    example: 1,
  })
  created_by: string;

  @ApiProperty({ description: "Admin username", example: "admin_user" })
  created_by_username: string;

  @ApiProperty({
    description: "Entry creation timestamp",
    example: "2023-07-10T14:30:00Z",
  })
  created_at: Date;
}

// Define paginated response for blacklist
class PaginatedBlacklistResponseDto {
  @ApiProperty({
    description: "Array of blacklist entries",
    type: [BlacklistEntryDto],
    isArray: true,
  })
  data: BlacklistEntryDto[];

  @ApiProperty({
    description: "Total number of entries matching the query",
    example: 45,
  })
  totalItems: number;

  @ApiProperty({ description: "Total number of pages", example: 5 })
  totalPages: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  currentPage: number;
}

@ApiTags("Admin - Blacklist")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/blacklist")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminBlacklistController {
  constructor(private readonly blacklistService: AdminBlacklistService) {}

  @Post()
  @ApiOperation({
    summary: "Add Blacklist Entry",
    description:
      "Creates a new blacklist entry to block fraudulent accounts, devices, etc.",
    operationId: "addBlacklistEntry",
  })
  @ApiBody({ type: CreateBlacklistDto })
  @ApiResponse({
    status: 201,
    description: "Blacklist entry created successfully",
    type: BlacklistEntryDto,
  })
  @ApiResponse({ status: 400, description: "Bad request - Invalid input" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 409, description: "Conflict - Entry already exists" })
  create(
    @Body() dto: CreateBlacklistDto,
    @CurrentUser() adminUser: JwtUser,
  ): Promise<BlacklistEntryDto> {
    // Page References: Admin -> 블랙리스트 관리 -> Create Action
    return this.blacklistService.create(
      dto,
      adminUser,
    ) as Promise<BlacklistEntryDto>;
  }

  @Get()
  @ApiOperation({
    summary: "List Blacklist Entries",
    description:
      "Retrieves a paginated list of blacklist entries with optional filtering",
    operationId: "listBlacklistEntries",
  })
  @ApiQuery({ type: BlacklistQueryDto })
  @ApiResponse({
    status: 200,
    description: "Blacklist entries retrieved successfully",
    type: PaginatedBlacklistResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  findAll(
    @Query() query: BlacklistQueryDto,
  ): Promise<PaginatedResult<BlacklistEntryDto>> {
    // Page References: Admin -> 블랙리스트 관리
    return this.blacklistService.findAll(query);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Remove Blacklist Entry",
    description: "Removes an entry from the blacklist",
    operationId: "deleteBlacklistEntry",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Blacklist entry ID",
    example: 123,
  })
  @ApiResponse({
    status: 204,
    description: "Blacklist entry removed successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "Blacklist entry not found" })
  remove(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    // Page References: Admin -> 블랙리스트 관리 -> Delete Action
    return this.blacklistService.remove(id, user);
  }
}
