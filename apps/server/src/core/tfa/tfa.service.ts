import { Injectable } from "@nestjs/common";
import {
  generateOtpAuthUri,
  generateTotpQrCodeDataUri,
  generateTotpSecret,
} from "@ezpg/helpers";
import { AppConfigService } from "../../config/app-config.service";

@Injectable()
export class TfaService {
  constructor(private readonly configService: AppConfigService) {}

  /**
   * Generate a new TFA secret and related data for a user
   * @param username The username to generate the secret for
   * @returns The generated secret and related data
   */
  async generateSecret(username: string) {
    // Generate a new TOTP secret
    const { base32: secretBase32 } = generateTotpSecret();

    // Generate OTP Auth URI for QR code
    const otpAuthUrl = generateOtpAuthUri(
      username,
      secretBase32,
      this.configService.appName,
    );

    // Generate QR code as data URL (base64)
    const qrCodeUrl = await generateTotpQrCodeDataUri(otpAuthUrl);

    // Extract the base64 part of the data URL (removing the prefix)
    const qrCodeBase64 = qrCodeUrl.split(",")[1] || "";

    return {
      secret: secretBase32,
      otpAuthUrl,
      qrCodeUrl,
      qrCodeBase64,
    };
  }
}
