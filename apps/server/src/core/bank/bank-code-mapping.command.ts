import { Command, CommandRunner } from "nest-commander";
import { Injectable } from "@nestjs/common";
import { BankSeedService } from "./bank.seed";

@Injectable()
@Command({
  name: "map:bank-codes",
  description: "Map external bank codes to internal system",
})
export class BankCodeMappingCommand extends CommandRunner {
  constructor(private readonly bankSeedService: BankSeedService) {
    super();
  }

  async run(): Promise<void> {
    console.log("Mapping external bank codes to internal system...");
    try {
      await this.bankSeedService.seedBankCodeMappings();
      console.log("✅ Bank codes mapping completed successfully");
    } catch (error) {
      console.error("❌ Error mapping bank codes:", error);
    }
  }
}
