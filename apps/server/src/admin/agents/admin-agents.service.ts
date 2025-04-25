import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  Agent,
  AgentStatus,
  EntityType,
  LogSeverity,
  PrismaService,
  RoleName,
} from "@ezpg/database";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdateAgentDto } from "./dto/update-agent.dto";
import { AgentQueryDto } from "./dto/agent-query.dto";
import {
  AgentResponseDto,
  PaginatedAgentResponseDto,
} from "./dto/agent-response.dto";
import { LoggingService } from "../../core/logging/logging.service";
// import { LogSeverity } from "../../core/logging/log-severity.enum";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";
import {
  AgentBalanceUpdateDto,
  BalanceOperationType,
} from "./dto/agent-balance-update.dto";
import { LogAction } from "../../core/logging/log-action.enum";
import { DownloadService } from "../../core/download/download.service";
import { IdGeneratorService } from "../../core/id-generator/id-generator.service";
import { AdminUsersService } from "../users/admin-users.service";
import { AdminAdminsService } from "../admins/admin-admins.service";
import { getTfaQrCodeBase64 } from "../../core/tfa/tfa-qrcode.util";
import { EncryptionService } from "../../core/encryption/encryption.service";

/**
 * Service for managing agent operations in the admin panel
 * Provides methods for CRUD operations on agents and managing their balances
 */
