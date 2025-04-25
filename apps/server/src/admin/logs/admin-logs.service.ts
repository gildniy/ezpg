import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { EntityType, Prisma, PrismaService } from "@ezpg/database";
import { LogResponseDto } from "./dto/log-response.dto";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import {
  AdminLogQueryDto,
  AgentBalanceLogQueryDto,
  MerchantBalanceLogQueryDto,
} from "./dto/log-query.dto";
import { toCamelSync as toCamel } from "@ezpg/helpers";
import { AgentBalanceLogDto } from "./dto/agent-balance-log-response.dto";
import { AdminLogDto } from "./dto/admin-log-response.dto";
import { LogAction } from "src/core/logging/log-action.enum";
import { MerchantBalanceLogDto } from "./dto/merchant-balance-log-response.dto";

// Define type alias for MerchantBalanceLogAction
type MerchantBalanceLogAction =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "ADJUSTMENT"
  | "FEE_SETTLEMENT";

@Injectable()
export class AdminLogsService {
  constructor(private prisma: PrismaService) {}

  async findAdminLogs(
    query: AdminLogQueryDto,
  ): Promise<PaginatedResult<AdminLogDto>> {
    const { page, limit, skip, orderBy, search, endDate, userId } = query;
    const where: Prisma.LogWhereInput = {};
    if (userId) where.user_id = userId;
    if (endDate) {
      where.created_at = {};
      if (endDate) where.created_at.lte = new Date(endDate + "T23:59:59.999Z");
    }
    if (search) {
      // Search action or details? Be careful searching JSONB
      where.OR = [{ action: { contains: search, mode: "insensitive" } }];
    }

    try {
      const totalItems = await this.prisma.log.count({ where });
      const logs = await this.prisma.log.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { user: { select: { user_id: true, username: true } } },
      });

      const data: AdminLogDto[] = logs.map((log) => ({
        log_id: log.log_id,
        admin_id: log.user_id || "SYSTEM",
        admin_username: log.user?.username || "System/Unknown",
        action: log.action,
        entity_type: log.target_entity_type,
        entity_id: log.target_entity_id?.toString(),
        details:
          typeof log.details === "object" &&
          log.details !== null &&
          !Array.isArray(log.details)
            ? log.details
            : {},
        ip_address: log.ip_address,
        severity: log.severity,
        created_at: log.created_at,
        metadata: {},
      }));

