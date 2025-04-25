import { ApiProperty } from "@nestjs/swagger";

export class LogResponseDto {
  @ApiProperty({
    description: "Log ID",
    example: 1,
  })
  logId: number;

  @ApiProperty({
    description: "Merchant ID",
    example: "MERCHANT123",
  })
  merchantId: string;

  @ApiProperty({
    description: "Affiliate",
    example: "Stic Payment Solutions",
  })
  affiliate: string;

  @ApiProperty({
    description: "Amount of balance change",
    example: "1000.00",
  })
  amount: string;

  @ApiProperty({
    description: "Previous balance",
    example: "5000.00",
  })
  previousBalance: string;

  @ApiProperty({
    description: "New balance after change",
    example: "6000.00",
  })
  newBalance: string;

  @ApiProperty({
    description: "Type of balance change",
    example: "DEPOSIT",
    enum: ["DEPOSIT", "WITHDRAWAL", "ADJUSTMENT", "COMMISSION"],
  })
  type: string;

  @ApiProperty({
    description: "Reason for balance change",
    example: "User deposit",
  })
  reason: string;

  @ApiProperty({
    description: "Related transaction ID if applicable",
    example: "TRX123456",
  })
  relatedTransactionId: string | null;

  @ApiProperty({
    description: "Created by user ID",
    example: 1,
  })
  createdBy: string;

  @ApiProperty({
    description: "Created by username",
    example: "admin",
  })
  createdByUsername: string;

  @ApiProperty({
    description: "Date and time of log creation",
    example: "2023-01-01T00:00:00.000Z",
  })
  createdAt: Date;
}
