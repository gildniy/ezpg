import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Max, Min } from "class-validator";

/**
 * Base DTO for query parameters with pagination and sorting
 * Can be extended by specific query DTOs
 */
export class BaseQueryDto {
  @ApiPropertyOptional({
    description: "Page number (starts from 1)",
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Skip specified number of items (alternative to page)",
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({
    description: 'Order by field and direction (e.g., "createdAt:desc")',
    example: "createdAt:desc",
  })
  @IsOptional()
  orderBy?: Record<string, "asc" | "desc">;
}