@Injectable()
export class AdminAgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggingService,
    private readonly downloadService: DownloadService,
    private readonly idGeneratorService: IdGeneratorService,
    private readonly usersService: AdminUsersService,
    private readonly adminService: AdminAdminsService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Creates a new agent
   *
   * @param dto Data for creating an agent
   * @param user Current authenticated user
   * @returns Created agent data
   */
  async create(dto: CreateAgentDto, user: JwtUser): Promise<AgentResponseDto> {
    const {
      merchantId,
      agentUsername,
      agentName,
      balance,
      bankName,
      accountNumber,
      accountHolder,
      otpEnabled,
      isActive,
      notificationTime = "TWENTY_FOUR_HOURS",
      notificationTimeCustom,
      notificationTypes = ["PAYMENT_FAILED", "SYSTEM_DOWN"],
    } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Check if merchant exists first by string ID (from the DTO)
      const merchant = await tx.merchant.findUnique({
        where: { merchant_id: merchantId },
        select: {
          merchant_id: true,
          created_by: true,
          deleted_at: true,
        },
      });

      if (!merchant || merchant.deleted_at !== null) {
        throw new NotFoundException(
          `Merchant with ID ${merchantId} not found or has been deleted.`,
        );
      }

      // Authorization check
      const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
      if (!isSuperAdmin && merchant.created_by !== user.userId) {
        throw new ForbiddenException(
          `You are not authorized to create agents for merchant ${merchantId}.`,
        );
      }

      // For agents, we check by username (string) since that's what the DTO provides
      const existingAgent = await tx.agent.findFirst({
        where: {
          user: {
            username: agentUsername,
          },
        },
      });

      if (existingAgent) {
        throw new ConflictException(
          `Agent Username '${agentUsername}' is already in use.`,
        );
      }

      // Create user for the agent with TFA
      const { user: agentUser, tfa } = await this.usersService.createUser(
        {
          username: agentUsername,
          password: agentUsername, // Initially same as username
          roleName: RoleName.AGENT,
          tfaEnabled: otpEnabled || false,
          isActive: isActive || true,
          firstLogin: true,
        },
        otpEnabled || false, // Generate TFA only if enabled
      );

      // Create the agent record
      await tx.agent.create({
        data: {
          agent_id: agentUser.user_id,
          agent_name: agentName,
          merchant_id: merchant.merchant_id,
          balance: balance || 0,
          withdrawal_bank_name: bankName,
          withdrawal_account_number: accountNumber,
          withdrawal_account_holder: accountHolder,
          created_by: user.userId,
          mid: `${agentUsername.toUpperCase()}_${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
          mkey: undefined,
          email: "test@example.com",
          phone: "000-0000-0000",
          callback_url: `https://api.${agentUser.username}.com/callback`,
          notification_time: notificationTime,
          notification_time_custom:
            notificationTime === "CUSTOM" ? notificationTimeCustom : null,
          notification_types: notificationTypes,
          telegram_id: `@${agentUser.username}`,
        },
      });

      // Then fetch the created agent with relations
      const newAgent = await tx.agent.findUnique({
        where: { agent_id: agentUser.user_id },
        include: {
          merchant: {
            select: { merchant_id: true },
          },
          creator: {
            select: { username: true },
          },
          user: {
            select: {
              username: true,
              is_active: true,
              tfa_secret: true,
            },
          },
        },
      });

      // Log the agent creation
      await this.logger.logUserAction(
        user,
        LogAction.AGENT_CREATE,
        LogSeverity.INFO,
        EntityType.AGENT,
        newAgent.agent_id,
        {
          agentUsername,
          merchantId,
          agentName,
          isActive,
          tfaEnabled: otpEnabled,
        },
      );

      // Map to response DTO
      const responseDto = await this.mapToAgentResponseDto(newAgent, 1);

      // If TFA was enabled, add QR code data to response
      if (otpEnabled && tfa) {
        responseDto.tfaQrCodeBase64 = tfa.qrCodeBase64;
      }

      return responseDto;
    });
  }

  /**
   * Lists active agents with filtering and pagination
   *
   * @param query Query parameters for filtering and pagination
   * @param user Current authenticated user
   * @returns Paginated list of active agents
   */
  async findAll(
    query: AgentQueryDto,
    user: JwtUser,
  ): Promise<PaginatedAgentResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const { search, status, merchantId } = query;

    // Base query conditions
    const where: any = {
      deleted_at: null,
      is_permanently_deleted: false,
    };

    // Add search condition if provided
    if (search) {
      where.OR = [
        { user: { username: { contains: search, mode: "insensitive" } } },
        { agent_name: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Merchant ID filter
    if (merchantId) {
      const merchant = await this.prisma.merchant.findUnique({
        where: { merchant_id: merchantId },
        select: { merchant_id: true, created_by: true },
      });

      if (!merchant) {
        return this.formatPaginatedAgentResponse([], 0, 0, page);
      }

      // Authorization check
      const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
      if (!isSuperAdmin && merchant.created_by !== user.userId) {
        throw new ForbiddenException(
          `You are not authorized to view agents for merchant ${merchantId}.`,
        );
      }

      where.merchant_id = merchant.merchant_id;
    }

    // If no specific merchant ID, filter by merchants created by current admin (unless superadmin)
    else {
      const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);

      if (!isSuperAdmin) {
        const merchantIds = await this.prisma.merchant.findMany({
          where: { created_by: user.userId },
          select: { merchant_id: true },
        });

        if (merchantIds.length === 0) {
          return this.formatPaginatedAgentResponse([], 0, 0, page);
        }

        where.merchant_id = {
          in: merchantIds.map((m) => m.merchant_id),
        };
        // Restrict to agents created by the logged-in admin
        where.created_by = user.userId;
      }
    }

    try {
      const [totalItems, agents] = await Promise.all([
        this.prisma.agent.count({ where }),
        this.prisma.agent.findMany({
          where,
          skip,
          take: limit,
          orderBy: { agent_id: "desc" },
          include: {
            merchant: {
              select: {
                merchant_id: true,
              },
            },
            creator: {
              select: {
                username: true,
              },
            },
            user: {
              select: {
                username: true,
                user_id: true,
                is_active: true,
                tfa_secret: true,
              },
            },
          },
        }),
      ]);

      // Map to response DTOs with sequential ID
      const mappedAgents = await Promise.all(
        agents.map(async (agent, index) => {
          try {
            // Use the index for sequential numbering
            const sequentialId = skip + index + 1;
            const responseDto = await this.mapToAgentResponseDto(
              agent,
              sequentialId,
            );

            return responseDto;
          } catch (mapError) {
            this.logger.error(
              LogSeverity.ERROR,
              "AdminAgentsService",
              LogAction.SYSTEM,
              `Failed to map agent ${agent.agent_id}: ${mapError instanceof Error ? mapError.message : mapError}`,
              agent.agent_id,
              mapError instanceof Error ? mapError.stack : undefined,
            );
            throw mapError;
          }
        }),
      );

      return this.formatPaginatedAgentResponse(
        mappedAgents,
        totalItems,
        Math.ceil(totalItems / limit),
        page,
      );
    } catch (error) {
      this.logger.error(
        LogSeverity.ERROR,
        "AdminAgentsService",
        LogAction.SYSTEM,
        `Failed to retrieve agents: ${error instanceof Error ? error.message : error}`,
        user.userId,
        error instanceof Error ? error.stack : null,
      );
      throw new InternalServerErrorException("Failed to retrieve agents");
    }
  }

  /**
   * Finds a single agent by ID
   *
   * @param agentId Agent ID
   * @param user Current authenticated user
   * @returns Agent data
   */
  async findOne(agentId: string, user: JwtUser): Promise<AgentResponseDto> {
    const agent = await this.prisma.agent.findUnique({
      where: { agent_id: agentId },
      include: {
        merchant: {
          select: {
            merchant_id: true,
            created_by: true,
          },
        },
        creator: {
          select: {
            username: true,
          },
        },
        user: {
          select: {
            username: true,
            user_id: true,
            is_active: true,
            tfa_secret: true,
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found.`);
    }

    // Authorization check
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
    if (!isSuperAdmin && agent.merchant.created_by !== user.userId) {
      throw new ForbiddenException(
        `You are not authorized to view this agent.`,
      );
    }

    return this.mapToAgentResponseDto(agent, 1);
  }

  /**
   * Updates an existing agent
   *
   * @param agentId Agent ID
   * @param dto Data for updating the agent
   * @param user Current authenticated user
   * @returns Updated agent data
   */
  async update(
    agentId: string,
    dto: UpdateAgentDto,
    user: JwtUser,
  ): Promise<AgentResponseDto> {
    // First check if agent exists and user has access
    const existingAgent = await this.prisma.agent.findUnique({
      where: { agent_id: agentId },
      include: {
        merchant: true,
        user: {
          select: {
            username: true,
            user_id: true,
          },
        },
      },
    });

    if (!existingAgent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found.`);
    }

    if (existingAgent.deleted_at) {
      throw new BadRequestException(
        `Cannot update deleted agent with ID ${agentId}.`,
      );
    }

    // Authorization check
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
    if (!isSuperAdmin && existingAgent.merchant.created_by !== user.userId) {
      throw new ForbiddenException(
        `You are not authorized to update this agent.`,
      );
    }

    // Prepare update data (transform from camelCase to snake_case)
    const updateData: any = {
      agent_name: dto.agentName,
      withdrawal_bank_name: dto.bankName,
      withdrawal_account_number: dto.accountNumber,
      withdrawal_account_holder: dto.accountHolder,
      updated_at: new Date(),
      // Add notification fields
      notification_time: dto.notificationTime,
      notification_time_custom:
        dto.notificationTime === "CUSTOM" ? dto.notificationTimeCustom : null,
      notification_types: dto.notificationTypes,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    try {
      const updatedAgent = await this.prisma.agent.update({
        where: { agent_id: agentId },
        data: updateData,
        include: {
          merchant: {
            select: {
              merchant_id: true,
            },
          },
          creator: {
            select: {
              username: true,
            },
          },
          user: {
            select: {
              username: true,
              user_id: true,
              is_active: true,
              tfa_secret: true,
            },
          },
        },
      });

      // Log the update
      await this.logger.logUserAction(
        user,
        LogAction.AGENT_UPDATE,
        LogSeverity.INFO,
        EntityType.AGENT,
        agentId,
        {
          agentId: existingAgent.user?.user_id,
          merchantId: existingAgent.merchant.merchant_id,
          ...dto,
        },
      );

      return this.mapToAgentResponseDto(updatedAgent, 1);
    } catch (error) {
      this.logger.error(
        LogSeverity.ERROR,
        "AdminAgentsService",
        LogAction.AGENT_UPDATE,
        `Failed to update agent with ID ${agentId}`,
        user.userId,
        error instanceof Error ? error.stack : null,
      );
      throw new InternalServerErrorException(
        `Failed to update agent with ID ${agentId}`,
      );
    }
  }

  /**
   * Soft deletes an agent
   *
   * @param agentId Agent ID
   * @param user Current authenticated user
   */
  async remove(agentId: string, user: JwtUser): Promise<void> {
    // First check if agent exists and user has access
    const existingAgent = await this.prisma.agent.findUnique({
      where: { agent_id: agentId },
      include: {
        merchant: true,
        user: {
          select: {
            username: true,
            user_id: true,
          },
        },
      },
    });

    if (!existingAgent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found.`);
    }

    if (existingAgent.deleted_at) {
      throw new BadRequestException(
        `Agent with ID ${agentId} is already deleted.`,
      );
    }

    // Authorization check
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
    if (!isSuperAdmin && existingAgent.merchant.created_by !== user.userId) {
      throw new ForbiddenException(
        `You are not authorized to delete this agent.`,
      );
    }

    try {
      // Soft delete the agent
      await this.prisma.agent.update({
        where: { agent_id: agentId },
        data: { deleted_at: new Date() },
      });

      // Don't deactivate the user account anymore, to allow future reactivation
      // if (existingAgent.user?.user_id) {
      //   await this.prisma.user.update({
      //     where: { user_id: existingAgent.user.user_id },
      //     data: { is_active: false },
      //   });
      // }

      // Log the deletion
      await this.logger.logUserAction(
        user,
        LogAction.AGENT_DELETE,
        LogSeverity.WARNING,
        EntityType.AGENT,
        agentId,
        {
          agentId: existingAgent.user?.user_id,
          merchantId: existingAgent.merchant.merchant_id,
        },
      );
    } catch (error) {
      this.logger.error(
        LogSeverity.ERROR,
        "AdminAgentsService",
        LogAction.AGENT_DELETE,
        `Failed to delete agent with ID ${agentId}`,
        user.userId,
        error instanceof Error ? error.stack : null,
      );
      throw new InternalServerErrorException(
        `Failed to delete agent with ID ${agentId}`,
      );
    }
  }

  /**
   * Restores a previously deleted agent
   *
   * @param id Agent ID
   * @param user Current authenticated user
   * @returns Restored agent data
   */
  async restore(agentId: string, user: JwtUser): Promise<AgentResponseDto> {
    // First check if agent exists and user has access
    const existingAgent = await this.prisma.agent.findUnique({
      where: { agent_id: agentId },
      include: {
        merchant: true,
        user: {
          select: {
            username: true,
            user_id: true,
          },
        },
      },
    });

    if (!existingAgent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found.`);
    }

    if (existingAgent.deleted_at) {
      throw new BadRequestException(`Agent with ID ${agentId} is not deleted.`);
    }

    if (existingAgent.is_permanently_deleted) {
      throw new BadRequestException(
        `Agent with ID ${agentId} has been permanently deleted and cannot be restored.`,
      );
    }

    // Authorization check
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
    if (!isSuperAdmin && existingAgent.merchant.created_by !== user.userId) {
      throw new ForbiddenException(
        `You are not authorized to restore this agent.`,
      );
    }

    try {
      const restoredAgent = await this.prisma.agent.update({
        where: { agent_id: agentId },
        data: { deleted_at: null },
        include: {
          merchant: {
            select: {
              merchant_id: true,
            },
          },
          creator: {
            select: {
              username: true,
            },
          },
          user: {
            select: {
              username: true,
              user_id: true,
              is_active: true,
              tfa_secret: true,
            },
          },
        },
      });

      // Reactivate the user account
      if (existingAgent.user?.user_id) {
        await this.prisma.user.update({
          where: { user_id: existingAgent.user.user_id },
          data: { is_active: true },
        });
      }

      // Log the restoration
      await this.logger.logUserAction(
        user,
        LogAction.AGENT_RESTORE,
        LogSeverity.INFO,
        EntityType.AGENT,
        agentId,
        {
          agentId: existingAgent.user?.user_id,
          merchantId: existingAgent.merchant.merchant_id,
        },
      );

      return this.mapToAgentResponseDto(restoredAgent, 1);
    } catch (error) {
      this.logger.error(
        LogSeverity.ERROR,
        "AdminAgentsService",
        LogAction.AGENT_RESTORE,
        `Failed to restore agent with ID ${agentId}`,
        user.userId,
        error instanceof Error ? error.stack : null,
      );
      throw new InternalServerErrorException(
        `Failed to restore agent with ID ${agentId}`,
      );
    }
  }

  /**
   * Updates an agent's balance (deposit, withdraw, or adjust)
   *
   * @param agentId Agent ID
   * @param dto Balance update data
   * @param user Current authenticated user
   * @returns Updated agent data with new balance
   */
  async updateBalance(
    agentId: string,
    dto: AgentBalanceUpdateDto,
    user: JwtUser,
  ): Promise<AgentResponseDto> {
    const { amount, operationType, reason } = dto;

    if (amount <= 0) {
      throw new BadRequestException("Amount must be greater than zero");
    }

    return this.prisma.$transaction(async (tx) => {
      // Check if agent exists
      const agent = await tx.agent.findUnique({
        where: { agent_id: agentId },
        include: {
          merchant: true,
          user: true,
        },
      });

      if (!agent) {
        throw new NotFoundException(`Agent with ID ${agentId} not found.`);
      }

      if (agent.deleted_at) {
        throw new BadRequestException(
          `Cannot update balance for deleted agent with ID ${agentId}.`,
        );
      }

      // Authorization check
      const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
      if (!isSuperAdmin && agent.merchant.created_by !== user.userId) {
        throw new ForbiddenException(
          `You are not authorized to update this agent's balance.`,
        );
      }

      // Get current balance
      const currentBalance = Number(agent.balance);

      let newBalance: number;
      let changeAmount: number;

      // Calculate new balance based on operation type
      switch (operationType) {
        case BalanceOperationType.DEPOSIT:
          changeAmount = amount;
          newBalance = currentBalance + amount;
          break;
        case BalanceOperationType.WITHDRAW:
          if (currentBalance < amount) {
            throw new BadRequestException(
              "Insufficient balance for withdrawal",
            );
          }
          changeAmount = -amount;
          newBalance = currentBalance - amount;
          break;
        case BalanceOperationType.ADJUST:
          changeAmount = amount - currentBalance;
          newBalance = amount;
          break;
        default:
          throw new BadRequestException("Invalid operation type");
      }

      // Update agent balance
      const updatedAgent = await tx.agent.update({
        where: { agent_id: agentId },
        data: { balance: newBalance },
        include: {
          merchant: {
            select: {
              merchant_id: true,
            },
          },
          creator: {
            select: {
              username: true,
            },
          },
          user: {
            select: {
              username: true,
              user_id: true,
              is_active: true,
              tfa_secret: true,
            },
          },
        },
      });

      // Log the balance change in the main logs table
      await tx.log.create({
        data: {
          user_id: user.userId,
          action: `AGENT_BALANCE_${operationType}`,
          severity: LogSeverity.INFO,
          target_entity_type: EntityType.AGENT,
          target_entity_id: agentId,
          details: {
            agentId: agent.user?.user_id,
            agentName: agent.agent_name,
            merchantId: agent.merchant.merchant_id,
            previousBalance: currentBalance,
            newBalance,
            amount,
            changeAmount,
            reason,
            operationType,
          },
          system_generated: false,
        },
      });

      // Map operation type to corresponding LogAction
      let logAction: LogAction;
      switch (operationType) {
        case BalanceOperationType.DEPOSIT:
          logAction = LogAction.AGENT_BALANCE_DEPOSIT;
          break;
        case BalanceOperationType.WITHDRAW:
          logAction = LogAction.AGENT_BALANCE_WITHDRAW;
          break;
        case BalanceOperationType.ADJUST:
          logAction = LogAction.AGENT_BALANCE_ADJUST;
          break;
        default:
          logAction = LogAction.SYSTEM;
      }

      // Log the balance update using the standard logging service
      await this.logger.logUserAction(
        user,
        logAction,
        LogSeverity.INFO,
        EntityType.AGENT,
        agentId,
        {
          agentId: agent.user?.user_id,
          merchantId: agent.merchant.merchant_id,
          previousBalance: currentBalance,
          newBalance,
          amount,
          reason,
        },
      );

      return this.mapToAgentResponseDto(updatedAgent, 1);
    });
  }

  /**
   * Gets balance history for an agent
   *
   * @param agentId Agent ID
   * @param page Page number
   * @param limit Items per page
   * @param user Current authenticated user
   * @returns Paginated list of balance log entries
   */
  async getBalanceHistory(
    agentId: string,
    page: number = 1,
    limit: number = 10,
    user: JwtUser,
  ) {
    // First check if agent exists and user has access
    const agent = await this.prisma.agent.findUnique({
      where: { agent_id: agentId },
      include: {
        merchant: true,
      },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found.`);
    }

    // Authorization check
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
    if (!isSuperAdmin && agent.merchant.created_by !== user.userId) {
      throw new ForbiddenException(
        `You are not authorized to view this agent's balance history.`,
      );
    }

    const skip = (page - 1) * limit;

    try {
      // Build the query to filter logs related to agent balance changes
      const where = {
        target_entity_type: EntityType.AGENT,
        target_entity_id: agentId,
        action: {
          contains: "AGENT_BALANCE_",
        },
      };

      // Count total items
      const totalItems = await this.prisma.log.count({ where });

      // Get paginated logs
      const logs = await this.prisma.log.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          user: {
            select: {
              user_id: true,
              username: true,
            },
          },
        },
      });

      // Map to response DTOs
      const mappedLogs = logs.map((log) => {
        const details = (log.details as any) || {};

        return {
          id: log.log_id,
          agentId: agentId,
          changeType: log.action.replace("AGENT_BALANCE_", ""),
          amountChanged:
            details.changeAmount !== undefined
              ? Number(details.changeAmount)
              : Number(details.amount || 0),
          previousBalance: Number(details.previousBalance || 0),
          newBalance: Number(details.newBalance || 0),
          reason: details.reason || "",
          createdAt: log.created_at,
          createdBy: log.user_id,
          createdByName: log.user?.username || "System",
        };
      });

      return {
        data: mappedLogs,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      };
    } catch (error) {
      this.logger.error(
        LogSeverity.ERROR,
        "AdminAgentsService",
        LogAction.SYSTEM,
        `Failed to get balance history for agent with ID ${agentId}`,
        user.userId,
        error instanceof Error ? error.stack : null,
      );
      throw new InternalServerErrorException(
        `Failed to get balance history for agent with ID ${agentId}`,
      );
    }
  }

  /**
   * Export agents list to Excel
   * Respects admin permissions (admins only see their agents)
   *
   * @param query - The query parameters for the agents list
   * @param user - The authenticated admin user
   * @returns The URL of the generated Excel file
   */
  async exportAgentsToExcel(
    query: AgentQueryDto,
    user: JwtUser,
  ): Promise<{ url: string }> {
    // Remove pagination for export
    const { page, limit, ...filters } = query;

    // Get all agents matching the filter (increase limit for export)
    const agentsData = await this.findAll(
      {
        ...filters,
        page: 1,
        limit: 1000, // Set a larger limit for export
      } as AgentQueryDto,
      user,
    );

    // Transform data for Excel export - match exactly what's shown on the UI
    const excelData = agentsData.data.map((agent, index) => ({
      number: index + 1, // Sequential numbering starting from 1
      agentId: agent.agentId || "", // 에이전트아이디
      agentName: agent.agentName || "", // 에이전트명
      balance: agent.balance || 0, // 잔액
      status: agent.status === "active" ? "활성" : "비활성", // 상태
      createdAt: agent.createdAt
        ? new Date(agent.createdAt).toLocaleString()
        : "", // 등록일시
      updatedAt: agent.updatedAt
        ? new Date(agent.updatedAt).toLocaleString()
        : "", // 수정일시
      createdBy: agent.createdByName || "", // 작업자
    }));

    // Define headers for Excel file
    const headers = [
      { key: "number", header: "번호" },
      { key: "agentId", header: "에이전트아이디" },
      { key: "agentName", header: "에이전트명" },
      { key: "balance", header: "잔액" },
      { key: "status", header: "상태" },
      { key: "createdAt", header: "등록일시" },
      { key: "updatedAt", header: "수정일시" },
      { key: "createdBy", header: "작업자" },
    ];

    // Use the centralized DownloadService to create and store the Excel file
    return this.downloadService.createExcelFile(
      excelData,
      "agents-export",
      { headers },
      user.userId,
    );
  }

  /**
   * Export agent balance logs to Excel
   * Respects admin permissions
   *
   * @param agentId - Agent ID to export logs for
   * @param user - The authenticated admin user
   * @returns URL for downloading the Excel file
   */
  async exportBalanceLogsToExcel(
    agentId: string,
    user: JwtUser,
  ): Promise<{ url: string }> {
    // Get all balance logs without pagination
    const logsData = await this.getBalanceHistory(
      agentId,
      1,
      1000, // Set a larger limit for export
      user,
    );

    // Find agent info for adding to the export
    const agent = await this.prisma.agent.findUnique({
      where: { agent_id: agentId },
      include: {
        user: true,
        merchant: true,
      },
    });

    // Transform data for Excel export - match exactly what's shown on the UI
    const excelData = logsData.data.map((log, index) => ({
      number: index + 1, // 번호
      date: log.createdAt ? new Date(log.createdAt).toLocaleString() : "", // 날짜
      agent: agent?.agent_name || "", // 에이전트
      detail: log.reason || "", // 내용
      changeAmount: log.amountChanged || 0, // 변경금액
      balanceAfter: log.newBalance || 0, // 변경후금액
    }));

    // Define headers for Excel file
    const headers = [
      { key: "number", header: "번호" },
      { key: "date", header: "날짜" },
      { key: "agent", header: "에이전트" },
      { key: "detail", header: "내용" },
      { key: "changeAmount", header: "변경금액" },
      { key: "balanceAfter", header: "변경후금액" },
    ];

    // Use the centralized DownloadService to create and store the Excel file
    return this.downloadService.createExcelFile(
      excelData,
      "agent-balance-logs-export",
      { headers },
      user.userId,
    );
  }

  /**
   * Resets TFA for an agent
   * Only the admin who created the agent can reset their TFA
   *
   * @param agentId Agent ID to reset TFA for
   * @param user Current authenticated user
   * @returns Object containing new TFA setup information
   */
  async resetAgentTfa(
    agentId: string,
    user: JwtUser,
  ): Promise<{
    message: string;
    tfaSetupUrl: string;
    tfaQrCodeBase64: string;
  }> {
    // First check if agent exists
    const agent = await this.prisma.agent.findUnique({
      where: { agent_id: agentId },
      include: {
        merchant: {
          select: {
            merchant_id: true,
            created_by: true,
          },
        },
        user: {
          select: {
            user_id: true,
            username: true,
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found`);
    }

    if (agent.deleted_at) {
      throw new BadRequestException(
        `Cannot reset TFA for deleted agent with ID ${agentId}`,
      );
    }

    // Authorization check - only the admin who created the merchant can reset agent TFA
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
    if (!isSuperAdmin && agent.merchant.created_by !== user.userId) {
      throw new ForbiddenException(
        `You are not authorized to reset TFA for this agent`,
      );
    }

    // Check if agent has a user account
    if (!agent.user || !agent.user.user_id) {
      throw new BadRequestException(
        `Agent with ID ${agentId} has no associated user account`,
      );
    }

    // Reset TFA secret via UsersService
    const tfaInfo = await this.usersService.resetTfaSecret(
      agent.user.user_id,
      user.userId.toString(),
    );

    // Log the TFA reset
    await this.logger.logUserAction(
      user,
      LogAction.AGENT_TFA_RESET,
      LogSeverity.INFO,
      EntityType.AGENT,
      agentId,
      {
        agentId: agentId,
        agentUsername: agent.user.username,
        merchantId: agent.merchant.merchant_id,
      },
    );

    return {
      message: tfaInfo.message,
      tfaSetupUrl: tfaInfo.tfaSetupUrl,
      tfaQrCodeBase64: tfaInfo.tfaQrCodeBase64,
    };
  }

  /**
   * Lists deleted agents with filtering and pagination
   *
   * @param query Query parameters for filtering and pagination
   * @param user Current authenticated user
   * @returns Paginated list of deleted agents
   */
  async findDeleted(
    query: AgentQueryDto,
    user: JwtUser,
  ): Promise<PaginatedAgentResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const { search, status, merchantId } = query;

    // Base query conditions
    const where: any = {
      deleted_at: { not: null },
      is_permanently_deleted: false,
    };

    // Add search condition if provided
    if (search) {
      where.OR = [
        { user: { username: { contains: search, mode: "insensitive" } } },
        { agent_name: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Merchant ID filter
    if (merchantId) {
      const merchant = await this.prisma.merchant.findUnique({
        where: { merchant_id: merchantId },
        select: { merchant_id: true, created_by: true },
      });

      if (!merchant) {
        return this.formatPaginatedAgentResponse([], 0, 0, page);
      }

      // Authorization check
      const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
      if (!isSuperAdmin && merchant.created_by !== user.userId) {
        throw new ForbiddenException(
          `You are not authorized to view agents for merchant ${merchantId}.`,
        );
      }

      where.merchant_id = merchant.merchant_id;
    }

    // If no specific merchant ID, filter by merchants created by current admin (unless superadmin)
    else {
      const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);

      if (!isSuperAdmin) {
        const merchantIds = await this.prisma.merchant.findMany({
          where: { created_by: user.userId },
          select: { merchant_id: true },
        });

        if (merchantIds.length === 0) {
          return this.formatPaginatedAgentResponse([], 0, 0, page);
        }

        where.merchant_id = {
          in: merchantIds.map((m) => m.merchant_id),
        };
        // Restrict to agents created by the logged-in admin
        where.created_by = user.userId;
      }
    }

    try {
      const [totalItems, agents] = await Promise.all([
        this.prisma.agent.count({ where }),
        this.prisma.agent.findMany({
          where,
          skip,
          take: limit,
          orderBy: { agent_id: "desc" },
          include: {
            merchant: {
              select: {
                merchant_id: true,
              },
            },
            creator: {
              select: {
                username: true,
              },
            },
            user: {
              select: {
                username: true,
                user_id: true,
                is_active: true,
                tfa_secret: true,
              },
            },
          },
        }),
      ]);

      // Map to response DTOs with sequential ID
      const mappedAgents = await Promise.all(
        agents.map(async (agent, index) => {
          try {
            // Use the index for sequential numbering
            const sequentialId = skip + index + 1;
            const responseDto = await this.mapToAgentResponseDto(
              agent,
              sequentialId,
            );

            return responseDto;
          } catch (mapError) {
            this.logger.error(
              LogSeverity.ERROR,
              "AdminAgentsService",
              LogAction.SYSTEM,
              `Failed to map agent ${agent.agent_id}: ${mapError instanceof Error ? mapError.message : mapError}`,
              agent.agent_id,
              mapError instanceof Error ? mapError.stack : undefined,
            );
            throw mapError;
          }
        }),
      );

      return this.formatPaginatedAgentResponse(
        mappedAgents,
        totalItems,
        Math.ceil(totalItems / limit),
        page,
      );
    } catch (error) {
      this.logger.error(
        LogSeverity.ERROR,
        "AdminAgentsService",
        LogAction.SYSTEM,
        `Failed to retrieve deleted agents: ${error instanceof Error ? error.message : error}`,
        user.userId,
        error instanceof Error ? error.stack : null,
      );
      throw new InternalServerErrorException(
        "Failed to retrieve deleted agents",
      );
    }
  }

  /**
   * Permanently deletes an agent
   *
   * @param agentId Agent ID
   * @param user Current authenticated user
   */
  async permanentDelete(agentId: string, user: JwtUser): Promise<void> {
    // First check if agent exists and user has access
    const existingAgent = await this.prisma.agent.findUnique({
      where: { agent_id: agentId },
      include: {
        merchant: true,
        user: {
          select: {
            username: true,
            user_id: true,
          },
        },
      },
    });

    if (!existingAgent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found.`);
    }

    if (!existingAgent.deleted_at) {
      throw new BadRequestException(
        `Agent must be soft-deleted before permanent deletion.`,
      );
    }

    // Authorization check
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
    if (!isSuperAdmin && existingAgent.merchant.created_by !== user.userId) {
      throw new ForbiddenException(
        `You are not authorized to permanently delete this agent.`,
      );
    }

    try {
      // "Permanent" delete the agent (still in DB, but marked differently)
      await this.prisma.agent.update({
        where: { agent_id: agentId },
        data: { is_permanently_deleted: true },
      });

      // Log the "permanent" deletion
      await this.logger.logUserAction(
        user,
        LogAction.AGENT_PERMANENT_DELETE,
        LogSeverity.WARNING,
        EntityType.AGENT,
        agentId,
        {
          agentId: existingAgent.user?.user_id,
          merchantId: existingAgent.merchant.merchant_id,
        },
      );
    } catch (error) {
      this.logger.error(
        LogSeverity.ERROR,
        "AdminAgentsService",
        LogAction.AGENT_PERMANENT_DELETE,
        `Failed to permanently delete agent with ID ${agentId}`,
        user.userId,
        error instanceof Error ? error.stack : null,
      );
      throw new InternalServerErrorException(
        `Failed to permanently delete agent with ID ${agentId}`,
      );
    }
  }

  /**
   * Utility method to map database agent object to response DTO
   *
   * @param agent Agent database object with relations
   * @param sequentialId Optional sequential ID for listing (position in result list)
   * @returns Mapped agent response DTO
   */
  private async mapToAgentResponseDto(
    agent: Agent & {
      user: {
        username?: string;
        is_active?: boolean;
        tfa_secret?: string;
      };
      merchant?: { merchant_id: string } | null;
      creator: { username?: string };
      email: string;
      phone: string;
      mid: string;
      mkey: string;
      callback_url?: string;
    },
    sequentialId?: number,
  ): Promise<AgentResponseDto> {
    // Format the balance with commas
    const formattedBalance = agent.balance
      ? agent.balance.toNumber().toLocaleString()
      : "0";

    // Format dates in YYYY/MM/DD HH:MM:SS format
    const formatDate = (date: Date | null | undefined): string => {
      if (!date) return "";
      const d = new Date(date);
      return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    };

    // Format commission as percentage with one decimal place
    const commission = agent.distribution_rate
      ? `${agent.distribution_rate.toNumber().toFixed(1)}%`
      : "0.0%";

    // Get the username value
    const username = agent.user.username || "";

    // Check if this is a deleted agent
    const isDeleted = agent.deleted_at !== null;

    // Include merchantId only when needed
    const includeMerchantId = process.env.INCLUDE_MERCHANT_ID === "true";

    // Map data to exactly match frontend requirements
    // For deleted agents, we only need to include a subset of properties to match mockDeletedAgents format
    const responseDto: AgentResponseDto = {
      id: sequentialId || 0, // Use provided sequential ID or 0 for single agent
      username: username, // Add username field as shown in example
      agentId: agent.agent_id, // Keep agentId for backward compatibility
      agentName: agent.agent_name,
      balance: formattedBalance,
      status: agent.status === AgentStatus.ACTIVE ? "active" : "inactive",
      createdAt: formatDate(agent.created_at),
      updatedAt: formatDate(agent.updated_at),
      createdBy: agent.creator.username || agent.created_by,
      createdByName: agent.creator.username,
      otpEnabled: !!agent.user?.tfa_secret,

      // Conditionally include merchantId based on environment variable
      ...(includeMerchantId ? { merchantId: agent.merchant?.merchant_id } : {}),

      // For deleted agents, we don't need to include these extra properties
      ...(isDeleted
        ? {}
        : {
            email: agent.email,
            phone: agent.phone,
            commission,
            withdrawalBankName: agent.withdrawal_bank_name,
            withdrawalAccountNumber: agent.withdrawal_account_number,
            withdrawalAccountHolder: agent.withdrawal_account_holder,
            mid: agent.mid,
            mkey: agent.mkey,
            callbackUrl: agent.callback_url,
            dashboardId: `${username}_admin`, // Format as username_admin as shown in example
            dashboardPassword: "••••••••", // Masked password for security
            notificationTypes: agent.notification_types,
            notificationTime: agent.notification_time,
            notificationTimeCustom: agent.notification_time_custom,
            telegramId: agent.telegram_id,
          }),
      // Always include deletedAt if it exists
      ...(agent.deleted_at ? { deletedAt: formatDate(agent.deleted_at) } : {}),
    };

    if (
      agent.user?.tfa_secret &&
      agent.user?.username &&
      this.encryptionService
    ) {
      try {
        responseDto.tfaQrCodeBase64 = await getTfaQrCodeBase64(
          agent.user.username,
          agent.user.tfa_secret,
          this.encryptionService,
        );
      } catch (err) {
        console.log(err);
        this.logger.error(
          LogSeverity.ERROR,
          "AdminAgentsService",
          LogAction.SYSTEM,
          `Failed to generate TFA QR code for agent ${agent.agent_id}: ${err instanceof Error ? err.message : err}`,
          agent.agent_id,
          err instanceof Error ? err.stack : undefined,
        );
        responseDto.tfaQrCodeBase64 = null;
      }
    }

    return responseDto;
  }

  /**
   * Helper method to format paginated agent responses with items field
   */
  private formatPaginatedAgentResponse(
    data: AgentResponseDto[],
    totalItems: number,
    totalPages: number,
    currentPage: number,
  ): PaginatedAgentResponseDto {
    return {
      data,
      items: data, // Add items field with same data to satisfy OpenAPI requirements
      totalPages,
      currentPage,
      meta: {
        total: totalItems,
        page: currentPage,
        limit: data.length,
        totalPages,
      },
    };
  }
}
