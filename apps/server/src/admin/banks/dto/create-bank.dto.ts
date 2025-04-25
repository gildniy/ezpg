import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateBankDto {
  @ApiProperty({
    description: "Bank code (primary key)",
    example: "BK001",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  bank_code: string;

  @ApiProperty({
    description: "Bank name",
    example: "Korea Exchange Bank",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bank_name: string;

  @ApiProperty({
    description: "Whether the bank is active",
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
