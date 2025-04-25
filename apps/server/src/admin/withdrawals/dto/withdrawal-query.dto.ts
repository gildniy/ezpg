import { IsEnum, IsOptional, IsString } from "class-validator";
import { DateRangeQueryDto } from "../../../common/dto/date-range-query.dto";
import { EntityType, WithdrawalStatus } from "@ezpg/database";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AdminWithdrawalQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional({
    enum: WithdrawalStatus,
    description: "Filter withdrawals by status",
    example: WithdrawalStatus.PENDING,
    enumName: "WithdrawalStatus",
  })
  @IsOptional()
  @IsEnum(WithdrawalStatus)
  status?: WithdrawalStatus;

  @ApiPropertyOptional({
    enum: EntityType,
    description: "Filter by entity type (MERCHANT or AGENT)",
    example: EntityType.MERCHANT,
  })
  @IsOptional()
  @IsEnum(EntityType) // Filter by MERCHANT or AGENT
  entityType?: EntityType;

  @ApiPropertyOptional({
    description: "Filter by specific merchant ID (VARCHAR 8)",
    example: "merchant1",
    maxLength: 8,
  })
  @IsOptional()
  @IsString()
  merchantId?: string; // VARCHAR(8)

  @ApiPropertyOptional({
    description: "Filter by specific agent ID",
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsString()
  agentId?: string; // Internal Agent ID
}
