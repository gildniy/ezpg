import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { IsOptional, IsString, Length } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AdminCustomerQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Filter by specific merchant ID (VARCHAR 8)",
    example: "sticpay",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(4, 8)
  merchantId?: string;
}
