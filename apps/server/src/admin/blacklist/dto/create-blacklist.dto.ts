import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { BlacklistType } from "@ezpg/database";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBlacklistDto {
  @ApiProperty({
    enum: BlacklistType,
    description: "Type of entity to blacklist",
    example: BlacklistType.USER_ID,
    required: true,
  })
  @IsEnum(BlacklistType)
  @IsNotEmpty()
  type: BlacklistType;

  @ApiProperty({
    description: "Value to blacklist (IP, Account Number, etc.)",
    maxLength: 255,
    example: "192.168.1.100",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  value: string;

  @ApiPropertyOptional({
    description: "Reason for blacklisting",
    example: "Suspicious activity detected",
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
