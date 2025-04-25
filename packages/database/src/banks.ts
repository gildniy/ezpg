/**
 * Centralized banks module for EZPG application
 *
 * This module exports the list of supported Korean banks with
 * their codes, names and display names in Korean.
 */

/**
 * Bank information structure
 */
export interface Bank {
  /** Bank code used internally in the system */
  code: string;
  /** Translatable name key (in i18n format) */
  name: string;
  /** Korean display name */
  displayName: string;
}

/**
 * List of supported Korean banks
 *
 * This list is the source of truth for banks in the application and
 * should be used instead of duplicating the bank list across files.
 */
export const KOREAN_BANKS: Bank[] = [
  { code: "KB", name: "banks.kb_kookmin", displayName: "KB국민은행" },
  { code: "SH", name: "banks.shinhan", displayName: "신한은행" },
  { code: "WR", name: "banks.woori", displayName: "우리은행" },
  { code: "HN", name: "banks.hana", displayName: "하나은행" },
  { code: "NH", name: "banks.nonghyup", displayName: "농협은행" },
  { code: "IBK", name: "banks.ibk", displayName: "기업은행" },
  { code: "SC", name: "banks.sc_first", displayName: "SC제일은행" },
  { code: "KKO", name: "banks.kakao", displayName: "카카오뱅크" },
  { code: "KB2", name: "banks.kbank", displayName: "케이뱅크" },
  { code: "TOSS", name: "banks.toss", displayName: "토스뱅크" },
  { code: "BS", name: "banks.busan", displayName: "부산은행" },
  { code: "DG", name: "banks.daegu", displayName: "대구은행" },
  { code: "KN", name: "banks.kyongnam", displayName: "경남은행" },
  { code: "KJ", name: "banks.kwangju", displayName: "광주은행" },
  { code: "JB", name: "banks.jeonbuk", displayName: "전북은행" },
  { code: "JJ", name: "banks.jeju", displayName: "제주은행" },
  { code: "KDB", name: "banks.industrial", displayName: "산업은행" },
  { code: "SHB", name: "banks.suhyup", displayName: "수협은행" },
  { code: "MG", name: "banks.saemaul", displayName: "새마을금고" },
  { code: "CU", name: "banks.cu", displayName: "신협" },
  { code: "POST", name: "banks.post", displayName: "우체국" },
  { code: "CITI", name: "banks.citi", displayName: "씨티은행" },
  { code: "DB", name: "banks.deutsche", displayName: "도이치은행" },
  { code: "BNP", name: "banks.bnp", displayName: "BNP파리바은행" },
  { code: "BOC", name: "banks.china", displayName: "중국은행" },
];

/**
 * Get bank by code
 * @param code The bank code to look up
 * @returns The bank object or undefined if not found
 */
export function getBankByCode(code: string): Bank | undefined {
  return KOREAN_BANKS.find((bank) => bank.code === code);
}

/**
 * Get bank by name key
 * @param name The bank name key to look up
 * @returns The bank object or undefined if not found
 */
export function getBankByName(name: string): Bank | undefined {
  return KOREAN_BANKS.find((bank) => bank.name === name);
}

/**
 * Get all bank codes
 * @returns Array of all bank codes
 */
export function getAllBankCodes(): string[] {
  return KOREAN_BANKS.map((bank) => bank.code);
}

/**
 * Convert external bank code to internal bank code using the mapping
 * @param externalCode The external bank code
 * @param mappings The bank code mappings
 * @returns The internal bank code or null if not found
 */
export function getInternalBankCode(
  externalCode: string,
  mappings: Record<string, string>,
): string | null {
  return mappings[externalCode] || null;
}

// External bank codes to our internal bank codes mapping
export const BANK_CODE_MAPPINGS = [
  {
    externalCode: "002",
    internalCode: "KDB",
    externalName: "Korea Development Bank",
  },
  {
    externalCode: "003",
    internalCode: "IBK",
    externalName: "Industrial Bank of Korea",
  },
  { externalCode: "004", internalCode: "KB", externalName: "Kookmin Bank" },
  {
    externalCode: "007",
    internalCode: "SHB",
    externalName: "National Fishery Coop Federation",
  },
  { externalCode: "011", internalCode: "NH", externalName: "Nonghyup Bank" },
  { externalCode: "019", internalCode: "KB", externalName: "Kookmin Bank" },
  { externalCode: "020", internalCode: "WR", externalName: "Woori Bank" },
  { externalCode: "022", internalCode: "WR", externalName: "Woori Bank" },
  {
    externalCode: "023",
    internalCode: "SC",
    externalName: "Standard Chartered",
  },
  { externalCode: "026", internalCode: "SH", externalName: "Shin Han Bank" },
  { externalCode: "027", internalCode: "CITI", externalName: "Citibank Korea" },
  { externalCode: "031", internalCode: "DG", externalName: "Daegu Bank" },
  { externalCode: "032", internalCode: "BS", externalName: "Busan Bank" },
  { externalCode: "034", internalCode: "KJ", externalName: "Kwangju Bank" },
  { externalCode: "035", internalCode: "JJ", externalName: "Jeju Bank" },
  { externalCode: "037", internalCode: "JB", externalName: "Jeonbuk Bank" },
  { externalCode: "039", internalCode: "KN", externalName: "Kyongnam Bank" },
  {
    externalCode: "045",
    internalCode: "MG",
    externalName: "Korea Federation of Community Credit Cooperatives",
  },
  {
    externalCode: "048",
    internalCode: "CU",
    externalName: "National Credit Union Federation of Korea",
  },
  { externalCode: "053", internalCode: "CITI", externalName: "Citibank Korea" },
  { externalCode: "055", internalCode: "DB", externalName: "Deutsche Bank" },
  { externalCode: "061", internalCode: "BNP", externalName: "BNP Paribas" },
  { externalCode: "063", internalCode: "BOC", externalName: "Bank of China" },
  { externalCode: "071", internalCode: "POST", externalName: "Korea Post" },
  { externalCode: "081", internalCode: "HN", externalName: "KEB Hana Bank" },
  { externalCode: "088", internalCode: "SH", externalName: "Shinhan Bank" },
  { externalCode: "089", internalCode: "KB2", externalName: "K Bank" },
  { externalCode: "090", internalCode: "KKO", externalName: "Kakao Bank" },
  { externalCode: "092", internalCode: "TOSS", externalName: "Toss Bank" },
];

export default KOREAN_BANKS;
