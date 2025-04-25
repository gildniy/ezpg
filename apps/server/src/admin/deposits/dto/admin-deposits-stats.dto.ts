import { ApiProperty } from "@nestjs/swagger";

export class AdminDepositsStatsDto {
  @ApiProperty({
    description: "Total number of deposits",
    example: 250,
  })
  totalDepositCount: number;

  @ApiProperty({
    description: "Total amount of deposits",
    example: 25000000,
  })
  totalDepositAmount: number;

  @ApiProperty({
    description: "Total company fee amount",
    example: 1250000,
  })
  totalCompanyFee: number;

  @ApiProperty({
    description: "Total agent fee amount",
    example: 1250000,
  })
  totalAgentFee: number;
}
