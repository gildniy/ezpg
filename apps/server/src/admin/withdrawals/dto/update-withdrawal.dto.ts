import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { WithdrawalStatus } from "@ezpg/database";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateWithdrawalStatusDto {
  @ApiProperty({
    enum: WithdrawalStatus,
    description: "New status for the withdrawal",
    example: WithdrawalStatus.APPROVED,
    enumName: "WithdrawalStatus",
  })
  @IsNotEmpty()
  @IsEnum(WithdrawalStatus)
  status: WithdrawalStatus; // 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED'

  @ApiPropertyOptional({
    description: "Optional notes about the status change",
    example: "Approved by admin after verification",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
