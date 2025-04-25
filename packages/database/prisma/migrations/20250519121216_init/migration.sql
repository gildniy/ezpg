-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'MERCHANT', 'AGENT');

-- CreateEnum
CREATE TYPE "MerchantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "WithdrawalMethod" AS ENUM ('KRW_WITHDRAWAL', 'SETTLEMENT', 'FOREIGN_WITHDRAWAL');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('MERCHANT', 'AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "BalanceChangeType" AS ENUM ('DEPOSIT_COMMISSION', 'WITHDRAWAL_REQUEST', 'WITHDRAWAL_COMPLETE', 'WITHDRAWAL_REJECT', 'WITHDRAWAL_REFUND', 'ADJUSTMENT_ADD', 'ADJUSTMENT_DEDUCT');

-- CreateEnum
CREATE TYPE "NoticeType" AS ENUM ('SYSTEM', 'NOTICE', 'UPDATE');

-- CreateEnum
CREATE TYPE "NoticeStatus" AS ENUM ('PUBLISHED', 'DRAFT');

-- CreateEnum
CREATE TYPE "QnaStatus" AS ENUM ('PENDING', 'ANSWERED');

-- CreateEnum
CREATE TYPE "LogSeverity" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "BlacklistType" AS ENUM ('IP', 'ACCOUNT_NUMBER', 'USER_ID', 'BANK_ACCOUNT');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MerchantBalanceChangeType" AS ENUM ('DEPOSIT_COMMISSION', 'WITHDRAWAL_REQUEST', 'WITHDRAWAL_COMPLETE', 'WITHDRAWAL_REJECT', 'WITHDRAWAL_REFUND', 'ADJUSTMENT_ADD', 'ADJUSTMENT_DEDUCT');

-- CreateEnum
CREATE TYPE "MerchantGroupStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "MerchantTransactionUri" (
    "merchant_id" VARCHAR(8) NOT NULL,
    "transaction_type" VARCHAR(1) NOT NULL,
    "uri" VARCHAR(500) NOT NULL,
    "api_key" VARCHAR(100) NOT NULL,
    "use_yn" VARCHAR(1) DEFAULT 'Y',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(20) NOT NULL,

    CONSTRAINT "MerchantTransactionUri_pkey" PRIMARY KEY ("merchant_id","transaction_type")
);

-- CreateTable
CREATE TABLE "MerchantWallet" (
    "merchant_id" VARCHAR(8) NOT NULL,
    "deposit_amount" BIGINT NOT NULL DEFAULT 0,
    "available_remittance_amount" BIGINT NOT NULL DEFAULT 0,
    "reserve_amount" BIGINT NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(20) NOT NULL,

    CONSTRAINT "MerchantWallet_pkey" PRIMARY KEY ("merchant_id")
);

-- CreateTable
CREATE TABLE "MerchantTransactionInfo" (
    "merchant_id" VARCHAR(8) NOT NULL,
    "settlement_type" VARCHAR(1) NOT NULL,
    "deposit_van_id" VARCHAR(1) NOT NULL,
    "remittance_van_id" VARCHAR(1) NOT NULL,
    "max_limit_amount" BIGINT NOT NULL,
    "merchant_bank_code" VARCHAR(3) NOT NULL,
    "merchant_account_number" VARCHAR(16) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(20) NOT NULL,

    CONSTRAINT "MerchantTransactionInfo_pkey" PRIMARY KEY ("merchant_id")
);

-- CreateTable
CREATE TABLE "MerchantFee" (
    "merchant_id" VARCHAR(8) NOT NULL,
    "deposit_fee" BIGINT NOT NULL DEFAULT 0,
    "deposit_fee_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "remittance_fee" BIGINT NOT NULL DEFAULT 0,
    "remittance_fee_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "foreign_remittance_fee_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "reserve_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(20) NOT NULL,

    CONSTRAINT "MerchantFee_pkey" PRIMARY KEY ("merchant_id")
);

-- CreateTable
CREATE TABLE "RemittanceSummary" (
    "transaction_date" VARCHAR(8) NOT NULL,
    "merchant_id" VARCHAR(8) NOT NULL,
    "remittance_count" INTEGER NOT NULL DEFAULT 0,
    "remittance_amount" BIGINT NOT NULL DEFAULT 0,
    "gross_remittance_amount" BIGINT NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(20),

    CONSTRAINT "RemittanceSummary_pkey" PRIMARY KEY ("transaction_date","merchant_id")
);

