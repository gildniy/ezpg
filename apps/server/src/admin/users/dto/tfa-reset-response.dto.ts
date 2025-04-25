import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO for TFA reset responses
 * Used when admin resets TFA for a user, merchant, or agent
 */
export class TfaResetResponseDto {
  @ApiProperty({
    description: "Result message",
    example: "TFA reset successfully",
  })
  message: string;

  @ApiProperty({
    description: "TOTP authentication URL for setup",
    example:
      "otpauth://totp/EZPG:merchant123?secret=ABCDEFGHIJKLMN&issuer=EZPG",
  })
  tfaSetupUrl: string;

  @ApiProperty({
    description: "Base64 encoded QR code image (without data URL prefix)",
    example: "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAklEQVR...",
  })
  tfaQrCodeBase64: string;
}
