import { ApiProperty } from "@nestjs/swagger";
import { BalanceChangeType } from "@ezpg/database";

/**
 * DTO for merchant balance log entries
 * Used in list view and exports
 */
export class MerchantBalanceLogEntryDto {
  @ApiProperty({ description: "Sequential row number" })
  number: number;

  @ApiProperty({ description: "Timestamp of the log entry" })
  date: Date;

  @ApiProperty({ description: "Merchant affiliate name" })
  affiliate: string;

  @ApiProperty({ description: "Log entry details/description" })
  detail: string;

  @ApiProperty({
    description: "Balance change amount (can be positive or negative)",
    type: Number,
  })
  changeAmount: number;

  @ApiProperty({
    description: "Balance after the change was applied",
    type: Number,
  })
  amountAfterChange: number;

  @ApiProperty({
    description: "Type of balance change",
    enum: BalanceChangeType,
  })
  type: BalanceChangeType;

  @ApiProperty({
    description: "Merchant ID associated with the log entry",
  })
  merchantId: string;
}