      return toCamel({
        data,
        total_items: totalItems,
        total_pages: Math.ceil(totalItems / limit),
        current_page: page,
      });
    } catch (error) {
      let errorMessage = "Failed to retrieve admin logs";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async findAgentBalanceLogs(
    query: AgentBalanceLogQueryDto,
  ): Promise<PaginatedResult<AgentBalanceLogDto>> {
    const { page, limit, skip, orderBy, search, endDate, agentId } = query;

    // Build the where condition for Prisma
    const where: Prisma.BalanceLogsWhereInput = {
      entity_type: EntityType.AGENT,
    };

    // Filter by specific agent if provided
    if (agentId) {
      where.entity_id = agentId.toString();
    }

    // Add date filter with default to today if not provided
    const filterDate = endDate
      ? new Date(endDate + "T23:59:59.999Z")
      : new Date();
    where.created_at = { lte: filterDate };

    // Add search filter if provided
    if (search) {
      where.OR = [
        { notes: { contains: search, mode: "insensitive" } },
        { related_transaction_id: { contains: search, mode: "insensitive" } },
      ];
    }

    try {
      // Get total count for pagination
      const totalItems = await this.prisma.balanceLogs.count({ where });

      // Get logs with pagination
      const logs = await this.prisma.balanceLogs.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          users: true,
        },
      });

      // Get all agent IDs from the logs
      const agentIds = Array.from(new Set(logs.map((log) => log.entity_id)));

      // Fetch agent information for these IDs
      const agents = await this.prisma.agent.findMany({
        where: {
          agent_id: { in: agentIds },
        },
        select: {
          agent_id: true,
          agent_name: true,
        },
      });

      // Create a map of agent IDs to agent data for quick lookups
      const agentMap = new Map(agents.map((agent) => [agent.agent_id, agent]));

      // Map log data to DTOs
      const data = logs.map((log) => {
        const agent = agentMap.get(log.entity_id);

        return {
          log_id: log.log_id,
          agent_id: log.entity_id, // Keep as string
          agent_name: agent?.agent_name || "Unknown Agent",
          amount: log.amount.toString(),
          previous_balance: log.balance_before.toString(),
          new_balance: log.balance_after.toString(),
          type: log.change_type,
          reason: log.notes || "",
          related_transaction_id: log.related_transaction_id || "",
          related_withdrawal_id: log.related_withdrawal_id,
          created_at: log.created_at,
          created_by: log.created_by,
          created_by_username: log.users?.username || "System/Unknown",
        };
      });

      // Return paginated result
      return toCamel({
        data,
        total_items: totalItems,
        total_pages: Math.ceil(totalItems / limit),
        current_page: page,
      });
    } catch (error) {
      let errorMessage = "Failed to retrieve agent balance logs";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async findMerchantBalanceLogs(
    query: MerchantBalanceLogQueryDto,
  ): Promise<PaginatedResult<MerchantBalanceLogDto>> {
    const { page, limit, skip, orderBy, search, endDate, merchantId } = query;

    // Build query conditions to filter logs that are merchant balance logs
    const where: Prisma.LogWhereInput = {
      action: {
        in: [
          LogAction.MERCHANT_BALANCE_DEPOSIT,
          LogAction.MERCHANT_BALANCE_WITHDRAW,
          LogAction.MERCHANT_BALANCE_ADJUST,
          LogAction.MERCHANT_FEE_SETTLEMENT,
        ],
      },
      target_entity_type: EntityType.MERCHANT,
    };

    // Add merchant filters if provided
    if (merchantId) {
      where.details = {
        path: ["merchant_id"],
        equals: merchantId,
      };
    }

    // Add date filter with default to today if not provided
    const filterDate = endDate
      ? new Date(endDate + "T23:59:59.999Z")
      : new Date();
    where.created_at = { lte: filterDate };

    // Add search capability
    if (search) {
      where.OR = [
        {
          action: { contains: search, mode: "insensitive" },
        },
        {
          details: {
            not: Prisma.JsonNull,
          },
          user: {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    try {
      // Count total matching logs
      const totalItems = await this.prisma.log.count({ where });

      // Fetch logs
      const logs = await this.prisma.log.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { created_at: "desc" },
        include: {
          user: {
            select: { user_id: true, username: true },
          },
        },
      });

      // Map log data to DTOs
      const data: MerchantBalanceLogDto[] = logs.map((log) => {
        const details = log.details as Prisma.JsonObject;
        const logMerchantId = details?.merchant_id?.toString();
        // TODO: Fetch affiliate for merchantId if this becomes a requirement
        // const affiliate = await this.prisma.merchant.findUnique({ where: { merchant_id: logMerchantId } })?.affiliate || "N/A";
        const amount = details?.amount?.toString();
        const balanceBefore = details?.balance_before?.toString();
        const balanceAfter = details?.balance_after?.toString();
        const transactionId = details?.transaction_id?.toString();

        return {
          log_id: log.log_id,
          merchant_id: logMerchantId || "N/A",
          affiliate: "N/A", // Placeholder for now
          previous_balance: balanceBefore || "0",
          new_balance: balanceAfter || "0",
          amount: amount || "0",
          reason: log.action, // LogAction enum member, DTO expects string.
          transaction_id: transactionId || "", // DTO expects string
          created_at: log.created_at,
        };
      });

      // Return paginated result - toCamel might need adjustment if DTO uses snake_case
      // MerchantBalanceLogDto uses snake_case, so toCamel might be problematic here.
      // PaginatedResult interface itself does not enforce camelCase for its top-level properties.
      // Let's assume PaginatedResult is generic enough.
      // The toCamel helper converts root keys of an object.
      // The `data` array contains objects that are already snake_case.
      // `total_items`, `total_pages`, `current_page` are snake_case from `toCamel`
      // `PaginatedMerchantBalanceLogResponseDto` expects camelCase for these meta fields.

      // Let's return the structure directly without toCamel for this one.
      return {
        data,
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      };
    } catch (error) {
      let errorMessage = "Failed to retrieve merchant balance logs";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
