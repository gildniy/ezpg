import {
  IsDecimal,
  IsEnum,
  IsInt,
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from "class-validator";
import { MerchantStatus } from "@ezpg/database"; // Import enum
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateMerchantDto {
  @ApiPropertyOptional({
    description: "Updated affiliate (was merchant name)",
    example: "Updated Affiliate Inc.",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  affiliate?: string;

  @ApiPropertyOptional({
    description: "Updated ID of the merchant group",
    example: 2,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  groupId?: number; // Allow changing group

  @ApiPropertyOptional({
    description: "Updated deposit fee rate (0.00 - 100.00)",
    example: 0.6,
    type: Number,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: "2" })
  @Min(0.0)
  @Max(100.0)
  depositFeeRate?: number;

  @ApiPropertyOptional({
    description: "Updated remittance fee rate (0.00 - 100.00)",
    example: 1.1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: "2" })
  @Min(0.0)
  @Max(100.0)
  remittanceFeeRate?: number;

  @ApiPropertyOptional({
    description: "Updated reserve rate (0.00 - 100.00)",
    example: 0.2,
    type: Number,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: "2" })
  @Min(0.0)
  @Max(100.0)
  reserveRate?: number;

  @ApiPropertyOptional({
    description: "Updated foreign currency fee rate (0.00 - 100.00)",
    example: 0.5,
    type: Number,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: "2" })
  @Min(0.0)
  @Max(100.0)
  foreignCurrencyFeeRate?: number;

  @ApiPropertyOptional({
    description: "Updated status of the merchant",
    enum: MerchantStatus,
    example: MerchantStatus.INACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(MerchantStatus) // Validate against enum
  status?: MerchantStatus; // ACTIVE, INACTIVE (DELETED handled by DELETE endpoint)

  @ApiPropertyOptional({ description: "Company name of the merchant" })
  @IsString()
  @IsOptional()
  company_name?: string;

  @ApiPropertyOptional({ description: "Telegram ID of the merchant" })
  @IsString()
  @IsOptional()
  telegram_id?: string;

  @ApiPropertyOptional({ description: "Minimum withdrawal amount" })
  @IsNumber()
  @Min(0)
  @IsOptional()
  min_withdrawal_amount?: number;

  @ApiPropertyOptional({ description: "Maximum withdrawal amount" })
  @IsNumber()
  @Min(0)
  @IsOptional()
  max_withdrawal_amount?: number;

  @ApiPropertyOptional({ description: "Callback IP address" })
  @IsString()
  @IsIP()
  @IsOptional()
  callback_ip?: string;

  @ApiPropertyOptional({
    description: "Linked banks (comma-separated bank codes)",
    example: "KB001,KB002,KB003",
  })
  @IsString()
  @IsOptional()
  linked_banks?: string;

  @ApiPropertyOptional({ description: "Group name" })
  @IsString()
  @IsOptional()
  group?: string;

  // Add fields to update associated user if needed (e.g., is_active, tfa_enabled)
  // Be careful with username/password changes here - might belong in a separate user management module
}
