import { IsEnum, IsOptional } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { QnaStatus } from "@ezpg/database";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AdminQnaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: QnaStatus,
    description: "Filter QnAs by status",
    example: QnaStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(QnaStatus)
  status?: QnaStatus;
}
