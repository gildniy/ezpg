import { Global, Module } from "@nestjs/common";
import { EncryptionService } from "./encryption/encryption.service";
import { LoggingService } from "./logging/logging.service";
import { AppConfigModule } from "../config/app-config.module"; // Ensure Config is available
import { PrismaModule } from "@ezpg/database";
import { ExcelModule } from "./excel/excel.module";
import { BankModule } from "./bank/bank.module";
import { ConfigModule } from "@nestjs/config";
import { IdGeneratorModule } from "./id-generator/id-generator.module";

@Global() // Make core services available globally
@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    ExcelModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BankModule,
    IdGeneratorModule,
  ],
  providers: [EncryptionService, LoggingService],
  exports: [
    EncryptionService,
    LoggingService,
    ExcelModule,
    BankModule,
    IdGeneratorModule,
  ],
})
export class CoreModule {}
