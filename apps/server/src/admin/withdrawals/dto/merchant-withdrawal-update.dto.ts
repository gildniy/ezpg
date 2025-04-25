import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { WithdrawalStatus } from "@ezpg/database";

export class UpdateMerchantWithdrawalDto {
  @ApiProperty({
    enum: WithdrawalStatus,
    description: "New status for the withdrawal",
    example: WithdrawalStatus.COMPLETED,
    enumName: "WithdrawalStatus",
  })
  @IsEnum(WithdrawalStatus)
  status: WithdrawalStatus;

  @ApiProperty({
    description: "Withdrawal method (bank transfer, etc.)",
    example: "Bank transfer",
    required: false,
  })
  @IsOptional()
  @IsString()
  withdrawalMethod?: string;

  @ApiProperty({
    description: "Additional notes",
    example: "Processed manually",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
