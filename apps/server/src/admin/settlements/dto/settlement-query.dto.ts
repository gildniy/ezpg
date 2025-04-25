import { DateRangeQueryDto } from "../../../common/dto/date-range-query.dto";
import { IsOptional, IsString, Length } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AdminSettlementQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional({
    description: "Filter by merchant ID (VARCHAR 8)",
    example: "sticpay",
  })
  @IsOptional()
  @IsString()
  @Length(4, 8)
  merchantId?: string;
}
