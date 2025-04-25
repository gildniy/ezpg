import { Injectable } from "@nestjs/common";
import { PrismaService } from "@ezpg/database";

interface BankCodeMapping {
  external_code: string;
  internal_code: string;
  external_name?: string;
}

interface BankNameMapping extends BankCodeMapping {
  bank_name: string;
}

@Injectable()
export class BankCodeMappingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Look up internal bank code from external code
   * @param externalCode The external bank code to look up
   * @returns The internal bank code or null if not found
   */
  async getInternalCode(externalCode: string): Promise<string | null> {
    const mapping = await this.prisma.$queryRaw<{ internal_code: string }[]>`
      SELECT internal_code
      FROM bank_code_mappings
      WHERE external_code = ${externalCode}
    `;

    return mapping.length > 0 ? mapping[0].internal_code : null;
  }

  /**
   * Look up external bank codes for an internal code
   * @param internalCode The internal bank code to look up
   * @returns Array of external bank codes that map to this internal code
   */
  async getExternalCodes(internalCode: string): Promise<string[]> {
    const mappings = await this.prisma.$queryRaw<{ external_code: string }[]>`
      SELECT external_code
      FROM bank_code_mappings
      WHERE internal_code = ${internalCode}
    `;

    return mappings.map((m) => m.external_code);
  }

  /**
   * Get full mapping details for an external code
   * @param externalCode The external bank code to look up
   * @returns Full mapping details including bank name
   */
  async getBankByExternalCode(
    externalCode: string,
  ): Promise<BankNameMapping | null> {
    const result = await this.prisma.$queryRaw<BankNameMapping[]>`
      SELECT m.external_code, m.internal_code, b.bank_name
      FROM bank_code_mappings m
      JOIN banks b ON m.internal_code = b.bank_code
      WHERE m.external_code = ${externalCode}
    `;

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Get a list of all bank code mappings
   * @returns Array of all bank code mappings
   */
  async getAllMappings(): Promise<BankNameMapping[]> {
    return await this.prisma.$queryRaw<BankNameMapping[]>`
      SELECT m.external_code, m.internal_code, b.bank_name
      FROM bank_code_mappings m
      JOIN banks b ON m.internal_code = b.bank_code
      ORDER BY m.external_code
    `;
  }
}
