import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { BaseQueryDto } from "../../../common/dto/base-query.dto";
import { AgentStatus } from "./agent-status.enum";

/**
 * Data Transfer Object for querying active agents with filtering and pagination
 * Extends BaseQueryDto to inherit pagination and sorting functionality
 */
export class AgentQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Search term for agent username or name",
    example: "john",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by agent status",
    enum: AgentStatus,
  })
  @IsOptional()
  @IsEnum(AgentStatus)
  status?: AgentStatus;

  @ApiPropertyOptional({
    description: "Filter by merchant ID",
    example: "merchant1",
  })
  @IsOptional()
  @IsString()
  merchantId?: string;
}
