import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AdminVirtualAccountsService } from "./admin-virtual-accounts.service";
import { VirtualAccountQueryDto } from "./dto/virtual-account-query.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RoleName, VirtualAccount } from "@ezpg/database";
import { TfaSessionGuard } from "../../auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "../../auth/guards/first-login.guard";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";

// Define response DTO for Swagger
class PaginatedVirtualAccountResponse {
  @ApiProperty({ type: [Object] }) // Use generic Object or define a specific VA DTO
  data: VirtualAccount[];
  @ApiProperty() totalItems: number;
  @ApiProperty() totalPages: number;
  @ApiProperty() currentPage: number;
}

@ApiTags("Admin - Virtual Accounts (Read-Only)")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/virtual-accounts")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminVirtualAccountsController {
  constructor(private readonly vaService: AdminVirtualAccountsService) {}

  @Get()
  @ApiOperation({
    summary: "List Virtual Accounts",
    description:
      "Retrieves a paginated list of virtual accounts based on query filters.",
  })
  @ApiResponse({
    status: 200,
    description: "List of virtual accounts retrieved.",
    type: PaginatedVirtualAccountResponse,
  })
  findAll(
    @Query() query: VirtualAccountQueryDto,
  ): Promise<PaginatedResult<VirtualAccount>> {
    // Page References: Admin -> 가상계좌 정보 (admin.pdf, page 1 menu item - No specific page shown)
    return this.vaService.findAll(query);
  }
}
