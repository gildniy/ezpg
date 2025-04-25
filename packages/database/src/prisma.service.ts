import { OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  PrismaClient,
  Prisma,
  MerchantGroupStatus,
  MerchantStatus,
  AgentStatus,
} from "@prisma/client";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

type SoftDeleteableEntity = {
  deleted_at?: Date | null;
  is_active?: boolean;
  is_permanently_deleted?: boolean;
  created_by?: string;
  group_name?: string;
  group_id?: number;
  status?: MerchantGroupStatus;
  created_at?: Date;
  updated_at?: Date;
};

type SoftDeleteConfig = {
  deletedAtField?: string;
  activeField?: string;
  activeValue?: boolean;
  permanentDeleteField?: string;
};

// Get all model names from Prisma
type PrismaModel = keyof Omit<
  PrismaClient,
  | "$connect"
  | "$disconnect"
  | "$on"
  | "$transaction"
  | "$use"
  | "$extends"
  | symbol
>;

// Helper type to get the ID type of a model
type ModelIdType<T extends PrismaModel> = T extends keyof PrismaClient
  ? PrismaClient[T] extends {
      findUnique: (args: { where: { id: infer U } }) => any;
    }
    ? U
    : never
  : never;

// Helper type to check if a model uses string ID
type IsStringIdModel<T extends PrismaModel> =
  ModelIdType<T> extends { id: string } ? true : false;

// Helper type to get the correct ID type for a model
type GetModelIdType<T extends PrismaModel> =
  IsStringIdModel<T> extends true ? string : number;

type UpdateData = {
  [key: string]: Date | string | boolean | null;
};

type SelectData = {
  [key: string]: boolean;
};

type WhereData = {
  [key: string]: string | number | boolean | null | { not: string | null };
};

type PrismaOperationArgs<T extends PrismaModel> = {
  where: { id: GetModelIdType<T> };
  data?: UpdateData;
  select?: SelectData;
};

type PrismaOperationResult<T> = Promise<T | null>;

type PrismaModelOperations = {
  update: <T extends PrismaModel>(
    args: PrismaOperationArgs<T>,
  ) => PrismaOperationResult<void>;
  findUnique: <T extends PrismaModel>(
    args: PrismaOperationArgs<T>,
  ) => PrismaOperationResult<Record<string, unknown>>;
  findFirst: <T extends PrismaModel>(
    args: PrismaOperationArgs<T>,
  ) => PrismaOperationResult<Record<string, unknown>>;
};

