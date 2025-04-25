/*
  Warnings:

  - You are about to drop the column `is_deleted` on the `merchant_groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MerchantTransactionInfo" ALTER COLUMN "max_limit_amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "transaction_amount" DROP NOT NULL;

-- AlterTable
ALTER TABLE "merchant_groups" DROP COLUMN "is_deleted",
ADD COLUMN     "deleted_at" TIMESTAMPTZ(6),
ADD COLUMN     "is_permanently_deleted" BOOLEAN NOT NULL DEFAULT false;
