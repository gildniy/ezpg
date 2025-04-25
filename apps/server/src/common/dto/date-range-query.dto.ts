import { IsDateString, IsOptional } from "class-validator";
import { PaginationQueryDto } from "./pagination-query.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class DateRangeQueryDto extends PaginationQueryDto {
  // Inherit pagination

  @ApiPropertyOptional({
    description:
      "Date for filtering (YYYY-MM-DD). Defaults to today if not provided.",
    example: "2024-04-23",
    type: String,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: "startDate must be a valid date string (YYYY-MM-DD)" },
  )
  startDate?: string;

  @ApiPropertyOptional({
    description:
      "End date for filtering (YYYY-MM-DD). Defaults to today if not provided.",
    example: "2024-04-23",
    type: String,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: "endDate must be a valid date string (YYYY-MM-DD)" },
  )
  endDate?: string; // Expect YYYY-MM-DD format
}
