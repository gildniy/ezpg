import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { DepositSearchFieldEnum } from "../../../common/enums/deposit-search-field.enum";
import { DepositFormatType } from "../../../common/enums/deposit-format-type.enum";
import { DepositStatusType } from "../../../common/enums/deposit-status-type.enum";

/**
 * Data transfer object for filtering deposit transactions
 * Used to customize deposit listing and export requests
 */
export class AdminDepositsFilterDto {
  /**
   * General search term for backward compatibility
   * @deprecated Use searchField and searchValue instead
   */
  @ApiProperty({
    description: "Search term",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Specific field to search on (transaction ID, depositor, etc.)
   * Used in conjunction with searchValue
   */
  @ApiProperty({
    description: "Search field to apply the search term",
    enum: DepositSearchFieldEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(DepositSearchFieldEnum)
  searchField?: DepositSearchFieldEnum;

  /**
   * Value to search for in the specified searchField
   */
  @ApiProperty({
    description: "Search value to use with searchField",
    required: false,
  })
  @IsOptional()
  @IsString()
  searchValue?: string;

  /**
   * Filter deposits by merchant ID
   * Shows only deposits for the specified merchant
   */
  @ApiProperty({
    description: "Filter by merchant ID",
    required: false,
  })
  @IsOptional()
  @IsString()
  merchantId?: string;

  /**
   * Filter deposits by merchant group ID
   * Shows deposits for all merchants in the specified group
   */
  @ApiProperty({
    description: "Filter by merchant group ID",
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  groupId?: number;

  /**
   * Filter deposits by admin ID (SuperAdmin only)
   * Shows deposits for merchants created by the specified admin
   */
  @ApiProperty({
    description: "Filter by admin ID",
    required: false,
  })
  @IsOptional()
  @IsString()
  adminId?: string;

  /**
   * Filter deposits by bank code
   */
  @ApiProperty({
    description: "Filter by deposit bank code",
    required: false,
  })
  @IsOptional()
  @IsString()
  depositBank?: string;

  /**
   * Filter deposits by virtual account number
   */
  @ApiProperty({
    description: "Filter by virtual account",
    required: false,
  })
  @IsOptional()
  @IsString()
  virtualAccount?: string;

  /**
   * Filter deposits by format type (e.g., format of display or export)
   */
  @ApiProperty({
    description: "Filter by format type",
    enum: DepositFormatType,
    required: false,
    enumName: "DepositFormatType",
  })
  @IsOptional()
  @IsEnum(DepositFormatType)
  format?: DepositFormatType;

  /**
   * Filter deposits by status (DEPOSIT or CANCEL)
   */
  @ApiProperty({
    description: "Filter by status",
    enum: DepositStatusType,
    required: false,
    enumName: "DepositStatusType",
  })
  @IsOptional()
  @IsEnum(DepositStatusType)
  status?: DepositStatusType;

  /**
   * Filter deposits by minimum amount
   * Shows only deposits with amount greater than or equal to this value
   */
  @ApiProperty({
    description: "Minimum deposit amount",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minAmount?: number;

  /**
   * Filter deposits by maximum amount
   * Shows only deposits with amount less than or equal to this value
   */
  @ApiProperty({
    description: "Maximum deposit amount",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxAmount?: number;

  /**
   * End date for date range filter in YYYY-MM-DD format
   * Shows deposits on or before this date
   * Defaults to today's date if not provided
   */
  @ApiProperty({
    description:
      "End date for date range filter (YYYY-MM-DD). Defaults to today if not provided.",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  /**
   * Page number for pagination (1-based indexing)
   * @default 1
   */
  @ApiProperty({
    description: "Page number (1-based)",
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  /**
   * Number of items per page
   * @default 10
   * @maximum 100
   */
  @ApiProperty({
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
