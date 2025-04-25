import { ApiProperty } from "@nestjs/swagger";

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
}

export class AdminDashboardRecentTransactionDto {
  @ApiProperty({
    description: "Transaction ID",
    example: "txn_12345",
  })
  id: string;

  @ApiProperty({
    description: "Type of transaction",
    enum: TransactionType,
    example: TransactionType.DEPOSIT,
  })
  type: TransactionType;

  @ApiProperty({
    description: "Merchant ID",
    example: "MERCH001",
  })
  merchantId: string;

  @ApiProperty({
    description: "Merchant name",
    example: "Premium Casino",
  })
  merchantName: string;

  @ApiProperty({
    description: "Transaction amount",
    example: 100000,
  })
  amount: number;

  @ApiProperty({
    description: "Transaction timestamp",
    example: "2023-06-20T15:30:00Z",
  })
  timestamp: Date;
}

export class AdminDashboardRecentTransactionsDto {
  @ApiProperty({
    description: "List of recent transactions",
    type: AdminDashboardRecentTransactionDto,
    isArray: true,
  })
  transactions: AdminDashboardRecentTransactionDto[];
}
