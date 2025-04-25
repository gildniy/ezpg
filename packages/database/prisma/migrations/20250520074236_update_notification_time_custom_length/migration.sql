/*
  Warnings:

  - You are about to alter the column `notification_time_custom` on the `agents` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(11)`.

*/
-- AlterTable
ALTER TABLE "agents" ALTER COLUMN "notification_time_custom" SET DATA TYPE VARCHAR(11);
