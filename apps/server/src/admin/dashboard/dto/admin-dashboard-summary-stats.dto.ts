import { ApiProperty } from "@nestjs/swagger";
import { TimePeriod } from "@ezpg/types";

export class AdminDashboardSummaryStatsDto {
  @ApiProperty({
    description: "Total deposit count across all merchants",
    example: 500,
  })
  totalDepositCount: number;

  @ApiProperty({ description: "Deposit change percentage", example: 25 })
  depositChangePercent: number;

  @ApiProperty({ description: "Total withdrawal count", example: 280 })
  totalWithdrawalCount: number;

  @ApiProperty({ description: "Withdrawal change percentage", example: -12 })
  withdrawalChangePercent: number;

  @ApiProperty({ description: "Total merchant count", example: 24 })
  merchantCount: number;

  @ApiProperty({ description: "Merchant count change", example: 2 })
  merchantCountChange: number;

  @ApiProperty({
    description: "Total system balance in millions KRW",
    example: 1.2,
  })
  totalBalance: number;

  @ApiProperty({
    description: "Time period for data",
    enum: TimePeriod,
    example: TimePeriod.DAILY,
    enumName: "TimePeriod",
  })
  period: TimePeriod;
}
