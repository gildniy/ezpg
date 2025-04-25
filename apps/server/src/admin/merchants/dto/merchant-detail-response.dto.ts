import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";
import { MerchantStatus } from "@ezpg/database";

/**
 * DTO for merchant detail view responses
 * Contains all fields needed for displaying a merchant's complete details
 */
export class MerchantDetailResponseDto {
  @ApiProperty({ description: "Row number", required: false })
  @IsNumber()
  @IsOptional()
  number?: number;

  @ApiProperty({ description: "Merchant ID" })
  @IsString()
  @MinLength(8)
  @MaxLength(8)
  @IsNotEmpty()
  merchantId: string;

  @ApiProperty({ description: "Merchant affiliate name" })
  @IsString()
  @IsNotEmpty()
  affiliate: string;

  @ApiProperty({ description: "Merchant company name" })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ description: "Group ID" })
  @IsNumber()
  @IsNotEmpty()
  groupId: number;

  @ApiProperty({ description: "Group name" })
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @ApiProperty({ description: "Number of members" })
  @IsNumber()
  @IsNotEmpty()
  numberOfMembers: number;

  @ApiProperty({ description: "Merchant status", enum: MerchantStatus })
  @IsEnum(MerchantStatus)
  @IsNotEmpty()
  status: MerchantStatus;

  @ApiProperty({ description: "Whether the merchant is active" })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({ description: "Merchant creation date" })
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty({ description: "Admin who created the merchant" })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty({ description: "Deposit fee rate percentage" })
  @IsNumber()
  @IsNotEmpty()
  depositFeeRate: number;

  @ApiProperty({ description: "Deposit fee minimum amount (per transaction)" })
  @IsNumber()
  @IsNotEmpty()
  depositFee: number;

  @ApiProperty({ description: "Remittance fee rate percentage" })
  @IsNumber()
  @IsNotEmpty()
  remittanceFeeRate: number;

  @ApiProperty({
    description: "Remittance fee minimum amount (per transaction)",
  })
  @IsNumber()
  @IsNotEmpty()
  remittanceFee: number;

  @ApiProperty({ description: "Foreign currency remittance fee rate" })
  @IsNumber()
  @IsNotEmpty()
  foreignCurrencyRemittanceFeeRate: number;

  @ApiProperty({ description: "Foreign currency deposit fee rate" })
  @IsNumber()
  @IsNotEmpty()
  foreignCurrencyFeeRate: number;

  // Settlement fee information
  @ApiProperty({ description: "Settlement fee rate percentage" })
  @IsNumber()
  @IsNotEmpty()
  settlementFeeRate: number;

  @ApiProperty({
    description: "Settlement fee minimum amount (per transaction)",
  })
  @IsNumber()
  @IsNotEmpty()
  settlementFee: number;

  @ApiProperty({ description: "Reserve rate percentage" })
  @IsNumber()
  @IsNotEmpty()
  reserveRate: number;

  @ApiProperty({ description: "Current merchant balance" })
  @IsNumber()
  @IsNotEmpty()
  balance: number;

  // Bank information
  @ApiProperty({ description: "Selected banks", type: [String] })
  @IsArray()
  @IsNotEmpty()
  selectedBanks: string[];

  // Remittance information
  @ApiProperty({ description: "Withdrawal bank name" })
  @IsString()
  @IsOptional()
  withdrawalBankName?: string;

  @ApiProperty({ description: "Withdrawal account number" })
  @IsString()
  @IsOptional()
  withdrawalAccountNumber?: string;

  @ApiProperty({ description: "Withdrawal account holder" })
  @IsString()
  @IsOptional()
  withdrawalAccountHolder?: string;

  // Foreign bank information
  @ApiProperty({ description: "Foreign bank name" })
  @IsString()
  @IsOptional()
  foreignBankName?: string;

  @ApiProperty({ description: "Foreign bank account number" })
  @IsString()
  @IsOptional()
  foreignBankAccountNumber?: string;

  @ApiProperty({ description: "Foreign bank account holder" })
  @IsString()
  @IsOptional()
  foreignBankAccountHolder?: string;

  // Dashboard access
  @ApiProperty({ description: "Dashboard ID" })
  @IsString()
  @IsOptional()
  dashboardId?: string;

  @ApiProperty({ description: "Dashboard password (masked)" })
  @IsString()
  @IsOptional()
  dashboardPassword?: string;

  // Virtual account settings
  @ApiProperty({ description: "Virtual account usage flag (Y/N)" })
  @IsString()
  @IsNotEmpty()
  virtualAccountUsage: string;

  @ApiProperty({ description: "Virtual account limit" })
  @IsNumber()
  @IsOptional()
  virtualAccountLimit?: number;

  // Financial summary
  @ApiProperty({ description: "Total deposit amount" })
  @IsNumber()
  @IsOptional()
  totalDeposit?: number;

  @ApiProperty({ description: "Total deposit fee amount" })
  @IsNumber()
  @IsOptional()
  totalDepositFee?: number;

  @ApiProperty({ description: "Total withdrawal amount" })
  @IsNumber()
  @IsOptional()
  totalWithdrawal?: number;

  @ApiProperty({ description: "Total withdrawal fee amount" })
  @IsNumber()
  @IsOptional()
  totalWithdrawalFee?: number;

  // Agent distribution rates
  @ApiProperty({
    description: "Top 5 agents with distribution rates",
    type: [Object],
  })
  @IsArray()
  @IsOptional()
  agents?: {
    agentId: string;
    agentName: string;
    distributionRate: number;
  }[];

  // API integration
  @ApiProperty({ description: "Merchant MID" })
  @IsString()
  @IsOptional()
  mid?: string;

  @ApiProperty({ description: "Merchant MKEY" })
  @IsUUID()
  @IsOptional()
  mkey?: string;

  @ApiProperty({ description: "Callback URL" })
  @IsString()
  @IsOptional()
  callbackUrl?: string;

  // Notification settings
  @ApiProperty({ description: "Telegram ID" })
  @IsString()
  @IsOptional()
  telegramId?: string;

  @ApiProperty({ description: "Notification types", type: [String] })
  @IsArray()
  @IsOptional()
  notificationTypes?: string[];

  @ApiProperty({ description: "Notification time" })
  @IsString()
  @IsOptional()
  notificationTime?: string;
}
