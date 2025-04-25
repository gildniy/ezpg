import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { DepositFormatType } from "../../../common/enums/deposit-format-type.enum";
import { DepositStatusType } from "../../../common/enums/deposit-status-type.enum";

export class AdminDepositsItemDto {
  @ApiProperty({
    description:
      "Unique deposit ID (transaction_date|van_id|van_transaction_id)",
    example: "20230101|0|1234567890",
  })
  @IsString()
  id!: string;

  @ApiProperty({ description: "VAN transaction ID", example: "1234567890" })
  @IsString()
  transactionId!: string;

  @ApiProperty({
    description: "Deposit date and time",
    example: "2023-01-01T12:34:56.000Z",
  })
  @IsString()
  depositDateTime!: string;

  @ApiProperty({ description: "Merchant ID", example: "MERCH001" })
  @IsString()
  merchantId!: string;

  @ApiProperty({ description: "Merchant name", example: "Example Merchant" })
  @IsString()
  merchantName!: string;

  @ApiProperty({
    description: "Merchant's user account username",
    example: "merchant123",
  })
  @IsString()
  merchantUsername!: string;

  @ApiProperty({
    description: "Admin username who created the merchant",
    example: "admin1",
  })
  @IsString()
  adminUsername!: string;

  @ApiProperty({ description: "User ID", example: "user123" })
  @IsString()
  userId!: string;

  @ApiProperty({ description: "Deposit bank code", example: "001" })
  @IsString()
  depositBank!: string;

  @ApiProperty({
    description: "Virtual account number",
    example: "1234567890123456",
  })
  @IsString()
  virtualAccount!: string;

  @ApiProperty({
    description: "Transaction format (STATIC/DYNAMIC)",
    enum: DepositFormatType,
    example: DepositFormatType.STATIC,
    enumName: "DepositFormatType",
  })
  @IsString()
  @IsEnum(DepositFormatType)
  format!: string;

  @ApiProperty({
    description: "Transaction status (DEPOSIT/CANCEL)",
    enum: DepositStatusType,
    example: DepositStatusType.DEPOSIT,
    enumName: "DepositStatusType",
  })
  @IsString()
  @IsEnum(DepositStatusType)
  status!: string;

  @ApiProperty({ description: "Name of the depositor", example: "John Doe" })
  @IsString()
  depositorName!: string;

  @ApiProperty({ description: "Deposit amount", example: 100000 })
  @IsNumber()
  depositAmount!: number;

  @ApiProperty({ description: "Settlement amount after fees", example: 96000 })
  @IsNumber()
  settlementAmount!: number;

  @ApiProperty({ description: "Company fee amount", example: 2000 })
  @IsNumber()
  companyFee!: number;

  @ApiProperty({ description: "Agent fee amount", example: 2000 })
  @IsNumber()
  agentFee!: number;
}
