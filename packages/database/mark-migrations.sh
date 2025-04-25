#!/bin/bash

# Mark all migrations as applied
npx prisma migrate resolve --applied 20250510010000_create_bank_code_mappings
npx prisma migrate resolve --applied 20250510070456_add_balance_logs
npx prisma migrate resolve --applied 20250510074052_add_balance_logs
npx prisma migrate resolve --applied 20250511000000_add_transaction_references
npx prisma migrate resolve --applied 20250511010000_add_transaction_reference_trigger
npx prisma migrate resolve --applied 20250511020000_add_automatic_balance_log_triggers
npx prisma migrate resolve --applied 20250511214107_add_merchant_features
npx prisma migrate resolve --applied 20250512000000_add_bank_to_merchant_groups
npx prisma migrate resolve --applied 20250513000000_merchant_fee_id_change
npx prisma migrate resolve --applied 20250513035517_add_virtual_account_fields
npx prisma migrate resolve --applied 20250513064950_add_admin_model
npx prisma migrate resolve --applied 20250514000000_change_user_id_to_varchar
npx prisma migrate resolve --applied 20250514001000_add_user_id_generator

echo "All migrations marked as applied!" 