import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AdminCustomersService } from "./admin-customers.service";
import { AdminCustomerQueryDto } from "./dto/customer-query.dto";
// ... import guards, decorators, RoleName ...
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RoleName } from "@ezpg/database";
import { TfaSessionGuard } from "../../auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "../../auth/guards/first-login.guard";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

// Define response DTO for customer data
class AdminCustomerDataDto {
  @ApiProperty({ description: "User ID", example: "1234567890" })
  user_id: string | null;

  @ApiProperty({ description: "Merchant ID", example: "sticpay" })
  merchant_id: string | null;

  @ApiProperty({ description: "Depositor name", example: "John Doe" })
  depositor_name: string | null;

  @ApiProperty({
    description: "Virtual account user name",
    example: "John Doe",
  })
  virtual_account_user_name: string | null;

  @ApiProperty({ description: "First activity date", example: "2023-01-15" })
  first_activity: string | null;

  @ApiProperty({ description: "Last activity date", example: "2023-07-10" })
  last_activity: string | null;

  @ApiProperty({ description: "Total deposit amount", example: "1000000" })
  total_deposit_amount: string | null;

  @ApiProperty({ description: "Number of deposits", example: "25" })
  deposit_count: string | null;
}

// Define paginated response for customer data
class PaginatedCustomersResponseDto {
  @ApiProperty({
    description: "Array of customer records",
    type: [AdminCustomerDataDto],
    isArray: true,
  })
  data: AdminCustomerDataDto[];

  @ApiProperty({
    description: "Total number of customers matching the query",
    example: 150,
  })
  totalItems: number;

  @ApiProperty({ description: "Total number of pages", example: 15 })
  totalPages: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  currentPage: number;
}

@ApiTags("Admin - Customers (Read-Only)")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/customers")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminCustomersController {
  constructor(private readonly customersService: AdminCustomersService) {}

  @Get()
  @ApiOperation({
    summary: "List Customers",
    description:
      "Retrieves a paginated list of customers across all merchants with optional filtering by merchant",
  })
  @ApiQuery({ type: AdminCustomerQueryDto })
  @ApiResponse({
    status: 200,
    description: "Customer list retrieved successfully",
    type: PaginatedCustomersResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  findAll(
    @Query() query: AdminCustomerQueryDto,
  ): Promise<PaginatedResult<AdminCustomerDataDto>> {
    // Page References: Admin -> 회원 관리 (admin.pdf)
    return this.customersService.findAll(query);
  }
}
