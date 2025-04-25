import { ApiProperty } from "@nestjs/swagger";

export class MerchantWithdrawalStatsDto {
  @ApiProperty({
    description:
      "Total number of merchant withdrawals matching the filter criteria",
    example: 3,
  })
  totalCount: number;

  @ApiProperty({
    description: "Total merchant withdrawal amount",
    example: 1402630,
  })
  totalAmount: number;

  @ApiProperty({
    description: "Formatted display text in Korean",
    example: "총: 3건, 회원 출금액: 1,402,630원",
  })
  displayText?: string;

  constructor(data: Partial<MerchantWithdrawalStatsDto>) {
    Object.assign(this, data);
  }
}
