import { Module } from "@nestjs/common";
import { AdminBlacklistService } from "./admin-blacklist.service";
import { AdminBlacklistController } from "./admin-blacklist.controller";
import { PrismaModule } from "@ezpg/database";
import { CoreModule } from "../../core/core.module";

@Module({
  imports: [PrismaModule, CoreModule], // Add CoreModule for Logging
  controllers: [AdminBlacklistController],
  providers: [AdminBlacklistService],
})
export class AdminBlacklistModule {}