-- CreateTable
CREATE TABLE "Remittance" (
    "transaction_date" VARCHAR(8) NOT NULL,
    "transaction_id" BIGINT NOT NULL,
    "van_id" VARCHAR(1),
    "van_transaction_id" VARCHAR(100),
    "merchant_id" VARCHAR(8) NOT NULL,
    "transaction_status" VARCHAR(1) NOT NULL,
    "transaction_code" VARCHAR(4),
    "remittance_time" VARCHAR(6),
    "bank_code" VARCHAR(3),
    "account_number" VARCHAR(16),
    "remittance_amount" BIGINT,
    "remittance_type" VARCHAR(10),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(20),

    CONSTRAINT "Remittance_pkey" PRIMARY KEY ("transaction_date","transaction_id")
);

-- CreateTable
CREATE TABLE "VirtualAccount" (
    "bank_code" VARCHAR(3) NOT NULL,
    "account_number" VARCHAR(16) NOT NULL,
    "van_id" VARCHAR(1) NOT NULL,
    "merchant_id" VARCHAR(8),
    "issue_status" VARCHAR(1),
    "max_limit_amount" BIGINT,
    "user_name" VARCHAR(20),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(20) NOT NULL,

    CONSTRAINT "VirtualAccount_pkey" PRIMARY KEY ("bank_code","account_number")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "transaction_date" VARCHAR(8) NOT NULL,
    "van_id" VARCHAR(1) NOT NULL,
    "van_transaction_id" VARCHAR(100) NOT NULL,
    "merchant_id" VARCHAR(8) NOT NULL,
    "transaction_status" VARCHAR(1) NOT NULL,
    "issue_status" VARCHAR(1) NOT NULL,
    "deposit_time" VARCHAR(6),
    "cancel_time" VARCHAR(6),
    "bank_code" VARCHAR(3),
    "account_number" VARCHAR(16),
    "transaction_amount" BIGINT NOT NULL,
    "depositor_name" VARCHAR(30),
    "user_id" VARCHAR(30),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(20) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transaction_date","van_id","van_transaction_id")
);

-- CreateTable
CREATE TABLE "TransactionSummary" (
    "transaction_date" VARCHAR(8) NOT NULL,
    "merchant_id" VARCHAR(8) NOT NULL,
    "deposit_count" BIGINT NOT NULL DEFAULT 0,
    "deposit_amount" BIGINT NOT NULL DEFAULT 0,
    "net_deposit_amount" BIGINT NOT NULL DEFAULT 0,
    "cancel_count" BIGINT NOT NULL DEFAULT 0,
    "cancel_amount" BIGINT NOT NULL DEFAULT 0,
    "net_cancel_amount" BIGINT NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(20) NOT NULL,

    CONSTRAINT "TransactionSummary_pkey" PRIMARY KEY ("transaction_date","merchant_id")
);

-- CreateTable
CREATE TABLE "PendingDeliveryTransaction" (
    "pending_delivery_transaction_id" BIGINT NOT NULL,
    "transaction_date" VARCHAR(8) NOT NULL,
    "van_id" VARCHAR(1) NOT NULL,
    "van_transaction_id" VARCHAR(100) NOT NULL,
    "merchant_id" VARCHAR(8) NOT NULL,
    "transaction_status" VARCHAR(1) NOT NULL,
    "deposit_time" VARCHAR(6),
    "cancel_time" VARCHAR(6),
    "bank_code" VARCHAR(3),
    "account_number" VARCHAR(16),
    "transaction_amount" BIGINT,
    "depositor_name" VARCHAR(30),
    "user_id" VARCHAR(30),
    "scheduled_send_time" TIMESTAMP(3),
    "send_count" BIGINT NOT NULL DEFAULT 0,
    "max_send_count" BIGINT NOT NULL DEFAULT 10,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(20) NOT NULL,

    CONSTRAINT "PendingDeliveryTransaction_pkey" PRIMARY KEY ("pending_delivery_transaction_id")
);

