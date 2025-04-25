import { ApiProperty } from "@nestjs/swagger";
import { MerchantGroupStatus } from "@ezpg/database";
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsNumber,
} from "class-validator";

export class AdminMerchantGroupsResponseDto {
  @ApiProperty({
    description: "Unique identifier of the merchant group",
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  groupId: number;

  @ApiProperty({
    description: "Name of the merchant group",
    example: "재관리 그룹",
  })
  @IsNotEmpty()
  @IsString()
  groupName: string;

  @ApiProperty({
    description: "Current status of the merchant group",
    enum: MerchantGroupStatus,
    example: MerchantGroupStatus.ACTIVE,
  })
  @IsNotEmpty()
  @IsEnum(MerchantGroupStatus)
  status: MerchantGroupStatus;

  @ApiProperty({
    description: "Username of the admin who created the group",
    example: "ezpgadmin",
  })
  @IsNotEmpty({ message: "Creator username is required" })
  @IsString({ message: "Creator username must be a string" })
  creatorUsername: string;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2025-05-20T00:00:00.000Z",
  })
  @IsNotEmpty()
  @IsDateString()
  createdAt: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2025-05-20T00:00:00.000Z",
  })
  @IsNotEmpty({ message: "Last update timestamp is required" })
  @IsDateString()
  updatedAt: Date;
}
