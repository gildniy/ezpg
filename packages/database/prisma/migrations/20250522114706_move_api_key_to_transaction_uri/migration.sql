/*
  Warnings:

  - A unique constraint covering the columns `[api_key]` on the table `merchants` will be added. If there are existing duplicate values, this will fail.
  - The required column `api_key` was added to the `merchants` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "merchants" ADD COLUMN     "api_key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "merchants_api_key_key" ON "merchants"("api_key");
