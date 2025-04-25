import { Module } from "@nestjs/common";
import { BankService } from "./bank.service";
import { BankSeedService } from "./bank.seed";
import { BankSeedCommand } from "./bank-seed.command";
import { BankCodeMappingService } from "./bank-code-mapping.service";
import { BankCodeMappingCommand } from "./bank-code-mapping.command";
import { PrismaModule } from "@ezpg/database";

@Module({
  imports: [PrismaModule],
  providers: [
    BankService,
    BankSeedService,
    BankSeedCommand,
    BankCodeMappingService,
    BankCodeMappingCommand,
  ],
  exports: [BankService, BankSeedService, BankCodeMappingService],
})
export class BankModule {}
