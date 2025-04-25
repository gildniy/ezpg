import * as crypto from "crypto";
import * as base32 from "thirty-two";
import QRCode from "qrcode";
import { Buffer } from "buffer";

// === Constants ===
const AES_ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // For AES-256
const HMAC_ALGORITHM = "sha256";
const SCRYPT_KEY_LENGTH = 32; // 256 bits for AES key
const TOTP_INTERVAL_SECONDS = 30;
const TOTP_DIGITS = 6;
const TOTP_SECRET_LENGTH_BYTES = 20; // Recommended length for SHA1 based TOTP
const TOTP_HMAC_ALGORITHM = "sha1"; // Standard for TOTP

// === Error Handling ===
class CryptoError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "CryptoError";
  }
}

// === AES Encryption with HMAC (Encrypt-then-MAC) ===

/**
 * Encrypts text using AES-256-CBC and appends an HMAC for integrity verification.
 * Format: iv:encryptedData:hmac
 *
 * @param text The plaintext string to encrypt.
 * @param key A 32-byte (256-bit) Buffer encryption key.
 * @returns The encrypted string in the format iv:encrypted:hmac, or throws CryptoError on failure.
 * @throws {CryptoError} If input is invalid or encryption fails.
 */
export function encryptAes256Cbc(text: string, key: Buffer): string {
  if (!text) {
    throw new CryptoError("Encryption input text cannot be empty.");
  }
  if (!key || key.length !== 32) {
    throw new CryptoError("Invalid encryption key: Must be a 32-byte Buffer.");
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(AES_ALGORITHM, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const dataToMac = iv.toString("hex") + ":" + encrypted;
    const hmac = crypto
      .createHmac(HMAC_ALGORITHM, key)
      .update(dataToMac)
      .digest("hex");

    return `${dataToMac}:${hmac}`; // iv:encrypted:hmac
  } catch (err) {
    throw new CryptoError("Encryption failed.", err);
  }
}

/**
 * Decrypts AES-256-CBC encrypted data after verifying its HMAC.
 * Expects format: iv:encryptedData:hmac
 *
 * @param encryptedData The encrypted string (iv:encrypted:hmac).
 * @param key A 32-byte (256-bit) Buffer decryption key.
 * @returns The original plaintext string, or throws CryptoError on failure.
 * @throws {CryptoError} If format is invalid, HMAC verification fails, or decryption fails.
 */
export function decryptAes256Cbc(encryptedData: string, key: Buffer): string {
  if (!encryptedData) {
    throw new CryptoError("Decryption input cannot be empty.");
  }
  if (!key || key.length !== 32) {
    throw new CryptoError("Invalid decryption key: Must be a 32-byte Buffer.");
  }

  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new CryptoError(
      "Invalid encrypted data format. Expected iv:encrypted:hmac.",
    );
  }

  const [ivHex, encrypted, hmac] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const receivedHmac = Buffer.from(hmac, "hex");

  const dataToMac = ivHex + ":" + encrypted;
  const calculatedHmac = crypto
    .createHmac(HMAC_ALGORITHM, key)
    .update(dataToMac)
    .digest(); // Keep as buffer for compare

  // Constant-time comparison
  if (
    receivedHmac.length !== calculatedHmac.length ||
    !crypto.timingSafeEqual(receivedHmac, calculatedHmac)
  ) {
    throw new CryptoError(
      "HMAC verification failed. Data may be tampered or key is incorrect.",
    );
  }

  try {
    const decipher = crypto.createDecipheriv(AES_ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    throw new CryptoError("Decryption failed.", err);
  }
}

// === Password-Based Key Derivation ===

/**
 * Derives a cryptographic key from a password and salt using scrypt.
 * Recommended to use a unique salt for each password.
 *
 * @param password The user's password.
 * @param salt A unique salt (Buffer or string). Store this alongside the password hash.
 * @param keylen The desired key length in bytes (default: 32 for AES-256).
 * @param options Optional scrypt parameters (cost, blocksize, parallelization). Use defaults unless you have specific needs.
 * @returns A Promise resolving to the derived key as a Buffer.
 * @throws {Error} If scrypt fails.
 */
export function deriveKeyScrypt(
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number = SCRYPT_KEY_LENGTH,
  options?: crypto.ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const callback = (err: Error | null, derivedKey: Buffer) => {
      if (err) {
        reject(new Error(`Key derivation failed: ${err.message}`));
      } else {
        resolve(derivedKey);
      }
    };

    // Call the appropriate crypto.scrypt overload
    if (options) {
      crypto.scrypt(password, salt, keylen, options, callback);
    } else {
      crypto.scrypt(password, salt, keylen, callback);
    }
  });
}

