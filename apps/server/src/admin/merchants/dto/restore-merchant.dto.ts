import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

/**
 * DTO for restoring a soft-deleted merchant
 */
export class RestoreMerchantDto {
  @ApiProperty({
    description: "The merchant ID to restore",
    example: "sticpay",
  })
  @IsString()
  @IsNotEmpty()
  merchantId: string;
}
