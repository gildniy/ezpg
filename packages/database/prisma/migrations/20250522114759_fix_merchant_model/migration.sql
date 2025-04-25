/*
  Warnings:

  - You are about to drop the column `api_key` on the `merchants` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "merchants_api_key_key";

-- AlterTable
ALTER TABLE "merchants" DROP COLUMN "api_key";
