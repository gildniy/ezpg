import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateBankDto {
  @ApiProperty({
    description: "Bank name",
    example: "Updated Korea Exchange Bank",
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  bank_name?: string;

  @ApiProperty({
    description: "Whether the bank is active",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
