import { Module } from "@nestjs/common";
import { EncryptionService } from "./encryption.service";
import { AppConfigModule } from "../../config/app-config.module";

/**
 * Encryption Module provides encryption/decryption capabilities
 * for sensitive data throughout the application
 */
@Module({
  imports: [AppConfigModule],
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionModule {}
