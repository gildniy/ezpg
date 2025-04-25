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
import { AdminAgentsService } from "./admin-agents.service";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdateAgentDto } from "./dto/update-agent.dto";
import { AgentQueryDto } from "./dto/agent-query.dto";
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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  AgentResponseDto,
  PaginatedAgentResponseDto,
} from "./dto/agent-response.dto";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";
import { AgentBalanceUpdateDto } from "./dto/agent-balance-update.dto";
import { RoleName } from "@ezpg/database";
import { TfaResetResponseDto } from "../users/dto/tfa-reset-response.dto";
import { ExportUrlResponseDto } from "../../common/dto/export-url-response.dto";

/**
 * Controller for handling admin agent operations
 * Provides endpoints for CRUD operations on agents
 */
@ApiTags("Admin - Agents")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/agents")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@UseInterceptors(ClassSerializerInterceptor)
export class AdminAgentsController {
  constructor(private readonly agentsService: AdminAgentsService) {}

  /**
   * Create a new agent
   *
   * @param createAgentDto - The agent creation details
   * @param user - The authenticated admin user
   * @returns The created agent details
   */
  @Post()
  @ApiOperation({
    summary: "Create a new agent",
    description: "Creates a new agent account (Admin only).",
  })
  @ApiBody({ type: CreateAgentDto })
  @ApiCreatedResponse({
    description: "Agent created successfully.",
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request - Invalid input." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  async create(
    @Body() createAgentDto: CreateAgentDto,
    @CurrentUser() user: JwtUser,
  ): Promise<AgentResponseDto> {
    return this.agentsService.create(createAgentDto, user);
  }

  /**
   * Get a paginated list of active agents
   *
   * @param query - The query parameters for filtering agents
   * @param user - The authenticated admin user
   * @returns The paginated list of active agents
   */
  @Get()
  @ApiOperation({
    summary: "List active agents",
    description: "Retrieves a paginated list of active agents.",
  })
  @ApiOkResponse({
    description: "List of active agents retrieved successfully.",
    type: PaginatedAgentResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  findAll(
    @Query() query: AgentQueryDto,
    @CurrentUser() user: JwtUser,
  ): Promise<PaginatedAgentResponseDto> {
    return this.agentsService.findAll(query, user);
  }

  /**
   * Get a paginated list of deleted agents
   *
   * @param query - The query parameters for filtering agents
   * @param user - The authenticated admin user
   * @returns The paginated list of deleted agents
   */
  @Get("deleted")
  @ApiOperation({
    summary: "List deleted agents",
    description: "Retrieves a paginated list of deleted agents.",
  })
  @ApiOkResponse({
    description: "List of deleted agents retrieved successfully.",
    type: PaginatedAgentResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  findDeleted(
    @Query() query: AgentQueryDto,
    @CurrentUser() user: JwtUser,
  ): Promise<PaginatedAgentResponseDto> {
    return this.agentsService.findDeleted(query, user);
  }

  /**
   * Get a specific agent by ID
   *
   * @param id - The unique ID of the agent
   * @param user - The authenticated admin user
   * @returns The agent details
   */
  @Get(":agentId")
  @ApiOperation({
    summary: "Get agent details",
    description: "Retrieves detailed information about a specific agent.",
  })
  @ApiParam({
    name: "agentId",
    type: "string",
    description: "ID of the agent",
    example: "AG000001",
  })
  @ApiOkResponse({
    description: "Agent details retrieved successfully.",
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  @ApiResponse({ status: 404, description: "Agent not found." })
  findOne(
    @Param("agentId") agentId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<AgentResponseDto> {
    return this.agentsService.findOne(agentId, user);
  }

  /**
   * Update an existing agent
   *
   * @param id - The unique ID of the agent
   * @param updateAgentDto - The updated agent information
   * @param user - The authenticated admin user
   * @returns The updated agent details
   */
  @Patch(":agentId")
  @ApiOperation({
    summary: "Update agent",
    description: "Updates an existing agent's information.",
  })
  @ApiParam({
    name: "agentId",
    type: "string",
    description: "ID of the agent to update",
    example: "AG000001",
  })
  @ApiBody({ type: UpdateAgentDto })
  @ApiOkResponse({
    description: "Agent updated successfully.",
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request - Invalid input." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  @ApiResponse({ status: 404, description: "Agent not found." })
  update(
    @Param("agentId") agentId: string,
    @Body() updateAgentDto: UpdateAgentDto,
    @CurrentUser() user: JwtUser,
  ): Promise<AgentResponseDto> {
    return this.agentsService.update(agentId, updateAgentDto, user);
  }

  /**
   * Delete (soft delete) an agent
   *
   * @param id - The unique ID of the agent
   * @param user - The authenticated admin user
   * @returns The deleted agent details
   */
  @Delete(":agentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete agent",
    description: "Soft deletes an agent account.",
  })
  @ApiParam({
    name: "agentId",
    type: "string",
    description: "ID of the agent to delete",
    example: "AG000001",
  })
  @ApiNoContentResponse({ description: "Agent deleted successfully." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  @ApiResponse({ status: 404, description: "Agent not found." })
  remove(
    @Param("agentId") agentId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    return this.agentsService.remove(agentId, user);
  }

  /**
   * Restore a previously deleted agent
   *
   * @param id - The unique ID of the agent
   * @param user - The authenticated admin user
   * @returns The restored agent details
   */
  @Post(":agentId/restore")
  @ApiOperation({
    summary: "Restore agent",
    description: "Restores a previously deleted agent account.",
  })
  @ApiParam({
    name: "agentId",
    type: "string",
    description: "ID of the agent to restore",
    example: "AG000001",
  })
  @ApiOkResponse({
    description: "Agent restored successfully.",
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request - Agent not deleted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  @ApiResponse({ status: 404, description: "Agent not found." })
  restore(
    @Param("agentId") agentId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<AgentResponseDto> {
    return this.agentsService.restore(agentId, user);
  }

  /**
   * Update agent balance (deposit, withdraw, or adjust)
   *
   * @param id - The unique ID of the agent
   * @param balanceUpdateDto - The balance update details
   * @param user - The authenticated admin user
   * @returns The updated agent details
   */
  @Post(":agentId/balance")
  @ApiOperation({
    summary: "Update agent balance",
    description:
      "Updates the balance of an agent (deposit, withdraw, or adjust).",
  })
  @ApiParam({
    name: "agentId",
    type: "string",
    description: "ID of the agent",
    example: "AG000001",
  })
  @ApiBody({ type: AgentBalanceUpdateDto })
  @ApiOkResponse({
    description: "Agent balance updated successfully.",
    type: AgentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid input or insufficient balance.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  @ApiResponse({ status: 404, description: "Agent not found." })
  updateBalance(
    @Param("agentId") agentId: string,
    @Body() balanceUpdateDto: AgentBalanceUpdateDto,
    @CurrentUser() user: JwtUser,
  ): Promise<AgentResponseDto> {
    return this.agentsService.updateBalance(agentId, balanceUpdateDto, user);
  }

  /**
   * Get agent balance history
   *
   * @param id - The unique ID of the agent
   * @param page - The page number for pagination
   * @param limit - The number of items per page
   * @param user - The authenticated admin user
   * @returns The balance history for the specified agent
   */
  @Get(":agentId/balance/history")
  @ApiOperation({
    summary: "Get agent balance history",
    description: "Retrieves the balance history for a specific agent.",
  })
  @ApiParam({
    name: "agentId",
    type: "string",
    description: "ID of the agent",
    example: "AG000001",
  })
  @ApiQuery({
    name: "page",
    description: "Page number",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    description: "Number of items per page",
    required: false,
    type: Number,
  })
  @ApiOkResponse({
    description: "Agent balance history retrieved successfully.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  @ApiResponse({ status: 404, description: "Agent not found." })
  getBalanceHistory(
    @Param("agentId") agentId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.agentsService.getBalanceHistory(agentId, page, limit, user);
  }

  /**
   * Export agents list to Excel
   *
   * @param query - The query parameters for filtering agents
   * @param user - The authenticated admin user
   * @returns The URL of the exported Excel file
   */
  @Get("export/excel")
  @ApiOperation({
    summary: "Export agents to Excel",
    description: "Exports the filtered agents list to Excel format.",
  })
  @ApiOkResponse({
    description: "Export URL generated successfully.",
    type: ExportUrlResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  exportToExcel(
    @Query() query: AgentQueryDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ExportUrlResponseDto> {
    return this.agentsService.exportAgentsToExcel(query, user);
  }

  /**
   * Export agent balance history to Excel
   *
   * @param id - The unique ID of the agent
   * @param user - The authenticated admin user
   * @returns The URL of the exported Excel file
   */
  @Get(":agentId/balance/export/excel")
  @ApiOperation({
    summary: "Export agent balance logs to Excel",
    description: "Exports the agent balance history to Excel format.",
  })
  @ApiParam({
    name: "agentId",
    type: "string",
    description: "ID of the agent",
    example: "AG000001",
  })
  @ApiOkResponse({
    description: "Export URL generated successfully.",
    type: ExportUrlResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required.",
  })
  @ApiResponse({ status: 404, description: "Agent not found." })
  exportBalanceLogsToExcel(
    @Param("agentId") agentId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<ExportUrlResponseDto> {
    return this.agentsService.exportBalanceLogsToExcel(agentId, user);
  }

  /**
   * Resets TFA for an agent
   * Only the admin who created the agent can reset their TFA
   *
   * @param id - The unique ID of the agent
   * @param user - The authenticated admin user
   * @returns TFA setup information
   */
  @Post(":agentId/reset-tfa")
  @ApiOperation({
    summary: "Reset TFA for an agent",
    description:
      "Resets two-factor authentication for a specific agent. Only the admin who created the agent can perform this action.",
  })
  @ApiParam({
    name: "agentId",
    description: "The unique ID of the agent to reset TFA for",
    example: "agent123",
  })
  @ApiOkResponse({
    description: "TFA reset successfully",
    type: TfaResetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Agent is deleted or has no user account",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Not authorized to reset TFA for this agent",
  })
  @ApiResponse({ status: 404, description: "Agent not found" })
  async resetTfa(
    @Param("agentId") agentId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<TfaResetResponseDto> {
    return this.agentsService.resetAgentTfa(agentId, user);
  }

  @Delete(":agentId/permanent")
  @ApiOperation({ summary: "Permanently delete an agent (soft delete only)" })
  @ApiParam({ name: "agentId", description: "Agent ID" })
  async permanentDelete(
    @Param("agentId") agentId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    return this.agentsService.permanentDelete(agentId, user);
  }
}
