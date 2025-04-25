# Database Scripts

## Transaction References

### Overview

The system uses a `transaction_references` table to simplify working with transactions that have composite primary keys. This table helps establish references between the `balance_logs` table and transactions.

### Automatic Population

A database trigger has been created that automatically:

1. Creates entries in the `transaction_references` table when needed
2. Updates `balance_logs` with the correct reference ID

This happens whenever:

- A new balance log is created with a `related_transaction_id`
- An existing balance log is updated with a new `related_transaction_id`

### One-time Population Script

For existing data, we've created a script to populate transaction references.

Run it with:

```bash
# From project root
npx ts-node packages/database/src/scripts/populate-transaction-references.ts
```

## Automatic Balance Log Creation

### Overview

The system automatically creates balance log entries when transactions or withdrawals occur. This ensures a complete audit trail of all financial activities and automatically updates merchant and agent balances.

### For Transactions

When a new transaction is inserted in the `transaction` table:

1. A trigger automatically calculates the commission amount based on merchant settings
2. Creates a balance log entry with appropriate values
3. Updates the merchant's balance

This only occurs for deposit transactions (transaction_status = '0').

### For Withdrawals

The system handles the entire withdrawal lifecycle:

1. **When a withdrawal is created (status = PENDING):**

   - Creates a balance log entry of type WITHDRAWAL_REQUEST
   - Deducts the amount from the merchant/agent balance

2. **When a withdrawal status changes to COMPLETED:**

   - Creates a balance log entry of type WITHDRAWAL_COMPLETE
   - No balance change (amount was already deducted)

3. **When a withdrawal status changes to REJECTED or FAILED:**
   - Creates a balance log entry of type WITHDRAWAL_REJECT
   - Refunds the amount to the merchant/agent balance

### Technical Details

The implementation consists of:

1. A `transaction_references` table with columns:

   - `reference_id` (PK)
   - `transaction_date`
   - `van_id`
   - `van_transaction_id`
   - `created_at`

2. A `create_transaction_reference()` trigger function that:

   - Runs on INSERT or UPDATE for balance_logs
   - Looks up transaction details
   - Creates reference if needed
   - Updates the balance log

3. A set of triggers that automatically create balance logs:
   - `create_balance_log_for_transaction()` - For new transactions
   - `create_balance_log_for_withdrawal()` - For new withdrawals
   - `handle_withdrawal_status_change()` - For withdrawal status updates

### Benefits

- Simplifies queries by avoiding composite foreign keys
- Centralizes the logic for working with transaction references
- Automatically maintains data integrity
- Automatic balance updates and full audit trail
- Improves performance for transaction-related queries
- No application-level code needed for balance log creation
