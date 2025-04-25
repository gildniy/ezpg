import { ApiProperty } from "@nestjs/swagger";

export class AgentBalanceLogDto {
  @ApiProperty({ description: "Log ID", example: 8743 })
  log_id: number;

  @ApiProperty({
    description: "Agent ID (8-character string)",
    example: "AGENT123",
  })
  agent_id: string;

  @ApiProperty({ description: "Agent name", example: "Seoul Agent 1" })
  agent_name: string;

  @ApiProperty({ description: "Previous balance amount", example: "1000000" })
  previous_balance: string;

  @ApiProperty({ description: "New balance amount", example: "1500000" })
  new_balance: string;

  @ApiProperty({ description: "Amount changed", example: "500000" })
  amount: string;

  @ApiProperty({ description: "Reason for balance change", example: "DEPOSIT" })
  reason: string;

  @ApiProperty({ description: "Admin user ID who made the change", example: 1 })
  created_by: string;

  @ApiProperty({ description: "Admin username", example: "admin_user" })
  created_by_username: string;

  @ApiProperty({
    description: "Change timestamp",
    example: "2023-07-10T09:45:00Z",
  })
  created_at: Date;
}

export class PaginatedAgentBalanceLogResponseDto {
  @ApiProperty({
    description: "Array of agent balance logs",
    type: [AgentBalanceLogDto],
    isArray: true,
  })
  data: AgentBalanceLogDto[];

  @ApiProperty({
    description: "Total number of logs matching the query",
    example: 78,
  })
  totalItems: number;

  @ApiProperty({ description: "Total number of pages", example: 8 })
  totalPages: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  currentPage: number;
}