-- CreateTable
CREATE TABLE "PendingDeliveryRemittance" (
    "transaction_date" VARCHAR(8) NOT NULL,
    "transaction_id" BIGINT NOT NULL,
    "van_id" VARCHAR(1),
    "van_transaction_id" VARCHAR(100),
    "merchant_id" VARCHAR(8) NOT NULL,
    "remittance_time" VARCHAR(6),
    "bank_code" VARCHAR(3),
    "account_number" VARCHAR(16),
    "remittance_amount" BIGINT,
    "remittance_type" VARCHAR(10),
    "scheduled_send_time" TIMESTAMP(3),
    "send_count" BIGINT NOT NULL DEFAULT 0,
    "max_send_count" BIGINT NOT NULL DEFAULT 10,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(20),

    CONSTRAINT "PendingDeliveryRemittance_pkey" PRIMARY KEY ("transaction_date","transaction_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" "RoleName" NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" VARCHAR(8) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "tfa_secret" VARCHAR(255),
    "tfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "first_login" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "hashed_refresh_token" VARCHAR(255),
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "merchants" (
    "merchant_id" VARCHAR(8) NOT NULL,
    "affiliate" VARCHAR(100) NOT NULL,
    "company_name" VARCHAR(100) NOT NULL,
    "telegram_id" VARCHAR(100) NOT NULL,
    "group_id" INTEGER NOT NULL,
    "created_by" VARCHAR(8) NOT NULL,
    "balance" DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    "remittance_bank_name" VARCHAR(100),
    "remittance_account_number" VARCHAR(50),
    "remittance_depositor_name" VARCHAR(100),
    "virtual_accounts_limit" INTEGER NOT NULL DEFAULT 0,
    "virtual_account_deposit_limit" INTEGER NOT NULL DEFAULT 0,
    "max_withdrawal_per_transaction" DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    "max_daily_withdrawal" DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    "callback_ip_address" VARCHAR(45),
    "status" "MerchantStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "primary_bank_code" VARCHAR(10),
    "api_key" TEXT NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("merchant_id")
);

-- CreateTable
CREATE TABLE "admins" (
    "admin_id" VARCHAR(8) NOT NULL,
    "is_super" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "transaction_references" (
    "reference_id" SERIAL NOT NULL,
    "transaction_date" VARCHAR(8) NOT NULL,
    "van_id" VARCHAR(1) NOT NULL,
    "van_transaction_id" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_references_pkey" PRIMARY KEY ("reference_id")
);

-- CreateTable
CREATE TABLE "merchant_groups" (
    "group_id" SERIAL NOT NULL,
    "group_name" VARCHAR(100) NOT NULL,
    "created_by" VARCHAR(8) NOT NULL,
    "status" "MerchantGroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "merchant_groups_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "banks" (
    "bank_code" VARCHAR(10) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("bank_code")
);

-- CreateTable
CREATE TABLE "agents" (
    "agent_id" VARCHAR(8) NOT NULL,
    "agent_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL DEFAULT 'test@example.com',
    "phone" VARCHAR(100) NOT NULL DEFAULT '000-0000-0000',
    "commission_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "mid" VARCHAR(100) NOT NULL,
    "mkey" TEXT NOT NULL,
    "callback_url" VARCHAR(255),
    "merchant_id" VARCHAR(8),
    "created_by" VARCHAR(8) NOT NULL,
    "balance" DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    "withdrawal_bank_name" VARCHAR(100),
    "withdrawal_account_number" VARCHAR(50),
    "withdrawal_account_holder" VARCHAR(100),
    "otp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "AgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "distribution_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "is_permanently_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("agent_id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "withdrawal_id" SERIAL NOT NULL,
    "user_id" VARCHAR(8) NOT NULL,
    "entity_type" "EntityType" NOT NULL DEFAULT 'MERCHANT',
    "entity_id" VARCHAR(8) NOT NULL,
    "amount" DECIMAL(20,2) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "account_number" VARCHAR(50) NOT NULL,
    "account_holder" VARCHAR(100) NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "requested_by" VARCHAR(8) NOT NULL,
    "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_by" VARCHAR(8),
    "processed_at" TIMESTAMPTZ(6),
    "processing_note" VARCHAR(255),
    "account_date" TIMESTAMPTZ(6),
    "method" "WithdrawalMethod",

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("withdrawal_id")
);

-- CreateTable
CREATE TABLE "notices" (
    "notice_id" SERIAL NOT NULL,
    "author_user_id" VARCHAR(8) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "type" "NoticeType",
    "status" "NoticeStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("notice_id")
);

-- CreateTable
CREATE TABLE "qna" (
    "qna_id" SERIAL NOT NULL,
    "requester_user_id" VARCHAR(8) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "status" "QnaStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answered_by" VARCHAR(8),
    "answered_at" TIMESTAMPTZ(6),

    CONSTRAINT "qna_pkey" PRIMARY KEY ("qna_id")
);

-- CreateTable
CREATE TABLE "logs" (
    "log_id" SERIAL NOT NULL,
    "user_id" VARCHAR(8),
    "action" VARCHAR(255) NOT NULL,
    "target_entity_type" VARCHAR(50),
    "target_entity_id" TEXT,
    "severity" "LogSeverity" NOT NULL DEFAULT 'INFO',
    "details" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "system_generated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "blacklist" (
    "blacklist_id" SERIAL NOT NULL,
    "type" "BlacklistType" NOT NULL DEFAULT 'IP',
    "value" VARCHAR(255) NOT NULL,
    "reason" TEXT,
    "created_by" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blacklist_pkey" PRIMARY KEY ("blacklist_id")
);

-- CreateTable
CREATE TABLE "civil_complaints" (
    "complaint_id" SERIAL NOT NULL,
    "merchant_id" VARCHAR(8) NOT NULL,
    "complainant_name" VARCHAR(100),
    "related_account_number" VARCHAR(50),
    "amount_deducted" DECIMAL(20,2),
    "final_amount" DECIMAL(20,2),
    "details" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'PENDING',
    "created_by" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ(6),

    CONSTRAINT "civil_complaints_pkey" PRIMARY KEY ("complaint_id")
);

-- CreateTable
CREATE TABLE "export_files" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "admin_id" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "export_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_logs" (
    "log_id" SERIAL NOT NULL,
    "entity_type" "EntityType" NOT NULL DEFAULT 'MERCHANT',
    "entity_id" TEXT NOT NULL,
    "change_type" "BalanceChangeType" NOT NULL DEFAULT 'DEPOSIT_COMMISSION',
    "amount" DECIMAL(20,2) NOT NULL,
    "balance_before" DECIMAL(20,2) NOT NULL,
    "balance_after" DECIMAL(20,2) NOT NULL,
    "related_transaction_id" VARCHAR(20),
    "transaction_reference_id" INTEGER,
    "related_withdrawal_id" INTEGER,
    "created_by" VARCHAR(8),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "BankCodeMappings" (
    "external_code" VARCHAR(10) NOT NULL,
    "internal_code" VARCHAR(10) NOT NULL,
    "external_name" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankCodeMappings_pkey" PRIMARY KEY ("external_code")
);

-- CreateIndex
CREATE INDEX "idx1_virtual_account" ON "VirtualAccount"("van_id", "issue_status", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_api_key_key" ON "merchants"("api_key");

-- CreateIndex
CREATE INDEX "merchants_primary_bank_code_idx" ON "merchants"("primary_bank_code");

-- CreateIndex
CREATE INDEX "transaction_references_van_transaction_id_idx" ON "transaction_references"("van_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_references_transaction_date_van_id_van_transact_key" ON "transaction_references"("transaction_date", "van_id", "van_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "export_files_filename_key" ON "export_files"("filename");

-- CreateIndex
CREATE INDEX "export_files_admin_id_idx" ON "export_files"("admin_id");

-- CreateIndex
CREATE INDEX "export_files_filename_idx" ON "export_files"("filename");

-- CreateIndex
CREATE INDEX "balance_logs_entity_type_entity_id_idx" ON "balance_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "BankCodeMappings_internal_code_idx" ON "BankCodeMappings"("internal_code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "merchant_groups"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_primary_bank_code_fkey" FOREIGN KEY ("primary_bank_code") REFERENCES "banks"("bank_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_groups" ADD CONSTRAINT "merchant_groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("merchant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qna" ADD CONSTRAINT "qna_answered_by_fkey" FOREIGN KEY ("answered_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qna" ADD CONSTRAINT "qna_requester_user_id_fkey" FOREIGN KEY ("requester_user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklist" ADD CONSTRAINT "blacklist_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "civil_complaints" ADD CONSTRAINT "civil_complaints_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "civil_complaints" ADD CONSTRAINT "civil_complaints_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("merchant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_files" ADD CONSTRAINT "export_files_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_logs" ADD CONSTRAINT "balance_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_logs" ADD CONSTRAINT "balance_logs_related_withdrawal_id_fkey" FOREIGN KEY ("related_withdrawal_id") REFERENCES "withdrawals"("withdrawal_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_logs" ADD CONSTRAINT "balance_logs_transaction_reference_id_fkey" FOREIGN KEY ("transaction_reference_id") REFERENCES "transaction_references"("reference_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankCodeMappings" ADD CONSTRAINT "BankCodeMappings_internal_code_fkey" FOREIGN KEY ("internal_code") REFERENCES "banks"("bank_code") ON DELETE NO ACTION ON UPDATE NO ACTION;
