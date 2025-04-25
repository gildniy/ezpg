import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { NoticeStatus, NoticeType } from "@ezpg/database";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateNoticeDto {
  @ApiPropertyOptional({
    description: "Updated title of the notice",
    example: "Updated: System Maintenance Notification",
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    description: "Updated content of the notice",
    example:
      "The system maintenance has been rescheduled to July 2nd from 3AM to 5AM.",
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiPropertyOptional({
    enum: NoticeType,
    description: "Updated type of the notice",
    example: NoticeType.NOTICE,
  })
  @IsOptional()
  @IsEnum(NoticeType)
  type?: NoticeType;

  @ApiPropertyOptional({
    enum: NoticeStatus,
    description: "Updated publication status of the notice",
    example: NoticeStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(NoticeStatus)
  status?: NoticeStatus;
}
