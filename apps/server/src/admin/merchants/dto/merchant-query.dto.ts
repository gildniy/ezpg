import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { SortOrderEnum } from "../../../common/enums/sort-order.enum";

/**
 * Data transfer object for filtering and paginating merchant listings
 * Used to customize merchant listing requests
 */
export class AdminMerchantsQueryDto extends PaginationQueryDto {
  /**
   * Page number for pagination
   * Default is 1 if not specified
   */
  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  /**
   * Number of items per page
   * Default is 10 if not specified
   */
  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  /**
   * Search term for merchant attributes
   * Searches across affiliate, company name, telegram ID, and merchant ID
   */
  @ApiPropertyOptional({
    description:
      "Search term for affiliate, company name, telegram ID, or merchant ID",
    example: "company",
  })
  @IsString()
  @IsOptional()
  search?: string;

  /**
   * Field to sort by
   */
  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "createdAt",
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  /**
   * Sort order (ascending or descending)
   */
  @ApiPropertyOptional({
    description: "Sort order",
    enum: SortOrderEnum,
    enumName: "SortOrderEnum",
    example: SortOrderEnum.ASC,
  })
  @IsIn(Object.values(SortOrderEnum))
  @IsOptional()
  sortOrder?: SortOrderEnum;

  /**
   * Filter merchants by active status
   * When provided, filters merchants with active/inactive user accounts
   */
  @ApiPropertyOptional({
    description: "Filter by account active status",
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  /**
   * Filter by merchant group ID
   * Shows only merchants in the specified group
   */
  @ApiPropertyOptional({
    description: "Filter by merchant group ID",
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  groupId?: number;

  /**
   * Include deleted merchants in the results
   * Default is false (exclude deleted merchants)
   */
  @ApiPropertyOptional({
    description: "Include deleted merchants in the results",
    example: false,
    default: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean = false;
}
