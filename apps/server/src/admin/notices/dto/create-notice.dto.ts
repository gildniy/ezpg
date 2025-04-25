import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { NoticeStatus, NoticeType } from "@ezpg/database";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateNoticeDto {
  @ApiProperty({
    description: "Title of the notice",
    example: "System Maintenance Notification",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: "Content of the notice",
    example:
      "The system will be under maintenance on July 1st from 2AM to 4AM.",
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    enum: NoticeType,
    description: "Type of the notice",
    default: NoticeType.NOTICE,
    example: NoticeType.NOTICE,
  })
  @IsOptional()
  @IsEnum(NoticeType)
  type?: NoticeType = NoticeType.NOTICE;

  @ApiPropertyOptional({
    enum: NoticeStatus,
    description: "Publication status of the notice",
    default: NoticeStatus.PUBLISHED,
    example: NoticeStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(NoticeStatus)
  status?: NoticeStatus = NoticeStatus.PUBLISHED;
}
