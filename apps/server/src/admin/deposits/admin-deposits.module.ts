import { Module } from "@nestjs/common";
import { ExcelService } from "../../core/excel/excel.service";
import { PrismaModule } from "@ezpg/database";
import { AdminDepositsController } from "./admin-deposits.controller";
import { AdminDepositsService } from "./admin-deposits.service";
import { DownloadModule } from "../../core/download/download.module";

@Module({
  imports: [PrismaModule, DownloadModule],
  controllers: [AdminDepositsController],
  providers: [AdminDepositsService, ExcelService],
  exports: [AdminDepositsService],
})
export class AdminDepositsModule {}