// === TOTP (Time-Based One-Time Password) Utilities ===

/**
 * Generates a cryptographically secure TOTP secret.
 *
 * @param lengthBytes The desired length of the secret in bytes (default: 20 for SHA1).
 * @returns An object containing the raw secret Buffer and its Base32 encoded string (RFC 4648, no padding).
 */
export function generateTotpSecret(
  lengthBytes: number = TOTP_SECRET_LENGTH_BYTES,
): { buffer: Buffer; base32: string } {
  const buffer = crypto.randomBytes(lengthBytes);
  // Base32 encode per RFC 4648 and remove padding ('=') which is common for QR codes/authenticator apps
  const base32Str = base32.encode(buffer).toString().replace(/=+$/, "");
  return { buffer, base32: base32Str };
}

/**
 * Generates a TOTP token based on RFC 6238.
 *
 * @param secret The raw secret Buffer (or Base32 string, though Buffer is recommended internally).
 * @param timestamp The Unix timestamp (in milliseconds) to generate the token for (default: current time).
 * @param digits The number of digits in the token (default: 6).
 * @param intervalSeconds The time interval in seconds (default: 30).
 * @param algorithm The HMAC algorithm (default: 'sha1').
 * @returns The TOTP token as a string.
 * @throws {CryptoError} If the secret is invalid.
 */
export function generateTOTP(
  secret: Buffer | string,
  timestamp: number = Date.now(),
  digits: number = TOTP_DIGITS,
  intervalSeconds: number = TOTP_INTERVAL_SECONDS,
  algorithm: string = TOTP_HMAC_ALGORITHM,
): string {
  let secretBuffer: Buffer;
  if (Buffer.isBuffer(secret)) {
    secretBuffer = secret;
  } else if (typeof secret === "string") {
    // Attempt to decode if it looks like base32, otherwise treat as UTF8 string (less common for TOTP)
    try {
      // Basic check for base32 characters
      if (/^[A-Z2-7]+=*$/.test(secret.toUpperCase())) {
        // hi-base32 doesn't have a decode, need another library or manual implementation if base32 input is required.
        // For now, we'll primarily support Buffer secrets internally.
        throw new Error("Base32 secret input requires a decoding library.");
        // Example using hypothetical decode: secretBuffer = base32Decode(secret);
      } else {
        secretBuffer = Buffer.from(secret, "utf8"); // Less standard for TOTP
      }
    } catch (e) {
      throw new CryptoError("Invalid secret format for TOTP generation.", e);
    }
  } else {
    throw new CryptoError("Invalid secret type. Expected Buffer or string.");
  }

  if (!secretBuffer || secretBuffer.length === 0) {
    throw new CryptoError("TOTP secret cannot be empty.");
  }

  // Calculate the counter C based on T (timestamp) and T0 (usually 0) and X (interval)
  // C = floor((T - T0) / X)
  const counter = Math.floor(timestamp / 1000 / intervalSeconds);

  // Convert counter to an 8-byte big-endian buffer
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  // Calculate HMAC-SHA1 (or other algorithm)
  const hmac = crypto
    .createHmac(algorithm, secretBuffer)
    .update(counterBuffer)
    .digest();

  // Dynamic Truncation (RFC 4226 Section 5.4)
  // Get the lower 4 bits of the last byte of the HMAC result
  const offset = hmac[hmac.length - 1] & 0x0f;

  // Extract 4 bytes from the HMAC result starting at the offset
  const truncatedHash =
    ((hmac[offset] & 0x7f) << 24) | // Most significant byte (mask MSB to 0)
    ((hmac[offset + 1] & 0xff) << 16) | // Second byte
    ((hmac[offset + 2] & 0xff) << 8) | // Third byte
    (hmac[offset + 3] & 0xff); // Least significant byte

  // Generate the code by taking the result modulo 10^digits
  const code = truncatedHash % 10 ** digits;

  // Pad with leading zeros if necessary
  return code.toString().padStart(digits, "0");
}

