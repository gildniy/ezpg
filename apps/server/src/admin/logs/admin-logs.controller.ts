import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AdminLogsService } from "./admin-logs.service";
import {
  AdminLogQueryDto,
  AgentBalanceLogQueryDto,
  MerchantBalanceLogQueryDto,
} from "./dto/log-query.dto";
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
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import {
  AdminLogDto,
  PaginatedAdminLogResponseDto,
} from "./dto/admin-log-response.dto";
import {
  AgentBalanceLogDto,
  PaginatedAgentBalanceLogResponseDto,
} from "./dto/agent-balance-log-response.dto";
import {
  MerchantBalanceLogDto,
  PaginatedMerchantBalanceLogResponseDto,
} from "./dto/merchant-balance-log-response.dto";

@ApiTags("Admin - Logs")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/logs")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminLogsController {
  constructor(private readonly logsService: AdminLogsService) {}

  @Get("admin")
  @ApiOperation({
    summary: "Get Admin Action Logs",
    description:
      "Retrieves logs of admin actions with pagination and filtering",
  })
  @ApiQuery({ type: AdminLogQueryDto })
  @ApiResponse({
    status: 200,
    description: "Admin logs retrieved successfully",
    type: PaginatedAdminLogResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  getAdminLogs(
    @Query() query: AdminLogQueryDto,
  ): Promise<PaginatedResult<AdminLogDto>> {
    // Page References: Admin -> 관리자 활동 로그 (admin.pdf, page 30)
    return this.logsService.findAdminLogs(query);
  }

  @Get("agent-balance")
  @ApiOperation({
    summary: "Get Agent Balance Logs",
    description:
      "Retrieves logs of agent balance changes with pagination and filtering",
  })
  @ApiQuery({ type: AgentBalanceLogQueryDto })
  @ApiResponse({
    status: 200,
    description: "Agent balance logs retrieved successfully",
    type: PaginatedAgentBalanceLogResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  getAgentBalanceLogs(
    @Query() query: AgentBalanceLogQueryDto,
  ): Promise<PaginatedResult<AgentBalanceLogDto>> {
    // Page References: Admin -> 에이전트 잔액 변동 로그 (admin.pdf, page 31)
    return this.logsService.findAgentBalanceLogs(query);
  }

  @Get("merchant-balance")
  @ApiOperation({
    summary: "Get Merchant Balance Logs",
    description:
      "Retrieves logs of merchant balance changes with pagination and filtering",
  })
  @ApiQuery({ type: MerchantBalanceLogQueryDto })
  @ApiResponse({
    status: 200,
    description: "Merchant balance logs retrieved successfully",
    type: PaginatedMerchantBalanceLogResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  getMerchantBalanceLogs(
    @Query() query: MerchantBalanceLogQueryDto,
  ): Promise<PaginatedResult<MerchantBalanceLogDto>> {
    // Page References: Admin -> 가맹점 잔액 변동 로그 (admin.pdf, page 32)
    return this.logsService.findMerchantBalanceLogs(query);
  }
}
