import { ApiProperty } from "@nestjs/swagger";
import { TimePeriod } from "@ezpg/types";

export class AdminDashboardTransactionTrendItem {
  @ApiProperty({
    description: "Date or time period for this data point",
    example: "2023-06-20",
  })
  label: string;

  @ApiProperty({
    description: "Total deposit amount for this period",
    example: 5000000,
  })
  depositAmount: number;

  @ApiProperty({
    description: "Total deposit count for this period",
    example: 50,
  })
  depositCount: number;

  @ApiProperty({
    description: "Total withdrawal amount for this period",
    example: 4500000,
  })
  withdrawalAmount: number;

  @ApiProperty({
    description: "Total withdrawal count for this period",
    example: 45,
  })
  withdrawalCount: number;

  @ApiProperty({
    description: "Net balance for this period (deposits - withdrawals)",
    example: 500000,
  })
  netBalance: number;
}

export class AdminDashboardTransactionTrendsDto {
  @ApiProperty({
    description: "Time period for the trend data",
    enum: TimePeriod,
    example: TimePeriod.DAILY,
    enumName: "TimePeriod",
  })
  period: TimePeriod;

  @ApiProperty({
    description: "Start date of the trend data",
    example: "2023-06-01",
  })
  startDate: string;

  @ApiProperty({
    description: "End date of the trend data",
    example: "2023-06-30",
  })
  endDate: string;

  @ApiProperty({
    description: "Array of transaction trend data points",
    type: AdminDashboardTransactionTrendItem,
    isArray: true,
  })
  trends: AdminDashboardTransactionTrendItem[];
}
