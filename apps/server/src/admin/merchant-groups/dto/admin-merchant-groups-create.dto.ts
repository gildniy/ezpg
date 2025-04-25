import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { MerchantGroupStatus } from "@ezpg/database";

export class AdminMerchantGroupsCreateDto {
  @ApiProperty({
    description: "Name of the merchant group",
    example: "Premium Merchants",
  })
  @IsNotEmpty({ message: "Merchant group name is required" })
  @IsString({ message: "Merchant group name must be a string" })
  @MaxLength(100)
  groupName: string;

  @ApiProperty({
    description: "Status of the merchant group",
    enum: MerchantGroupStatus,
    example: MerchantGroupStatus.ACTIVE,
  })
  @IsEnum(MerchantGroupStatus)
  @IsNotEmpty({ message: "Status is required" })
  status: MerchantGroupStatus;
}
