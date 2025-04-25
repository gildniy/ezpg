import { BalanceChangeType } from "@ezpg/database";

export interface MerchantBalanceLogDetails {
  merchant_id: string;
  affiliate: string;
  amount: string;
  previous_balance: string;
  new_balance: string;
  type: BalanceChangeType;
  reason: string;
  related_transaction_id?: string;
}
