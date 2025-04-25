import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { BaseWithdrawalQueryDto } from "./base-withdrawal-query.dto";
import { AgentSearchType } from "../../../common/enums/agent-search-type.enum";

export class AgentWithdrawalQueryDto extends BaseWithdrawalQueryDto {
  @ApiPropertyOptional({
    description: "Filter by specific agent ID",
    example: "agent1",
  })
  @IsOptional()
  @IsString()
  agentId?: string;

  @ApiPropertyOptional({
    enum: AgentSearchType,
    description: "Agent search type",
    example: AgentSearchType.USERNAME,
    enumName: "AgentSearchType",
  })
  @IsOptional()
  @IsEnum(AgentSearchType)
  searchType?: AgentSearchType;

  @ApiPropertyOptional({
    description: "Search value",
    example: "agentUser",
  })
  @IsOptional()
  @IsString()
  searchValue?: string;
}
