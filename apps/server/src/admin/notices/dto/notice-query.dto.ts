import { IsEnum, IsOptional } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { NoticeStatus, NoticeType } from "@ezpg/database";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class NoticeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: NoticeType,
    description: "Filter notices by type",
    example: NoticeType.NOTICE,
  })
  @IsOptional()
  @IsEnum(NoticeType)
  type?: NoticeType;

  @ApiPropertyOptional({
    enum: NoticeStatus,
    description: "Filter notices by publication status",
    example: NoticeStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(NoticeStatus)
  status?: NoticeStatus;
}
