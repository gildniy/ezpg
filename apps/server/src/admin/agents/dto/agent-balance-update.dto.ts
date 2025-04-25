import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

/**
 * Enum for balance operation types
 */
export enum BalanceOperationType {
  DEPOSIT = "DEPOSIT", // Add funds to agent balance
  WITHDRAW = "WITHDRAW", // Remove funds from agent balance
  ADJUST = "ADJUST", // Adjust balance (administrative action)
}

/**
 * Data Transfer Object for updating agent balance
 * Used for deposit, withdrawal or adjustment operations
 */
export class AgentBalanceUpdateDto {
  @ApiProperty({
    description:
      "Amount to deposit/withdraw/adjust (positive for deposit, negative for withdraw)",
    example: 100000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: "Type of balance operation",
    enum: BalanceOperationType,
    example: BalanceOperationType.DEPOSIT,
  })
  @IsEnum(BalanceOperationType)
  operationType: BalanceOperationType;

  @ApiProperty({
    description: "Reason for the balance update",
    example: "Monthly deposit for operational expenses",
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