// Removing @Injectable() decorator - this class will be manually provided in modules
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  // Example usage configurations
  private readonly userConfig: SoftDeleteConfig = {
    deletedAtField: "deleted_at",
    activeField: "is_active",
    activeValue: false,
    permanentDeleteField: "is_permanently_deleted",
  };

  private readonly merchantConfig: SoftDeleteConfig = {
    deletedAtField: "deleted_at",
    permanentDeleteField: "is_permanently_deleted",
  };

  private readonly agentConfig: SoftDeleteConfig = {
    deletedAtField: "deleted_at",
    permanentDeleteField: "is_permanently_deleted",
  };

  private readonly merchantGroupConfig: SoftDeleteConfig = {
    deletedAtField: "deleted_at",
    permanentDeleteField: "is_permanently_deleted",
  };

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get("DATABASE_URL"),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Run migrations and seed if configured
    const shouldRunMigrations =
      this.configService.get<string>("AUTO_RUN_MIGRATIONS") === "true";

    if (shouldRunMigrations) {
      try {
        this.logger.log("Running database migrations...");
        await execAsync("npx prisma migrate deploy");
        this.logger.log("Migrations completed successfully");

        const shouldSeed =
          this.configService.get<string>("AUTO_SEED_DATABASE") === "true";

        if (shouldSeed) {
          this.logger.log("Seeding database...");
          await execAsync("npx prisma db seed");
          this.logger.log("Seeding completed successfully");
        }
      } catch (error) {
        this.logger.error("Error running migrations or seeding:", error);
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper methods for common operations
  async findActiveUser(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || this;
    return client.user.findFirst({
      where: {
        user_id: userId,
        deleted_at: null,
      },
    });
  }

  async findActiveMerchant(merchantId: string, tx?: Prisma.TransactionClient) {
    const client = tx || this;
    return client.merchant.findFirst({
      where: {
        merchant_id: merchantId,
        status: MerchantStatus.ACTIVE,
        deleted_at: null,
      },
    });
  }

  async findActiveAgent(agentId: string, tx?: Prisma.TransactionClient) {
    const client = tx || this;
    return client.agent.findFirst({
      where: {
        agent_id: agentId,
        status: AgentStatus.ACTIVE,
        deleted_at: null,
      },
    });
  }

  // Generic soft delete method
  async softDelete<T extends SoftDeleteableEntity>(
    model: PrismaModel,
    id: string | number,
    config: SoftDeleteConfig = {},
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx || this;
    const updateData: UpdateData = {};

    if (config.deletedAtField) {
      updateData[config.deletedAtField] = new Date();
    }

    if (config.activeField !== undefined && config.activeValue !== undefined) {
      updateData[config.activeField] = config.activeValue;
    }

    const where = { id } as { id: GetModelIdType<typeof model> };

    await (client as unknown as Record<PrismaModel, PrismaModelOperations>)[
      model
    ].update({
      where,
      data: updateData,
    });
  }

  // Generic restore method
  async restore<T extends SoftDeleteableEntity>(
    model: PrismaModel,
    id: string | number,
    config: SoftDeleteConfig = {},
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx || this;
    const updateData: UpdateData = {};

    if (config.deletedAtField) {
      updateData[config.deletedAtField] = null;
    }

    if (config.activeField !== undefined && config.activeValue !== undefined) {
      updateData[config.activeField] = !config.activeValue;
    }

    const where = { id } as { id: GetModelIdType<typeof model> };

    await (client as unknown as Record<PrismaModel, PrismaModelOperations>)[
      model
    ].update({
      where,
      data: updateData,
    });
  }

  // Generic isDeleted check method
  async isDeleted<T extends SoftDeleteableEntity>(
    model: PrismaModel,
    id: string | number,
    config: SoftDeleteConfig = {},
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const client = tx || this;
    const where: WhereData = {};

    if (config.deletedAtField) {
      where[config.deletedAtField] = { not: null };
    }

    if (config.activeField !== undefined && config.activeValue !== undefined) {
      where[config.activeField] = config.activeValue;
    }

    const whereWithId = { ...where, id } as WhereData & {
      id: GetModelIdType<typeof model>;
    };

    const result = await (
      client as unknown as Record<PrismaModel, PrismaModelOperations>
    )[model].findFirst({
      where: whereWithId,
    });

    return result !== null;
  }

  // Generic findActive method
  async findActive<T extends SoftDeleteableEntity>(
    model: PrismaModel,
    id: string | number,
    config: SoftDeleteConfig = {},
    tx?: Prisma.TransactionClient,
  ): Promise<T | null> {
    const client = tx || this;
    const where: WhereData = {};

    if (config.deletedAtField) {
      where[config.deletedAtField] = null;
    }

    if (config.activeField !== undefined && config.activeValue !== undefined) {
      where[config.activeField] = !config.activeValue;
    }

    const whereWithId = { ...where, id } as WhereData & {
      id: GetModelIdType<typeof model>;
    };

    return (client as unknown as Record<PrismaModel, PrismaModelOperations>)[
      model
    ].findFirst({
      where: whereWithId,
    }) as Promise<T | null>;
  }

  // Specific soft delete methods
  async softDeleteUser(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.softDelete("user", userId, this.userConfig, tx);
  }

  async softDeleteMerchant(
    merchantId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.softDelete("merchant", merchantId, this.merchantConfig, tx);
  }

  async softDeleteAgent(
    agentId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.softDelete("agent", agentId, this.agentConfig, tx);
  }

  async softDeleteMerchantGroup(
    groupId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.softDelete(
      "merchantGroup",
      groupId,
      this.merchantGroupConfig,
      tx,
    );
  }

  // Specific restore methods
  async restoreUser(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.restore("user", userId, this.userConfig, tx);
  }

  async restoreMerchant(
    merchantId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.restore("merchant", merchantId, this.merchantConfig, tx);
  }

  async restoreAgent(
    agentId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.restore("agent", agentId, this.agentConfig, tx);
  }

  async restoreMerchantGroup(
    groupId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.restore("merchantGroup", groupId, this.merchantGroupConfig, tx);
  }

  // Specific isDeleted check methods
  async isUserDeleted(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    return this.isDeleted("user", userId, this.userConfig, tx);
  }

  async isMerchantDeleted(
    merchantId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    return this.isDeleted("merchant", merchantId, this.merchantConfig, tx);
  }

  async isAgentDeleted(
    agentId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    return this.isDeleted("agent", agentId, this.agentConfig, tx);
  }

  async isMerchantGroupDeleted(
    groupId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    return this.isDeleted(
      "merchantGroup",
      groupId,
      this.merchantGroupConfig,
      tx,
    );
  }

  // Specific findActive methods
  async findActiveMerchantGroup(
    groupId: number,
    tx?: Prisma.TransactionClient,
  ) {
    return this.findActive(
      "merchantGroup",
      groupId,
      this.merchantGroupConfig,
      tx,
    );
  }

  // Generic permanent delete method
  async permanentDelete<T extends SoftDeleteableEntity>(
    model: PrismaModel,
    id: string | number,
    config: SoftDeleteConfig = {},
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx || this;
    const updateData: UpdateData = {};

    if (config.permanentDeleteField) {
      updateData[config.permanentDeleteField] = true;
    }

    const where = { id } as { id: GetModelIdType<typeof model> };

    await (client as unknown as Record<PrismaModel, PrismaModelOperations>)[
      model
    ].update({
      where,
      data: updateData,
    });
  }

  // Specific permanent delete methods
  async permanentDeleteUser(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.permanentDelete("user", userId, this.userConfig, tx);
  }

  async permanentDeleteMerchant(
    merchantId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.permanentDelete("merchant", merchantId, this.merchantConfig, tx);
  }

  async permanentDeleteAgent(
    agentId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.permanentDelete("agent", agentId, this.agentConfig, tx);
  }

  async permanentDeleteMerchantGroup(
    groupId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.permanentDelete(
      "merchantGroup",
      groupId,
      this.merchantGroupConfig,
      tx,
    );
  }
}
