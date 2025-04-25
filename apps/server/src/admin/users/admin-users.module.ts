import { Module } from "@nestjs/common";
import { AdminUsersService } from "./admin-users.service";
import { AdminUsersController } from "./admin-users.controller";
import { PrismaModule } from "@ezpg/database";
import { CoreModule } from "../../core/core.module"; // For logging and encryption
import { AppConfigModule } from "../../config/app-config.module";

@Module({
  imports: [PrismaModule, CoreModule, AppConfigModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
