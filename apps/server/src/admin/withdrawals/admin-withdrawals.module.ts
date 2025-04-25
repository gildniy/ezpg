import { Module } from "@nestjs/common";
import { AdminWithdrawalsService } from "./admin-withdrawals.service";
import { AdminWithdrawalsController } from "./admin-withdrawals.controller";
import { PrismaModule } from "@ezpg/database";
import { LoggingModule } from "../../core/logging/logging.module";
import { AdminAdminsModule } from "../admins/admin-admins.module";
import { DownloadModule } from "src/core/download/download.module";

@Module({
  imports: [PrismaModule, LoggingModule, AdminAdminsModule, DownloadModule],
  controllers: [AdminWithdrawalsController],
  providers: [AdminWithdrawalsService],
})
export class AdminWithdrawalsModule {}
