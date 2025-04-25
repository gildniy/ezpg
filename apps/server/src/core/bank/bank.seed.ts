import { Injectable } from "@nestjs/common";
import { PrismaService } from "@ezpg/database";
import { BANK_CODE_MAPPINGS, KOREAN_BANKS } from "./bank-data";

@Injectable()
export class BankSeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seedBanks() {
    console.log("Seeding banks...");

    const existingBanks = await this.prisma.bank.findMany({
      select: { bank_code: true },
    });

    const existingBankCodes = new Set(
      existingBanks.map((bank) => bank.bank_code),
    );

    for (const bank of KOREAN_BANKS) {
      if (!existingBankCodes.has(bank.code)) {
        await this.prisma.bank.create({
          data: {
            bank_code: bank.code,
            bank_name: bank.name,
            is_active: true,
          },
        });
        console.log(`Added bank: ${bank.displayName} (${bank.code})`);
      } else {
        console.log(`Bank already exists: ${bank.displayName} (${bank.code})`);
      }
    }

    console.log("✅ Banks seeding completed successfully");

    // Now seed the bank code mappings
    await this.seedBankCodeMappings();
  }

  async seedBankCodeMappings() {
    console.log("Seeding bank code mappings...");

    // Create the bank_code_mappings table if it doesn't exist
    await this.prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS bank_code_mappings (
        external_code VARCHAR(10) PRIMARY KEY,
        internal_code VARCHAR(10) NOT NULL REFERENCES banks(bank_code),
        external_name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create index on internal_code if it doesn't exist
    await this.prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS bank_code_mappings_internal_code_idx ON bank_code_mappings(internal_code)
    `;

    // Get existing mappings
    const existingMappings = await this.prisma.$queryRaw<
      { external_code: string }[]
    >`
      SELECT external_code FROM bank_code_mappings
    `;

    const existingExternalCodes = new Set(
      existingMappings.map((m) => m.external_code),
    );

    // Add or update mappings
    for (const mapping of BANK_CODE_MAPPINGS) {
      // Verify internal code exists in KOREAN_BANKS
      const bankExists = KOREAN_BANKS.some(
        (b) => b.code === mapping.internalCode,
      );
      if (!bankExists) {
        console.warn(
          `Warning: Internal bank code "${mapping.internalCode}" not found in KOREAN_BANKS list. Skipping.`,
        );
        continue;
      }

      try {
        if (!existingExternalCodes.has(mapping.externalCode)) {
          // Insert new mapping
          await this.prisma.$executeRaw`
            INSERT INTO bank_code_mappings (external_code, internal_code, external_name, created_at, updated_at)
            VALUES (${mapping.externalCode}, ${mapping.internalCode}, ${mapping.externalName}, NOW(), NOW())
          `;
          console.log(
            `Added mapping: External ${mapping.externalCode} -> Internal ${mapping.internalCode} (${mapping.externalName})`,
          );
        } else {
          // Update existing mapping
          await this.prisma.$executeRaw`
            UPDATE bank_code_mappings
            SET internal_code = ${mapping.internalCode}, 
                external_name = ${mapping.externalName},
                updated_at = NOW()
            WHERE external_code = ${mapping.externalCode}
          `;
          console.log(
            `Updated mapping: External ${mapping.externalCode} -> Internal ${mapping.internalCode} (${mapping.externalName})`,
          );
        }
      } catch (err) {
        console.error(
          `Error adding/updating mapping for ${mapping.externalCode}:`,
          err instanceof Error ? err.message : String(err),
        );
      }
    }

    console.log("✅ Bank code mappings seeding completed successfully");
  }
}
