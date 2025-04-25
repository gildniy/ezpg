import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { LogSeverity } from "@ezpg/database";

export class LogsQueryDto {
  @ApiProperty({ required: false, description: "Page number" })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, description: "Items per page" })
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ required: false, description: "Log severity filter" })
  @IsOptional()
  @IsEnum(LogSeverity)
  severity?: LogSeverity;

  @ApiProperty({ required: false, description: "Search term" })
  @IsOptional()
  @IsString()
  search?: string;
}
