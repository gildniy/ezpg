/*
  Warnings:

  - You are about to drop the column `otp_enabled` on the `agents` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PAYMENT_FAILED', 'SYSTEM_DOWN', 'API_ERROR', 'DATABASE_ERROR');

-- CreateEnum
CREATE TYPE "NotificationTime" AS ENUM ('TWENTY_FOUR_HOURS', 'BUSINESS_HOURS', 'CUSTOM');

-- AlterTable
ALTER TABLE "agents" DROP COLUMN "otp_enabled",
ADD COLUMN     "notification_time" "NotificationTime" NOT NULL DEFAULT 'TWENTY_FOUR_HOURS',
ADD COLUMN     "notification_time_custom" VARCHAR(50),
ADD COLUMN     "notification_types" "NotificationType"[] DEFAULT ARRAY['PAYMENT_FAILED', 'SYSTEM_DOWN']::"NotificationType"[],
ADD COLUMN     "telegram_id" VARCHAR(100) NOT NULL DEFAULT '';
