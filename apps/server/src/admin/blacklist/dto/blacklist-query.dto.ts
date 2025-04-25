import { IsEnum, IsOptional } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { BlacklistType } from "@ezpg/database";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class BlacklistQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: BlacklistType,
    example: BlacklistType.USER_ID,
    description: "Filter by blacklist type",
    required: false,
  })
  @IsOptional()
  @IsEnum(BlacklistType)
  type?: BlacklistType;

  // Search will likely target the 'value' field
}
