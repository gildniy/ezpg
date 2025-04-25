import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminWithdrawalsService } from "./admin-withdrawals.service";
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";
import { MerchantWithdrawalQueryDto } from "./dto/merchant-withdrawal-query.dto";
import { AgentWithdrawalQueryDto } from "./dto/agent-withdrawal-query.dto";
import { MerchantWithdrawalStatsDto } from "./dto/merchant-withdrawal-stats.dto";
import { AgentWithdrawalStatsDto } from "./dto/agent-withdrawal-stats.dto";
import {
  MerchantWithdrawalResponseDto,
  PaginatedMerchantWithdrawalsResponseDto,
} from "./dto/merchant-withdrawal-response.dto";
import {
  AgentWithdrawalResponseDto,
  PaginatedAgentWithdrawalsResponseDto,
} from "./dto/agent-withdrawal-response.dto";
import { UpdateMerchantWithdrawalDto } from "./dto/merchant-withdrawal-update.dto";
import { UpdateAgentWithdrawalDto } from "./dto/agent-withdrawal-update.dto";

@ApiTags("Admin - Withdrawals")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/withdrawals")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminWithdrawalsController {
  constructor(private readonly withdrawalsService: AdminWithdrawalsService) {}

  // Merchant Withdrawal Endpoints
  @Get("merchants")
  @ApiOperation({
    summary: "List Merchant Withdrawals",
    description:
      "Retrieves a paginated list of merchant withdrawal requests with optional filters. By default, returns data for the current day if no dates are specified.",
  })
  @ApiQuery({ type: MerchantWithdrawalQueryDto })
  @ApiResponse({
    status: 200,
    description: "List of merchant withdrawals retrieved successfully.",
    type: PaginatedMerchantWithdrawalsResponseDto,
  })
  findAllMerchantWithdrawals(
    @Query() query: MerchantWithdrawalQueryDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.withdrawalsService.findAllMerchantWithdrawals(
      query,
      user.userId,
      user.role as RoleName,
    );
  }

  @Get("merchants/stats")
  @ApiOperation({
    summary: "Get Merchant Withdrawal Statistics",
    description:
      "Retrieves statistics for merchant withdrawals matching the filter criteria.",
  })
  @ApiQuery({ type: MerchantWithdrawalQueryDto })
  @ApiResponse({
    status: 200,
    description: "Merchant withdrawal statistics retrieved successfully.",
    type: MerchantWithdrawalStatsDto,
  })
  getMerchantWithdrawalStats(
    @Query() query: MerchantWithdrawalQueryDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.withdrawalsService.getMerchantWithdrawalStats(
      query,
      user.userId,
      user.role as RoleName,
    );
  }

  @Post("merchants/export")
  @ApiOperation({
    summary: "Export Merchant Withdrawals to Excel",
    description:
      "Exports the merchant withdrawals matching the filter criteria to an Excel file.",
  })
  @ApiBody({ type: MerchantWithdrawalQueryDto })
  @ApiResponse({
    status: 200,
    description: "Returns URL to download Excel file",
    schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          example:
            "/api/admin/withdrawals/download/merchant-withdrawals-export-1234567890.xlsx",
        },
      },
    },
  })
  exportMerchantWithdrawals(
    @Body() query: MerchantWithdrawalQueryDto,
    @CurrentUser() user: JwtUser,
  ): Promise<{ url: string }> {
    return this.withdrawalsService.exportMerchantWithdrawals(
      query,
      user.userId,
      user.role as RoleName,
    );
  }

  @Put("merchants/:withdrawalId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update Merchant Withdrawal Status",
    description: "Updates the status of a merchant withdrawal request.",
  })
  @ApiParam({
    name: "withdrawalId",
    description: "ID of the merchant withdrawal request",
    type: String,
  })
  @ApiBody({ type: UpdateMerchantWithdrawalDto })
  @ApiResponse({
    status: 200,
    description: "Merchant withdrawal status updated successfully.",
    type: MerchantWithdrawalResponseDto,
  })
  updateMerchantWithdrawalStatus(
    @Param("withdrawalId") withdrawalId: string,
    @Body() dto: UpdateMerchantWithdrawalDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.withdrawalsService.updateMerchantWithdrawalStatus(
      withdrawalId,
      dto,
      user.userId,
    );
  }

  // Agent Withdrawal Endpoints
  @Get("agents")
  @ApiOperation({
    summary: "List Agent Withdrawals",
    description:
      "Retrieves a paginated list of agent withdrawal requests with optional filters. By default, returns data for the current day if no dates are specified.",
  })
  @ApiQuery({ type: AgentWithdrawalQueryDto })
  @ApiResponse({
    status: 200,
    description: "List of agent withdrawals retrieved successfully.",
    type: PaginatedAgentWithdrawalsResponseDto,
  })
  findAllAgentWithdrawals(
    @Query() query: AgentWithdrawalQueryDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.withdrawalsService.findAllAgentWithdrawals(
      query,
      user.userId,
      user.role as RoleName,
    );
  }

  @Get("agents/stats")
  @ApiOperation({
    summary: "Get Agent Withdrawal Statistics",
    description:
      "Retrieves statistics for agent withdrawals matching the filter criteria.",
  })
  @ApiQuery({ type: AgentWithdrawalQueryDto })
  @ApiResponse({
    status: 200,
    description: "Agent withdrawal statistics retrieved successfully.",
    type: AgentWithdrawalStatsDto,
  })
  getAgentWithdrawalStats(
    @Query() query: AgentWithdrawalQueryDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.withdrawalsService.getAgentWithdrawalStats(
      query,
      user.userId,
      user.role as RoleName,
    );
  }

  @Post("agents/export")
  @ApiOperation({
    summary: "Export Agent Withdrawals to Excel",
    description:
      "Exports the agent withdrawals matching the filter criteria to an Excel file.",
  })
  @ApiBody({ type: AgentWithdrawalQueryDto })
  @ApiResponse({
    status: 200,
    description: "Returns URL to download Excel file",
    schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          example:
            "/api/admin/withdrawals/download/agent-withdrawals-export-1234567890.xlsx",
        },
      },
    },
  })
  exportAgentWithdrawals(
    @Body() query: AgentWithdrawalQueryDto,
    @CurrentUser() user: JwtUser,
  ): Promise<{ url: string }> {
    return this.withdrawalsService.exportAgentWithdrawals(
      query,
      user.userId,
      user.role as RoleName,
    );
  }

  @Put("agents/:withdrawalId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update Agent Withdrawal Status",
    description: "Updates the status of an agent withdrawal request.",
  })
  @ApiParam({
    name: "withdrawalId",
    description: "ID of the agent withdrawal request",
    type: String,
  })
  @ApiBody({ type: UpdateAgentWithdrawalDto })
  @ApiResponse({
    status: 200,
    description: "Agent withdrawal status updated successfully.",
    type: AgentWithdrawalResponseDto,
  })
  updateAgentWithdrawalStatus(
    @Param("withdrawalId") withdrawalId: string,
    @Body() dto: UpdateAgentWithdrawalDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.withdrawalsService.updateAgentWithdrawalStatus(
      withdrawalId,
      dto,
      user.userId,
    );
  }
}
