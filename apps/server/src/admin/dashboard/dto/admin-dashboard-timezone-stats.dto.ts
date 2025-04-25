import { ApiProperty } from "@nestjs/swagger";

export class AdminDashboardTimezoneStatItem {
  @ApiProperty({
    description: "Hour of the day (0-23)",
    example: 14,
  })
  hour: number;

  @ApiProperty({
    description: "Deposit count for this hour",
    example: 25,
  })
  depositCount: number;

  @ApiProperty({
    description: "Deposit amount for this hour",
    example: 2500000,
  })
  depositAmount: number;

  @ApiProperty({
    description: "Withdrawal count for this hour",
    example: 15,
  })
  withdrawalCount: number;

  @ApiProperty({
    description: "Withdrawal amount for this hour",
    example: 1500000,
  })
  withdrawalAmount: number;
}

export class AdminDashboardTimezoneStatsDto {
  @ApiProperty({
    description: "Hourly transaction statistics",
    type: AdminDashboardTimezoneStatItem,
    isArray: true,
  })
  hourlyStats: AdminDashboardTimezoneStatItem[];
}
