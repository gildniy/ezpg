import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import { BalanceChangeType } from "@ezpg/database";

/**
 * DTO for updating merchant balance
 */
export class UpdateMerchantBalanceDto {
  @ApiProperty({
    description: "Amount to deposit, withdraw, or set as balance",
    example: 1000,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: "Type of balance operation",
    example: BalanceChangeType.ADJUSTMENT_ADD,
    enum: BalanceChangeType,
  })
  @IsEnum(BalanceChangeType)
  @IsNotEmpty()
  operationType: BalanceChangeType;

  @ApiProperty({
    description: "Reason for the balance update",
    example: "Monthly settlement",
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
