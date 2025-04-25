import { Command, CommandRunner } from "nest-commander";
import { BankSeedService } from "./bank.seed";

@Command({ name: "seed:banks", description: "Seed Korean banks" })
export class BankSeedCommand extends CommandRunner {
  constructor(private readonly bankSeedService: BankSeedService) {
    super();
  }

  async run(): Promise<void> {
    try {
      await this.bankSeedService.seedBanks();
      console.log("✅ Banks successfully seeded");
    } catch (error) {
      console.error("❌ Error seeding banks:", error);
    }
  }
}