/**
 * Validates a TOTP token against the secret, allowing for a time window.
 *
 * @param token The token provided by the user.
 * @param secret The raw secret Buffer used to generate the token.
 * @param window The number of intervals to check before and after the current time (default: 1, checks current, previous, next).
 * @param digits The number of digits expected in the token (default: 6).
 * @param intervalSeconds The time interval in seconds (default: 30).
 * @param algorithm The HMAC algorithm (default: 'sha1').
 * @returns True if the token is valid within the window, false otherwise.
 * @throws {CryptoError} If the secret is invalid.
 */
export function validateTOTP(
  token: string,
  secret: Buffer, // Enforce Buffer for validation simplicity
  window: number = 1,
  digits: number = TOTP_DIGITS,
  intervalSeconds: number = TOTP_INTERVAL_SECONDS,
  algorithm: string = TOTP_HMAC_ALGORITHM,
): boolean {
  if (!token || token.length !== digits) {
    return false; // Invalid token format
  }
  if (!secret || secret.length === 0) {
    throw new CryptoError("Validation secret cannot be empty.");
  }

  const now = Date.now();

  // Check current, past, and future windows
  for (let timeOffset = -window; timeOffset <= window; timeOffset++) {
    const testTime = now + timeOffset * intervalSeconds * 1000;
    const generatedToken = generateTOTP(
      secret,
      testTime,
      digits,
      intervalSeconds,
      algorithm,
    );
    if (generatedToken === token) {
      return true;
    }
  }

  return false;
}

// === QR Code for Authenticator Apps ===

/**
 * Generates an 'otpauth://' URI for provisioning authenticator apps (like Google Authenticator).
 *
 * @param accountName Typically the user's email or username.
 * @param secretBase32 The Base32 encoded secret (padding removed).
 * @param issuer The name of the application or service.
 * @param digits The number of digits for the token (default: 6).
 * @param intervalSeconds The time interval in seconds (default: 30).
 * @param algorithm The algorithm ('SHA1', 'SHA256', 'SHA512' - default: 'SHA1').
 * @returns The otpauth URI string.
 */
export function generateOtpAuthUri(
  accountName: string,
  secretBase32: string,
  issuer: string,
  digits: number = TOTP_DIGITS,
  intervalSeconds: number = TOTP_INTERVAL_SECONDS,
  algorithm: string = "SHA1", // Case matters for URI standard
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccountName = encodeURIComponent(accountName);

  // otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example&algorithm=SHA1&digits=6&period=30
  let uri = `otpauth://totp/${encodedIssuer}:${encodedAccountName}`;
  uri += `?secret=${secretBase32}`;
  uri += `&issuer=${encodedIssuer}`;
  uri += `&algorithm=${algorithm.toUpperCase()}`;
  uri += `&digits=${digits}`;
  uri += `&period=${intervalSeconds}`;

  return uri;
}

/**
 * Generates a QR code image as a Data URI from an otpauth URI.
 *
 * @param otpauthUrl The otpauth URI generated by `generateOtpAuthUri`.
 * @returns A Promise resolving to the QR code image Data URI string (e.g., "data:image/png;base64,...").
 * @throws {Error} If QR code generation fails.
 */
export async function generateTotpQrCodeDataUri(
  otpauthUrl: string,
): Promise<string> {
  try {
    // Adjust error correction level or other options if needed
    const dataUri = await QRCode.toDataURL(otpauthUrl, {
      errorCorrectionLevel: "M",
    }); // Medium correction level
    return dataUri;
  } catch (err) {
    throw new Error(
      `Failed to generate QR code: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

// === Base32 Encoding/Decoding ===

/**
 * Decodes a Base32 encoded string (RFC 4648, padding optional) into a Buffer.
 *
 * @param encodedString The Base32 encoded string.
 * @returns The decoded Buffer.
 * @throws {Error} If decoding fails.
 */
export function base32Decode(encodedString: string): Buffer {
  // thirty-two handles padding automatically and expects uppercase
  try {
    return base32.decode(encodedString.toUpperCase());
  } catch (err) {
    throw new CryptoError(
      `Failed to decode Base32 string: ${encodedString.substring(0, 10)}...`,
      err,
    );
  }
}
