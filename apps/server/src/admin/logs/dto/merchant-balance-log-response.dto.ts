import { ApiProperty } from "@nestjs/swagger";

export class MerchantBalanceLogDto {
  @ApiProperty({ description: "Log ID", example: 5432 })
  log_id: number;

  @ApiProperty({ description: "Merchant ID", example: "sticpay" })
  merchant_id: string;

  @ApiProperty({
    description: "Affiliate",
    example: "Stic Payment Solutions",
  })
  affiliate: string;

  @ApiProperty({ description: "Previous balance amount", example: "5000000" })
  previous_balance: string;

  @ApiProperty({ description: "New balance amount", example: "4500000" })
  new_balance: string;

  @ApiProperty({ description: "Amount changed", example: "-500000" })
  amount: string;

  @ApiProperty({
    description: "Reason for balance change",
    example: "WITHDRAWAL",
  })
  reason: string;

  @ApiProperty({
    description: "Transaction ID if applicable",
    example: "TX123456",
  })
  transaction_id: string;

  @ApiProperty({
    description: "Change timestamp",
    example: "2023-07-12T15:20:00Z",
  })
  created_at: Date;
}

export class PaginatedMerchantBalanceLogResponseDto {
  @ApiProperty({
    description: "Array of merchant balance logs",
    type: [MerchantBalanceLogDto],
    isArray: true,
  })
  data: MerchantBalanceLogDto[];

  @ApiProperty({
    description: "Total number of logs matching the query",
    example: 210,
  })
  totalItems: number;

  @ApiProperty({ description: "Total number of pages", example: 21 })
  totalPages: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  currentPage: number;
}
