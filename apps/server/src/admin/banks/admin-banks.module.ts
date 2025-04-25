import { Module } from "@nestjs/common";
import { AdminBanksService } from "./admin-banks.service";
import { AdminBanksController } from "./admin-banks.controller";
import { PrismaModule } from "@ezpg/database";
import { LoggingModule } from "../../core/logging/logging.module";

@Module({
  imports: [PrismaModule, LoggingModule],
  controllers: [AdminBanksController],
  providers: [AdminBanksService],
  exports: [AdminBanksService],
})
export class AdminBanksModule {}
