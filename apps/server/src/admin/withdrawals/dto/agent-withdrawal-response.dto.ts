import { ApiProperty } from "@nestjs/swagger";
import { WithdrawalStatus } from "@ezpg/database";
import { PaginatedResponse } from "../../../common/dto/paginated-response.dto";

export class AgentWithdrawalResponseDto {
  @ApiProperty({ example: "12345" })
  withdrawalId: string;

  @ApiProperty({ example: "2023-05-01T15:30:00Z" })
  requestedAt: Date;

  @ApiProperty({ example: "agent1" })
  agentId: string;

  @ApiProperty({ example: "Agent Name" })
  agentName: string;

  @ApiProperty({ example: "John Doe" })
  accountHolder: string;

  @ApiProperty({ example: "Bank Name" })
  bank: string;

  @ApiProperty({ example: "1234567890" })
  accountNumber: string;

  @ApiProperty({ example: 100000 })
  amount: number;

  @ApiProperty({
    enum: WithdrawalStatus,
    example: WithdrawalStatus.PENDING,
    enumName: "WithdrawalStatus",
  })
  status: WithdrawalStatus;

  @ApiProperty({ example: "2023-05-02T10:15:00Z", nullable: true })
  processedAt: Date | null;

  @ApiProperty({ example: true, nullable: true })
  approved: boolean | null;
}

// Extend from the base PaginatedResponse class
export class PaginatedAgentWithdrawalsResponseDto extends PaginatedResponse<AgentWithdrawalResponseDto> {
  @ApiProperty({ type: [AgentWithdrawalResponseDto] })
  declare data: AgentWithdrawalResponseDto[];

  @ApiProperty({ type: [AgentWithdrawalResponseDto] })
  declare items: AgentWithdrawalResponseDto[];
}
