import { Module } from "@nestjs/common";
import { DownloadController } from "./download.controller";
import { DownloadService } from "./download.service";
import { PrismaModule } from "@ezpg/database";
import { ExcelModule } from "../excel/excel.module";

/**
 * Module providing centralized file download functionality
 * Used by multiple modules for Excel downloads and other file types
 */
@Module({
  imports: [PrismaModule, ExcelModule],
  controllers: [DownloadController],
  providers: [DownloadService],
  exports: [DownloadService],
})
export class DownloadModule {}
