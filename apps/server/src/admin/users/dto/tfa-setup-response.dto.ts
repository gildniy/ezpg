import { ApiProperty } from "@nestjs/swagger";

export class TfaSetupResponseDto {
  @ApiProperty({
    description: "TFA secret",
    example: "ABCDEFGHIJKLMNOP",
  })
  secret: string;

  @ApiProperty({
    description: "OTP Auth URL for QR code generation",
    example:
      "otpauth://totp/EZPG:user@example.com?secret=ABCDEFGHIJKLMNOP&issuer=EZPG",
  })
  otpAuthUrl: string;

  @ApiProperty({
    description: "QR code URL for scanning",
    example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQA...",
  })
  qrCodeUrl: string;

  @ApiProperty({
    description: "QR code as base64 string for direct embedding",
    example: "iVBORw0KGgoAAAANSUhEUgAAAQA...",
  })
  qrCodeBase64: string;
}
