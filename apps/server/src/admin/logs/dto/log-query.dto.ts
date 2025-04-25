import { IsOptional, IsString } from "class-validator";
import { DateRangeQueryDto } from "../../../common/dto/date-range-query.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AdminLogQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional({
    description: "Filter logs by admin user ID",
    type: String,
    example: "1",
  })
  @IsOptional()
  @IsString()
  userId?: string; // Filter by admin user ID as string
}

export class AgentBalanceLogQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional({
    description: "Filter logs by agent ID (8-character string)",
    type: String,
    example: "AGENT123",
  })
  @IsOptional()
  @IsString()
  agentId?: string; // Filter by agent ID
}

export class MerchantBalanceLogQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional({
    description: "Filter logs by merchant ID",
    type: String,
    example: "MERCHANT123",
  })
  @IsOptional()
  @IsString()
  merchantId?: string; // Filter by merchant ID
}
