import { Module } from "@nestjs/common";
import { ExcelService } from "./excel.service";
import { ConfigModule } from "@nestjs/config";

/**
 * Module for Excel file generation functionality
 * Provides services for creating and formatting Excel files
 */
@Module({
  imports: [ConfigModule],
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}
