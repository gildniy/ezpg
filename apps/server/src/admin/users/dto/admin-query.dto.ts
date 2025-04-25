import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { IsBoolean, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AdminQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Filter by admin active status",
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;
}
