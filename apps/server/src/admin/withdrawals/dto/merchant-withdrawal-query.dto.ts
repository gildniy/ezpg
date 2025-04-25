import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { BaseWithdrawalQueryDto } from "./base-withdrawal-query.dto";
import { MerchantSearchType } from "../../../common/enums/merchant-search-type.enum";

export class MerchantWithdrawalQueryDto extends BaseWithdrawalQueryDto {
  @ApiPropertyOptional({
    description: "Filter by specific merchant ID",
    example: "merchant1",
  })
  @IsOptional()
  @IsString()
  merchantId?: string;

  @ApiPropertyOptional({
    enum: MerchantSearchType,
    description: "Merchant search type",
    example: MerchantSearchType.AFFILIATE,
    enumName: "MerchantSearchType",
  })
  @IsOptional()
  @IsEnum(MerchantSearchType)
  searchType?: MerchantSearchType;

  @ApiPropertyOptional({
    description: "Search value",
    example: "Test Affiliate",
  })
  @IsOptional()
  @IsString()
  searchValue?: string;
}
