import { ApiProperty } from "@nestjs/swagger";
import { MerchantBalanceLogDetails } from "./merchant-balance-log-details.interface";
import { BalanceChangeType } from "@ezpg/database";

export class MerchantBalanceLogDetailsDto implements MerchantBalanceLogDetails {
  @ApiProperty({
    description: "Merchant ID",
    example: "sticpay",
  })
  merchant_id: string;

  @ApiProperty({
    description: "Merchant affiliate/display name",
    example: "SticPay Merchant",
  })
  affiliate: string;

  @ApiProperty({
    description: "Amount of the balance change as a string",
    example: "1000.00",
  })
  amount: string;

  @ApiProperty({
    description: "Balance before the change as a string",
    example: "5000.00",
  })
  previous_balance: string;

  @ApiProperty({
    description: "Balance after the change as a string",
    example: "6000.00",
  })
  new_balance: string;

  @ApiProperty({
    description: "Type of balance change operation",
    enum: BalanceChangeType,
    example: BalanceChangeType.ADJUSTMENT_ADD,
  })
  type: BalanceChangeType;

  @ApiProperty({
    description: "Reason for the balance change",
    example: "Manual adjustment by admin",
  })
  reason: string;

  @ApiProperty({
    description: "Related transaction ID if available",
    example: "TXN123456789",
    required: false,
  })
  related_transaction_id?: string;
}
