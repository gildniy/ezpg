import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { WithdrawalMethod, WithdrawalStatus } from "@ezpg/database";

export class UpdateAgentWithdrawalDto {
  @ApiProperty({
    enum: WithdrawalStatus,
    description: "New status for the withdrawal",
    example: WithdrawalStatus.COMPLETED,
    enumName: "WithdrawalStatus",
  })
  @IsEnum(WithdrawalStatus)
  status: WithdrawalStatus;

  @ApiProperty({
    description: "Approval flag",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  approved?: boolean;

  @ApiProperty({
    enum: WithdrawalMethod,
    description: "Withdrawal method",
    example: WithdrawalMethod.KRW_WITHDRAWAL,
    required: false,
    enumName: "WithdrawalMethod",
  })
  @IsOptional()
  @IsEnum(WithdrawalMethod)
  withdrawalMethod?: WithdrawalMethod;

  @ApiProperty({
    description: "Additional notes",
    example: "Approved by admin",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
