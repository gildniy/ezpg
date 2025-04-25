-- Remove redundant bank fields from Merchant
ALTER TABLE "merchants" DROP COLUMN IF EXISTS "remittance_bank_name";
ALTER TABLE "merchants" DROP COLUMN IF EXISTS "remittance_account_number";
ALTER TABLE "merchants" DROP COLUMN IF EXISTS "remittance_depositor_name";

-- Add new fields to Merchant
ALTER TABLE "merchants" ADD COLUMN "foreign_bank_name" VARCHAR(100);
ALTER TABLE "merchants" ADD COLUMN "foreign_bank_account_number" VARCHAR(50);
ALTER TABLE "merchants" ADD COLUMN "foreign_bank_account_holder" VARCHAR(100);
ALTER TABLE "merchants" ADD COLUMN "settlement_fee_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00;
ALTER TABLE "merchants" ADD COLUMN "settlement_fee" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "merchants" ADD COLUMN "foreign_currency_fee_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00;

-- Update User table for TFA change
-- First, ensure any users with tfa_enabled=true have a tfa_secret
UPDATE "users" SET "tfa_secret" = 'TEMP_SECRET_' || "user_id" WHERE "tfa_enabled" = true AND "tfa_secret" IS NULL;

-- Then drop the tfa_enabled column
ALTER TABLE "users" DROP COLUMN IF EXISTS "tfa_enabled"; 