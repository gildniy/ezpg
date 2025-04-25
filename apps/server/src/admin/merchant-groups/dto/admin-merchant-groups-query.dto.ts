import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsInt,
  IsOptional,
  Max,
  Min,
  IsString,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";

export class AdminMerchantGroupsQueryDto {
  @ApiPropertyOptional({
    description: "Page number (1-based)",
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Skip specified number of items (alternative to page)",
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  @ApiPropertyOptional({
    description: "Search term for group name",
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: "Include deleted groups in the results",
    default: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean = false;

  @ApiPropertyOptional({
    description: "Show only deleted groups",
    default: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  onlyDeleted?: boolean = false;

  @ApiPropertyOptional({
    description: "View as specific admin ID (super admin only)",
  })
  @IsString()
  @IsOptional()
  viewAsAdminId?: string;
}
