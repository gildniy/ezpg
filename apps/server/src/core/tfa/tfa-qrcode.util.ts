import { generateOtpAuthUri, generateTotpQrCodeDataUri } from "@ezpg/helpers";
import { EncryptionService } from "../encryption/encryption.service";

/**
 * Generates a TFA QR code as a base64 string for display
 * @param username The user's username
 * @param encryptedSecret The encrypted TFA secret from the DB
 * @param encryptionService The encryption service instance
 * @param issuer The issuer name (default: 'EZPG Payment Gateway')
 * @returns The QR code as a base64 string (without data URI prefix)
 */
export async function getTfaQrCodeBase64(
  username: string,
  encryptedSecret: string,
  encryptionService: EncryptionService,
  issuer = process.env.TFA_ISSUER || "EZPG Payment Gateway",
): Promise<string | null> {
  if (!encryptedSecret) return null;
  const decryptedSecret = encryptionService.decrypt(encryptedSecret);
  if (!decryptedSecret) return null;
  const otpAuthUrl = generateOtpAuthUri(username, decryptedSecret, issuer);
  const qrCodeDataUri = await generateTotpQrCodeDataUri(otpAuthUrl);
  return qrCodeDataUri.split(",")[1] || null;
}
