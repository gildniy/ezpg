import { Module } from "@nestjs/common";
import { AdminAgentsService } from "./admin-agents.service";
import { AdminAgentsController } from "./admin-agents.controller";
import { PrismaModule } from "@ezpg/database";
import { AuthModule } from "../../auth/auth.module";
import { LoggingModule } from "../../core/logging/logging.module";
import { DownloadModule } from "../../core/download/download.module";
import { AdminUsersModule } from "../users/admin-users.module";
import { AdminAdminsModule } from "../admins/admin-admins.module";
import { IdGeneratorModule } from "../../core/id-generator/id-generator.module";

/**
 * Module for managing agents in the admin panel
 * Provides services and controllers for agent operations
 */
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    LoggingModule,
    DownloadModule,
    AdminUsersModule,
    AdminAdminsModule,
    IdGeneratorModule,
  ],
  controllers: [AdminAgentsController],
  providers: [AdminAgentsService],
  exports: [AdminAgentsService],
})
export class AdminAgentsModule {}
