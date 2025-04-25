import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { DateRangeQueryDto } from "../../../common/dto/date-range-query.dto";
import { WithdrawalStatus } from "@ezpg/database";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { SortOrderEnum } from "../../../common/enums/sort-order.enum";
import { SearchCriteriaType } from "../../../common/enums/search-criteria-type.enum";
import { WithdrawalOrderByFieldValues } from "../../../common/swagger/swagger-enums";

export class BaseWithdrawalQueryDto extends DateRangeQueryDto {
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
    enum: SearchCriteriaType,
    description:
      "Date criteria to search by (requested date, processed date, or account date)",
    example: SearchCriteriaType.REQUESTED_DATE,
    enumName: "SearchCriteriaType",
  })
  @IsOptional()
  @IsEnum(SearchCriteriaType)
  dateCriteria?: SearchCriteriaType = SearchCriteriaType.REQUESTED_DATE;

  @ApiPropertyOptional({
    description: "Selected date for single-day filtering (YYYY-MM-DD)",
    example: "2023-05-20",
  })
  @IsOptional()
  @IsDateString()
  selectedDate?: string;

  @ApiPropertyOptional({
    description: "Order by field",
    example: "requestedAt",
    enum: WithdrawalOrderByFieldValues,
    enumName: "WithdrawalOrderByField",
  })
  @IsOptional()
  @IsString()
  orderByField?: string = "requestedAt";

  @ApiPropertyOptional({
    description: "Order direction",
    example: SortOrderEnum.DESC,
    enum: SortOrderEnum,
    enumName: "SortOrderEnum",
  })
  @IsOptional()
  @IsIn(Object.values(SortOrderEnum))
  orderDirection?: SortOrderEnum = SortOrderEnum.DESC;

  @ApiPropertyOptional({
    description: "Page number (1-based)",
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Items per page",
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number = 10;
}
