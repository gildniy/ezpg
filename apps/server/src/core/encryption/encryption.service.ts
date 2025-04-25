import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { AppConfigService } from "../../config/app-config.service"; // Use typed config service
import { decryptAes256Cbc, encryptAes256Cbc } from "@ezpg/helpers"; // Import from new helpers package
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly key: Buffer;

  constructor(private configService: AppConfigService) {
    const encryptionKey = this.configService.tfaEncryptionKey;
    console.log("encryptionKey...: ", encryptionKey);
    if (!encryptionKey || Buffer.from(encryptionKey).length !== 32) {
      this.logger.error("Invalid TFA_ENCRYPTION_KEY length. Must be 32 bytes.");
      // Throw an error during startup if the key is invalid
      throw new InternalServerErrorException(
        "Invalid TFA encryption key configuration.",
      );
    }
    this.key = Buffer.from(encryptionKey);
  }

  encrypt(text: string): string | null {
    if (!text) return null;
    const encrypted = encryptAes256Cbc(text, this.key);
    if (!encrypted) {
      // Log error within service context
      this.logger.error("Encryption failed using shared utility.");
      throw new InternalServerErrorException("Encryption process failed.");
    }
    return encrypted;
  }

  decrypt(text: string): string | null {
    if (!text) return null;
    const decrypted = decryptAes256Cbc(text, this.key);
    if (!decrypted) {
      // Log error within service context
      this.logger.error(
        `Decryption failed using shared utility for input: ${text.substring(0, 20)}...`,
      );
      // Return null as the utility function handles logging the specific crypto error
      return null;
    }
    return decrypted;
  }
}
