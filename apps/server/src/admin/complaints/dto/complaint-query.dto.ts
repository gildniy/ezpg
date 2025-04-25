import { IsEnum, IsInt, IsOptional, IsPositive } from "class-validator";
import { DateRangeQueryDto } from "../../../common/dto/date-range-query.dto";
import { ComplaintStatus } from "@ezpg/database";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class ComplaintQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional({
    enum: ComplaintStatus,
    description: "Filter by complaint status",
    example: ComplaintStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @ApiPropertyOptional({
    description: "Filter by internal merchant ID",
    example: 1234567890,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  merchantInternalId?: number;
}
