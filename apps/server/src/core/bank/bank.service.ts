import { Injectable } from "@nestjs/common";
import { PrismaService } from "@ezpg/database";

interface Bank {
  bank_code: string;
  bank_name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface MerchantBankInfo {
  primary_bank_code: string | null;
  linked_banks: string | null;
}

@Injectable()
export class BankService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all active banks
   * @returns List of active banks
   */
  async getAllActiveBanks() {
    return this.prisma.$queryRaw<Bank[]>`
      SELECT * FROM banks 
      WHERE is_active = true 
      ORDER BY bank_name ASC
    `;
  }

  /**
   * Get bank by code
   * @param bankCode - The bank code to look up
   * @returns Bank details or null if not found
   */
  async getBankByCode(bankCode: string) {
    const banks = await this.prisma.$queryRaw<Bank[]>`
      SELECT * FROM banks 
      WHERE bank_code = ${bankCode}
    `;
    return banks.length > 0 ? banks[0] : null;
  }

  /**
   * Get banks used by a merchant
   * @param merchantId - The merchant ID
   * @returns List of banks associated with the merchant
   */
  async getBanksForMerchant(merchantId: string) {
    // First get the merchant to access its bank codes
    const merchants = await this.prisma.$queryRaw<MerchantBankInfo[]>`
      SELECT primary_bank_code, linked_banks
      FROM merchants
      WHERE merchant_id = ${merchantId}
      AND deleted_at IS NULL
    `;

    if (!merchants || merchants.length === 0) {
      return [];
    }

    const merchant = merchants[0];

    // Collect all bank codes associated with this merchant
    const bankCodes = new Set<string>();

    if (merchant.primary_bank_code) {
      bankCodes.add(merchant.primary_bank_code);
    }

    if (merchant.linked_banks) {
      const linkedBankCodes = merchant.linked_banks.split(",").filter(Boolean);
      linkedBankCodes.forEach((code) => bankCodes.add(code));
    }

    // Fetch the bank details
    if (bankCodes.size === 0) {
      return [];
    }

    const bankCodesArray = Array.from(bankCodes);

    // For IN clause with raw SQL, we need to format the array properly
    const bankCodesFormatted = bankCodesArray
      .map((code) => `'${code}'`)
      .join(",");

    return this.prisma.$queryRawUnsafe<Bank[]>(`
      SELECT * FROM banks
      WHERE bank_code IN (${bankCodesFormatted})
      AND is_active = true
      ORDER BY bank_name ASC
    `);
  }

  /**
   * Get merchants by bank code
   * @param bankCode - The bank code to filter by
   * @param adminId - Optional admin ID to filter merchants by creator
   * @returns List of merchants associated with the bank
   */
  async getMerchantsByBank(bankCode: string, adminId?: string) {
    let query = `
      SELECT m.*, u.username, u.is_active
      FROM merchants m
      JOIN users u ON m.user_id = u.user_id
      WHERE (m.primary_bank_code = '${bankCode}' OR m.linked_banks LIKE '%${bankCode}%')
      AND m.deleted_at IS NULL
    `;

    // Filter by admin if specified
    if (adminId !== undefined) {
      query += ` AND m.created_by = ${adminId}`;
    }

    return this.prisma.$queryRawUnsafe(query);
  }
}
