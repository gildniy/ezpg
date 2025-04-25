import { IsBoolean, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateMerchantStatusDto {
  @ApiProperty({
    description: "Whether the merchant is active",
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
