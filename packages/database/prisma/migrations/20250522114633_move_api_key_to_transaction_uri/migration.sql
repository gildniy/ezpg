/*
  Warnings:

  - You are about to drop the column `virtual_accounts_limit` on the `merchants` table. All the data in the column will be lost.
  - You are about to alter the column `max_withdrawal_per_transaction` on the `merchants` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,2)` to `BigInt`.
  - You are about to alter the column `max_daily_withdrawal` on the `merchants` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,2)` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "merchants" DROP COLUMN "virtual_accounts_limit",
ADD COLUMN     "max_daily_deposit" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "max_deposit_per_transaction" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "virtual_account_limit" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "virtual_account_deposit_limit" SET DATA TYPE BIGINT,
ALTER COLUMN "max_withdrawal_per_transaction" SET DEFAULT 0,
ALTER COLUMN "max_withdrawal_per_transaction" SET DATA TYPE BIGINT,
ALTER COLUMN "max_daily_withdrawal" SET DEFAULT 0,
ALTER COLUMN "max_daily_withdrawal" SET DATA TYPE BIGINT;
