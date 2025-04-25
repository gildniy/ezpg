import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger"; // Import Swagger decorators
import { SortOrderEnum } from "../enums/sort-order.enum";

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Page number for pagination",
    default: 1,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    default: 50,
    minimum: 1,
    maximum: 100,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: "Search term for filtering results",
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Field to sort by",
    default: "created_at",
    type: String,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = "created_at";

  @ApiPropertyOptional({
    description: "Sort order",
    default: "DESC",
    enum: SortOrderEnum,
    enumName: "SortOrderEnum",
  })
  @IsOptional()
  @IsIn(Object.values(SortOrderEnum))
  sortOrder?: SortOrderEnum = SortOrderEnum.DESC;

  // skip and orderBy are getters, usually not documented as API properties directly
  get skip(): number {
    const pageNum = Math.max(1, Number(this.page || 1));
    const limitNum = Math.max(1, Number(this.limit || 50));
    return (pageNum - 1) * limitNum;
  }

  get orderBy(): { [key: string]: "asc" | "desc" } {
    const order = {};
    const sortField =
      typeof this.sortBy === "string" && this.sortBy.length > 0
        ? this.sortBy
        : "created_at";
    order[sortField] = (this.sortOrder?.toLowerCase() ?? "desc") as
      | "asc"
      | "desc";
    return order;
  }
}
