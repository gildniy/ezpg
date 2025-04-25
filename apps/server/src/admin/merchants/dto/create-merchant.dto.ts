import {
  IsArray,
  IsBoolean,
  IsDecimal,
  IsEnum,
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MerchantStatus } from "@ezpg/database";

// New DTO for agent distribution
export class AgentDistributionDto {
  @ApiProperty({
    description: "ID of the agent",
    example: "agent123",
  })
  @IsString()
  @IsNotEmpty()
  agentId: string;

  @ApiProperty({
    description: "Distribution rate for this agent (0.00 - 100.00)",
    example: 5.5,
    type: Number,
  })
  @IsNumber()
  @IsDecimal({ decimal_digits: "2" })
  @Min(0.0)
  @Max(100.0)
  distributionRate: number;
}

export class CreateMerchantDto {
  // Basic Information (First Tab)
  @ApiProperty({
    description: "Affiliate name",
    example: "New Affiliate Inc.",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  affiliate: string;

  @ApiProperty({
    description: "Company name of the merchant",
    example: "Example Company",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: "Login username (Merchant ID)",
    example: "merchant001",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: "Telegram ID",
    example: "merchant_telegram",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  telegramId: string;

  @ApiProperty({
    description: "Group ID",
    example: 1,
    type: Number,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  groupId: number;

  @ApiProperty({
    description: "Merchant status",
    enum: MerchantStatus,
    default: MerchantStatus.ACTIVE,
    required: true,
  })
  @IsEnum(MerchantStatus)
  @IsNotEmpty()
  status: MerchantStatus;

  // Fee Information
  @ApiProperty({
    description: "Deposit Fee (%)",
    example: 0.1,
    type: Number,
    required: true,
  })
  @IsNumber()
  @IsDecimal({ decimal_digits: "2" })
  @Min(0.0)
  @Max(100.0)
  depositFeeRate: number;

  @ApiProperty({
    description: "Fee per deposit (KRW)",
    example: 1000,
    type: Number,
    required: true,
  })
  @IsNumber()
  depositFee: number;

  @ApiProperty({
    description: "Withdrawal Fee (%)",
    example: 0.1,
    type: Number,
    required: true,
  })
  @IsNumber()
  @IsDecimal({ decimal_digits: "2" })
  @Min(0.0)
  @Max(100.0)
  remittanceFeeRate: number;

  @ApiProperty({
    description: "Fee per withdrawal (KRW)",
    example: 1000,
    type: Number,
    required: true,
  })
  @IsNumber()
  remittanceFee: number;

  @ApiProperty({
    description: "Settlement fee (%)",
    example: 0.1,
    type: Number,
    required: true,
  })
  @IsNumber()
  @IsDecimal({ decimal_digits: "2" })
  @Min(0.0)
  @Max(100.0)
  settlementFeeRate: number;

  @ApiProperty({
    description: "Fee per settlement (KRW)",
    example: 1000,
    type: Number,
    required: true,
  })
  @IsNumber()
  settlementFee: number;

  @ApiProperty({
    description: "Foreign currency fee (%)",
    example: 0.1,
    type: Number,
    required: true,
  })
  @IsNumber()
  @IsDecimal({ decimal_digits: "2" })
  @Min(0.0)
  @Max(100.0)
  foreignCurrencyFeeRate: number;

  @ApiProperty({
    description: "Foreign currency remittance fee (%)",
    example: 0.1,
    type: Number,
    required: true,
  })
  @IsNumber()
  @IsDecimal({ decimal_digits: "2" })
  @Min(0.0)
  @Max(100.0)
  foreignCurrencyRemittanceFeeRate: number;

  @ApiProperty({
    description: "Reserve amount",
    example: 0,
    type: Number,
    required: true,
  })
  @IsNumber()
  reserveAmount: number;

  @ApiProperty({
    description: "Merchant Cash Maintenance Ratio (%)",
    example: 0.1,
    type: Number,
    required: true,
  })
  @IsNumber()
  @IsDecimal({ decimal_digits: "2" })
  @Min(0.0)
  @Max(100.0)
  reserveRate: number;

  // Foreign Currency Remittance Bank Information
  @ApiProperty({
    description: "Foreign bank name",
    example: "ABC Bank",
    required: true,
  })
  @IsString()
  foreignBankName: string;

  @ApiProperty({
    description: "Foreign bank account number",
    example: "1234567890",
    required: true,
  })
  @IsString()
  foreignBankAccountNumber: string;

  @ApiProperty({
    description: "Foreign bank account holder name",
    example: "John Doe",
    required: true,
  })
  @IsString()
  foreignBankAccountHolder: string;

  // // Bank Integration (Second Tab)
  // @ApiProperty({
  //   description: "Selected bank codes",
  //   example: ["002", "004", "022"],
  //   type: [String],
  //   required: true,
  // })
  // @IsArray()
  // @IsString({ each: true })
  // selectedBankCodes: string[];

  // Virtual Account
  @ApiProperty({
    description: "Number of virtual account issuance accounts",
    example: 10,
    type: Number,
    required: true,
  })
  @IsNumber()
  virtualAccountsLimit: number;

  @ApiProperty({
    description: "Amount that can be deposited into virtual account",
    example: 10000,
    type: Number,
    required: true,
  })
  @IsNumber()
  virtualAccountDepositLimit: number;

  // Transaction Limits
  @ApiProperty({
    description: "Maximum deposit amount per transaction",
    example: 10000000,
    type: Number,
    required: true,
  })
  @IsNumber()
  maxDepositPerTransaction: number;

  @ApiProperty({
    description: "Maximum deposit amount per day",
    example: 30000000,
    type: Number,
    required: true,
  })
  @IsNumber()
  maxDailyDeposit: number;

  @ApiProperty({
    description: "Maximum withdrawal amount per transaction",
    example: 1000000,
    type: Number,
    required: true,
  })
  @IsNumber()
  maxWithdrawalPerTransaction: number;

  @ApiProperty({
    description: "Maximum daily withdrawal amount",
    example: 5000000,
    type: Number,
    required: true,
  })
  @IsNumber()
  maxDailyWithdrawal: number;

  // // Alert Settings (Third Tab)
  // @ApiProperty({
  //   description: "Alert types",
  //   example: ["PAYMENT", "SYSTEM"],
  //   type: [String],
  //   required: false,
  // })
  // @IsArray()
  // @IsString({ each: true })
  // @IsOptional()
  // alertTypes?: string[];

  // @ApiProperty({
  //   description: "Alert time option",
  //   example: "24HOURS", // "24HOURS", "BUSINESS_HOURS", "CUSTOM"
  //   required: false,
  // })
  // @IsString()
  // @IsOptional()
  // alertTimeOption?: string;

  // API Integration (Callback Information)
  @ApiProperty({
    description: "Callback IP address",
    example: "192.168.0.1",
    required: true,
  })
  @IsString()
  callbackIpAddress: string;

  @ApiProperty({
    description: "Callback URL",
    example: "https://example.com/callback",
    required: false,
  })
  @IsString()
  @IsOptional()
  callbackUri?: string;

  //////////////

  // @ApiProperty({
  //   description: "Unique Merchant ID (8 characters)",
  //   example: "newmerc1",
  //   minLength: 8,
  //   maxLength: 8,
  //   required: true,
  // })
  // @IsString()
  // @IsNotEmpty()
  // @Length(4, 8)
  // merchantId: string;

  // @ApiProperty({
  //   description:
  //     "Initial password for the merchant account (min 8 chars, complex)",
  //   example: "ComplexPass123!",
  //   required: true,
  // })
  // @IsString()
  // @IsNotEmpty()
  // @MinLength(8, {
  //   message: "Initial password must be at least 8 characters long",
  // })
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message: "Initial password is too weak.",
  // })
  // password: string;

  // @ApiProperty({
  //   description: "Enable two-factor authentication",
  //   example: false,
  //   type: Boolean,
  //   default: false,
  // })
  // @IsBoolean()
  // @IsOptional()
  // enableTfa?: boolean;

  // // Basic information

  // @ApiProperty({
  //   description: "Affiliate (was merchant name)",
  //   example: "New Affiliate Inc.",
  //   required: true,
  // })
  // @IsString()
  // @IsNotEmpty()
  // affiliate: string;

  // @ApiProperty({
  //   description: "Affiliate name of the merchant",
  //   required: true,
  // })
  // @IsString()
  // @IsNotEmpty()
  // companyName: string;

  // @ApiProperty({
  //   description: "Login username for the merchant account",
  //   example: "newmerc_login",
  //   required: true,
  // })
  // @IsString()
  // @IsNotEmpty()
  // username: string;

  // @ApiProperty({
  //   description: "Telegram ID of the merchant",
  //   required: true,
  // })
  // @IsString()
  // @IsNotEmpty()
  // telegramId: string;

  // @ApiProperty({
  //   description: "ID of the merchant group to assign to",
  //   example: 1,
  //   type: Number,
  //   required: true,
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // groupId: number;

  // @ApiProperty({
  //   description: "Whether the merchant account is active",
  //   default: true,
  //   type: Boolean,
  //   required: true,
  // })
  // @IsEnum(MerchantStatus)
  // @IsNotEmpty()
  // status: MerchantStatus;

  // // Fee information

  // @ApiProperty({
  //   description: "Deposit fee",
  //   example: 1000000,
  //   type: Number,
  //   default: 0,
  //   required: true,
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // depositFee: number;

  // @ApiProperty({
  //   description: "Deposit fee percentage (0.00 - 100.00)",
  //   example: 0.1,
  //   type: Number,
  //   default: 0.0,
  //   required: true,
  // })
  // @IsNumber()
  // @IsDecimal({ decimal_digits: "2" })
  // @Min(0.0)
  // @Max(100.0)
  // @IsNotEmpty()
  // depositFeeRate: number;

  // @ApiProperty({
  //   description: "Remittance fee",
  //   example: 1000000,
  //   type: Number,
  //   default: 0,
  //   required: true,
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // remittanceFee: number;

  // @ApiProperty({
  //   description: "Remittance fee percentage (0.00 - 100.00)",
  //   example: 0.1,
  //   type: Number,
  //   default: 0.0,
  //   required: true,
  // })
  // @IsNumber()
  // @IsDecimal({ decimal_digits: "2" })
  // @Min(0.0)
  // @Max(100.0)
  // @IsNotEmpty()
  // remittanceFeeRate: number;

  // // Settlement information

  // @ApiProperty({
  //   description: "Settlement fee",
  //   example: 1000000,
  //   type: Number,
  //   default: 0,
  //   required: true,
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // settlementFee: number;

  // @ApiProperty({
  //   description: "Settlement fee percentage (0.00 - 100.00)",
  //   example: 0.1,
  //   type: Number,
  //   default: 0.0,
  //   required: true,
  // })
  // @IsNumber()
  // @Min(0)
  // @Max(100)
  // @IsNotEmpty()
  // settlementFeeRate: number;

  // @ApiProperty({
  //   description: "Foreign currency fee rate (0.00 - 100.00)",
  //   example: 0.1,
  //   type: Number,
  //   default: 0.0,
  //   required: true,
  // })
  // @Type(() => Number)
  // @IsDecimal({ decimal_digits: "2" })
  // @Min(0.0)
  // @Max(100.0)
  // @IsNotEmpty()
  // foreignCurrencyFeeRate: number;

  // @ApiProperty({
  //   description: "Foreign currency remittance fee percentage (0.00 - 100.00)",
  //   example: 0.1,
  //   type: Number,
  //   default: 0.0,
  //   required: true,
  // })
  // @IsNumber()
  // @IsDecimal({ decimal_digits: "2" })
  // @Min(0.0)
  // @Max(100.0)
  // @IsNotEmpty()
  // foreignCurrencyRemittanceFeeRate: number;

  // @ApiProperty({
  //   description: "Foreign currency remittance fee amount",
  //   example: 1000000,
  //   type: Number,
  //   default: 0,
  //   required: true,
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // foreignRemittanceFee: number;

  // @ApiProperty({
  //   description: "Reserve amount",
  //   example: 1000000,
  //   type: Number,
  //   default: 0,
  //   required: true,
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // reserveAmount: number;

  // @ApiProperty({
  //   description: "Reserve rate percentage (0.00 - 100.00)",
  //   example: 0.1,
  //   type: Number,
  //   default: 0.0,
  //   required: true,
  // })
  // @Type(() => Number)
  // @IsDecimal({ decimal_digits: "2" })
  // @Min(0.0)
  // @Max(100.0)
  // @IsNotEmpty()
  // reserveRate: number;

  // // Foreign bank details
  // @ApiProperty({
  //   description: "Foreign bank name",
  //   example: "ABC Bank",
  //   required: false,
  // })
  // @IsString()
  // @IsOptional()
  // foreignBankName?: string;

  // @ApiProperty({
  //   description: "Foreign bank account number",
  //   example: "1234567890",
  //   required: false,
  // })
  // @IsString()
  // @IsOptional()
  // foreignBankAccountNumber?: string;

  // @ApiProperty({
  //   description: "Foreign bank account holder name",
  //   example: "John Doe",
  //   required: false,
  // })
  // @IsString()
  // @IsOptional()
  // foreignBankAccountHolder?: string;

  // Primary bank details
  @ApiProperty({
    description: "Primary bank code",
    example: "001",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  primaryBankCode: string;

  @ApiProperty({
    description: "Bank account number",
    example: "1234567890",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  primaryBankAccountNumber: string;

  // Agent information
  @ApiProperty({
    description: "List of agents with distribution rates",
    type: [AgentDistributionDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgentDistributionDto)
  agents?: AgentDistributionDto[];

  // // Virtual account settings
  // @ApiProperty({
  //   description: "Virtual account limit",
  //   example: 100,
  //   type: Number,
  //   default: 0,
  //   required: true,
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // virtualAccountLimit: number;

  // @ApiProperty({
  //   description: "Virtual account deposit limit",
  //   example: 1000000,
  //   type: Number,
  //   default: 0,
  //   required: true,
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // virtualAccountDepositLimit: number;

  // Withdrawal limits

  // @ApiProperty({
  //   description: "Maximum withdrawal amount Per transaction",
  //   example: 100000000,
  //   type: Number,
  //   default: 0,
  //   required: true,
  // })
  // @IsNumber()
  // @Min(0)
  // @IsNotEmpty()
  // maxWithdrawalAmount: number;

  // @ApiProperty({
  //   description: "Minimum withdrawal amount",
  //   example: 1000000,
  //   type: Number,
  //   default: 0,
  //   required: true,
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // dailyWithdrawalLimit: number;

  // @ApiPropertyOptional({
  //   description: "Callback IP address",
  //   example: "127.0.0.1",
  // })
  // @IsString()
  // @IsIP()
  // @IsOptional()
  // callbackIpAddress?: string;

  // @ApiPropertyOptional({
  //   description: "API key for merchant integration",
  //   example: "aa80cdda-5498-44fb-afd0-660f8b59d9ef",
  // })
  // @IsString()
  // @IsOptional()
  // apiKey?: string;
}
