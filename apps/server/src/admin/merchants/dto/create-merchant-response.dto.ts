import { ApiProperty } from "@nestjs/swagger";
import { MerchantDetailResponseDto } from "./merchant-detail-response.dto";
import { UserResponseDto } from "./user-response.dto";

export class CreateMerchantResponseDto {
  @ApiProperty({
    description: "Success message",
    example: "Merchant registered successfully.",
  })
  message: string;

  @ApiProperty({
    description: "Created merchant details",
    type: MerchantDetailResponseDto,
  })
  merchant: MerchantDetailResponseDto;

  @ApiProperty({
    description: "Created user account details",
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: "TFA setup URL for QR code generation (if TFA enabled)",
    example:
      "otpauth://totp/EZPG:merchant_sticpay?secret=ABCDEFGHIJKLMNOP&issuer=EZPG",
    required: false,
  })
  tfaSetupUrl?: string;

  @ApiProperty({
    description: "Base64 encoded QR code image for TFA setup",
    example: "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAklEQVR...",
    required: false,
  })
  tfaQrCodeBase64?: string;

  @ApiProperty({
    description: "API key for merchant integration",
    example: "aa80cdda-5498-44fb-afd0-660f8b59d9ef",
    required: false,
  })
  apiKey?: string;
}
