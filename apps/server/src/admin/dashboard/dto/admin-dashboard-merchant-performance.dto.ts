import { ApiProperty } from "@nestjs/swagger";

export class AdminDashboardMerchantPerformanceItem {
  @ApiProperty({
    description: "Merchant ID",
    example: "MERCH001",
    required: true,
  })
  merchantId: string;

  @ApiProperty({
    description: "Merchant name",
    example: "Premium Casino",
    required: true,
  })
  merchantName: string;

  @ApiProperty({
    description: "Total deposit amount for this merchant",
    example: 5000000,
    required: true,
  })
  totalDepositAmount: number;

  @ApiProperty({
    description: "Total deposit count for this merchant",
    example: 50,
    required: true,
  })
  depositCount: number;

  @ApiProperty({
    description: "Average deposit amount for this merchant",
    example: 100000,
    required: true,
  })
  averageDepositAmount: number;

  @ApiProperty({
    description: "Total withdrawal amount for this merchant",
    example: 4500000,
    required: true,
  })
  totalWithdrawalAmount: number;

  @ApiProperty({
    description: "Total withdrawal count for this merchant",
    example: 45,
    required: true,
  })
  withdrawalCount: number;

  @ApiProperty({
    description: "Average withdrawal amount for this merchant",
    example: 100000,
    required: true,
  })
  averageWithdrawalAmount: number;

  @ApiProperty({
    description: "Net balance for this merchant (deposits - withdrawals)",
    example: 500000,
    required: true,
  })
  netBalance: number;
}

export class AdminDashboardMerchantPerformanceDto {
  @ApiProperty({
    description: "Start date of the performance data",
    example: "2023-06-01",
    required: true,
  })
  startDate: string;

  @ApiProperty({
    description: "End date of the performance data",
    example: "2023-06-30",
    required: true,
  })
  endDate: string;

  @ApiProperty({
    description: "Array of merchant performance data",
    type: AdminDashboardMerchantPerformanceItem,
    isArray: true,
    required: true,
  })
  merchants: AdminDashboardMerchantPerformanceItem[];
}
