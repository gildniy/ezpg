import { ApiProperty } from "@nestjs/swagger";

export class AgentWithdrawalStatsDto {
  @ApiProperty({
    description:
      "Total number of agent withdrawals matching the filter criteria",
    example: 3,
  })
  totalCount: number;

  @ApiProperty({
    description: "Total agent withdrawal amount",
    example: 1402630,
  })
  totalAmount: number;

  @ApiProperty({
    description: "Formatted display text in Korean",
    example: "총: 3건, 회원 출금액: 1,402,630원",
  })
  displayText?: string;

  constructor(data: Partial<AgentWithdrawalStatsDto>) {
    Object.assign(this, data);
  }
}
