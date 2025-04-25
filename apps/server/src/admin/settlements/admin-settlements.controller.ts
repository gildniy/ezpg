import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AdminSettlementsService } from "./admin-settlements.service";
import { AdminSettlementQueryDto } from "./dto/settlement-query.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RoleName } from "@ezpg/database";
import { TfaSessionGuard } from "../../auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "../../auth/guards/first-login.guard";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";

// Define response DTO for Swagger
class AdminSettlementDataDto {
  @ApiProperty({
    description: "Settlement date (YYYY-MM-DD)",
    example: "2023-06-15",
  })
  date: string;

  @ApiProperty({ description: "Merchant ID", example: "sticpay" })
  merchantId: string;

  @ApiProperty({
    description: "Merchant name",
    example: "Stic Payment Solutions",
    required: false,
  })
  merchantName?: string;

  @ApiProperty({
    description: "Total deposit amount for the period",
    example: 1500000,
  })
  depositAmount: number;

  @ApiProperty({
    description: "Number of deposits during the period",
    example: 45,
  })
  depositCount: number;

  @ApiProperty({
    description: "Total cancellation amount for the period",
    example: 50000,
  })
  cancelAmount: number;

  @ApiProperty({
    description: "Number of cancellations during the period",
    example: 3,
  })
  cancelCount: number;

  @ApiProperty({
    description: "Total withdrawal amount for the period",
    example: 1000000,
  })
  totalWithdrawalAmount: number;
}

class PaginatedAdminSettlementResponse {
  @ApiProperty({
    description: "Array of settlement records",
    type: [AdminSettlementDataDto],
    isArray: true,
  })
  data: AdminSettlementDataDto[];

  @ApiProperty({
    description: "Total number of settlement records",
    example: 120,
  })
  totalItems: number;

  @ApiProperty({ description: "Total number of pages", example: 12 })
  totalPages: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  currentPage: number;
}

@ApiTags("Admin - Settlements (Read-Only)")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/settlements")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminSettlementsController {
  constructor(private readonly settlementsService: AdminSettlementsService) {}

  @Get()
  @ApiOperation({
    summary: "Get Aggregated Settlement Report (Admin View)",
    description: "Retrieves daily settlement data aggregated across merchants.",
  })
  @ApiQuery({ type: AdminSettlementQueryDto })
  @ApiResponse({
    status: 200,
    description: "Settlement report retrieved.",
    type: PaginatedAdminSettlementResponse,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  getSettlementReport(
    @Query() query: AdminSettlementQueryDto,
  ): Promise<PaginatedResult<AdminSettlementDataDto>> {
    // Page References: Admin -> 정산 관리 (admin.pdf, page 1 menu item - No specific page shown)
    return this.settlementsService.getSettlementReport(query);
  }
}
