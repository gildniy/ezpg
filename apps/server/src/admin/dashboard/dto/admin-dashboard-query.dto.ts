import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { TimePeriod } from "@ezpg/types";

/**
 * Data transfer object for dashboard query parameters
 * Used to filter and customize dashboard data requests
 */
export class AdminDashboardQueryDto {
  /**
   * Date for retrieving dashboard data
   * When provided, only data before or on this date will be included
   * Defaults to today's date if not provided
   */
  @ApiPropertyOptional({
    description:
      "Date for the dashboard query (defaults to today if not provided)",
    example: "2024-01-31",
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  /**
   * Time period granularity for dashboard metrics
   * Determines whether data is aggregated by day, week, month, etc.
   */
  @ApiProperty({
    description: "Time period for dashboard metrics",
    enum: TimePeriod,
    example: "DAILY",
    required: false,
  })
  @IsOptional()
  @IsEnum(TimePeriod)
  period?: TimePeriod;

  /**
   * Filter by merchant ID
   * When provided, only data for this merchant will be included
   */
  @ApiPropertyOptional({
    description: "Filter by merchant ID",
    example: "merchant123",
    required: false,
  })
  @IsOptional()
  @IsString()
  merchantId?: string;

  /**
   * Filter by group ID
   * When provided, only data for this group will be included
   */
  @ApiPropertyOptional({
    description: "Filter by group ID",
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  groupId?: number;

  /**
   * Filter by admin user ID
   * When provided, only data for this admin user will be included
   */
  @ApiPropertyOptional({
    description: "Filter by admin user ID",
    example: 42,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  adminUserId?: number;
}
