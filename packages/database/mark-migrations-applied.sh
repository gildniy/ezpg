#!/bin/bash

# List of migrations to mark as applied
migrations=(
  "20250510010000_create_bank_code_mappings"
  "20250510070456_add_balance_logs"
  "20250510074052_add_balance_logs"
  "20250511000000_add_transaction_references"
  "20250511010000_add_transaction_reference_trigger"
  "20250511020000_add_automatic_balance_log_triggers"
  "20250511214107_add_merchant_features"
  "20250512000000_add_bank_to_merchant_groups"
  "20250513000000_merchant_fee_id_change"
  "20250513035517_add_virtual_account_fields"
  "20250513064950_add_admin_model"
  "20250514000000_change_user_id_to_varchar"
  "20250514001000_add_user_id_generator"
  "20250514195059_fix_agent_merchant_relation"
  "20250514200041_cleanup_schema_comments"
  "20250514205617_remove_agent_merchant_unique"
)

# Loop through and mark each migration as applied
for migration in "${migrations[@]}"; do
  echo "Marking migration $migration as applied..."
  npx prisma migrate resolve --applied "$migration"
done

echo "All migrations marked as applied. Checking status..."
npx prisma migrate status 