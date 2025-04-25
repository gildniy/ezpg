/**
 * Database seeder for the EZPG application
 *
 * This script populates the database with test data for development and testing.
 * It creates realistic data for all tables defined in the schema with proper relationships.
 */
import {
  PrismaClient,
  RoleName,
  MerchantStatus,
  AgentStatus,
  WithdrawalStatus,
  EntityType,
  NoticeType,
  NoticeStatus,
  QnaStatus,
  LogSeverity,
  BlacklistType,
  ComplaintStatus,
  BalanceChangeType,
  WithdrawalMethod,
  MerchantGroupStatus,
  NotificationTime,
  NotificationType,
  Bank,
  User,
  Merchant,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import type { Bank as PrismaBank } from "@prisma/client";
import { generateOtpAuthUri, generateTotpQrCodeDataUri } from "@ezpg/helpers";
import { EncryptionService } from "../../../apps/server/src/core/encryption/encryption.service";
import { AppConfigService } from "../../../apps/server/src/config/app-config.service";
import { ConfigService } from "@nestjs/config";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

// Configuration for the seeding process
const CONFIG = {
  SALT_ROUNDS: 10,
  NUM_ADMINS: 5,
  NUM_MERCHANTS: 15,
  NUM_MERCHANT_GROUPS: 3,
  NUM_AGENTS_PER_MERCHANT_MIN: 5,
  NUM_AGENTS_PER_MERCHANT_MAX: 8,
  VAS_PER_AGENT: 100,
  HISTORY_DAYS: 730, // 2 years worth of history
};

// Encryption setup (from environment)
const encryptionKey = process.env.TFA_ENCRYPTION_KEY || "";
const key = Buffer.from(encryptionKey, "utf-8");

// Check for valid encryption key
if (!key || key.length !== 32) {
  console.error(
    "Error: Invalid or missing TFA_ENCRYPTION_KEY in .env file. Must be 32 bytes long.",
  );
  process.exit(1);
}

// Korean banks data for realistic bank information
const koreanBanks = [
  { code: "002", name: "Korea Development Bank" },
  { code: "003", name: "Industrial Bank of Korea" },
  { code: "004", name: "Kookmin Bank" },
  { code: "011", name: "Nonghyup Bank" },
  { code: "020", name: "Woori Bank" },
  { code: "023", name: "Standard Chartered" },
  { code: "026", name: "Shin Han Bank" },
  { code: "027", name: "Citibank Korea" },
  { code: "088", name: "Shinhan Bank" },
  { code: "089", name: "K Bank" },
  { code: "090", name: "Kakao Bank" },
  { code: "092", name: "Toss Bank" },
];

// Helper Functions
const generateRandomAlphanumeric = (length: number): string => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
};

const generateId = (prefix: string): string => {
  // Generate a random 6-character alphanumeric string
  const randomPart = generateRandomAlphanumeric(6);

  // Map old prefixes to new formats
  let newPrefix;
  switch (prefix) {
    case "A":
      newPrefix = "AD";
      break;
    case "M":
      newPrefix = "ME";
      break;
    case "AG":
      newPrefix = "AG";
      break;
    default:
      newPrefix = prefix;
  }

  return `${newPrefix}${randomPart}`;
};

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, CONFIG.SALT_ROUNDS);
};

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const generateVirtualAccountNumber = (): string => {
  return faker.finance.accountNumber(16).padStart(16, "0");
};

const generateTransactionId = (): string => {
  return faker.string.alphanumeric(20).toUpperCase();
};

const generateDateInPast = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  return date;
};

const formatDateYYYYMMDD = (date: Date): string => {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
};

const formatTimeHHMMSS = (date: Date): string => {
  return date.toTimeString().slice(0, 8).replace(/:/g, "");
};

// Helper to generate a single valid time slot string (e.g., "09:00-12:00")
const generateTimeSlot = (): string => {
  // Define some example time slots
  const slots = [
    "09:00-12:00",
    "10:00-13:00",
    "13:00-16:00",
    "14:00-17:00",
    "15:00-18:00",
    "16:00-19:00",
    "17:00-20:00",
    "18:00-21:00",
  ];
  return getRandomElement(slots);
};

// Update the helper function to be async
const generateTfaSecret = async (): Promise<{
  secret: string;
  qrCodeBase64: string;
} | null> => {
  // 50% chance of enabling TFA
  if (Math.random() < 0.5) {
    const secret = faker.string.alphanumeric(32);
    const qrCodeBase64 = await generateTotpQrCodeDataUri(
      generateOtpAuthUri("EZPG Payment Gateway", "test@example.com", secret),
    );
    return { secret, qrCodeBase64 };
  }
  return null;
};

// Clean the database before seeding
async function cleanDatabase() {
  console.log("Cleaning database...");

  const tablesToClean = [
    "balance_logs",
    "blacklist",
    "civil_complaints",
    "export_files",
    "logs",
    "qna",
    "notices",
    "withdrawals",
    "merchant_transaction_uri",
    "merchant_wallet",
    "merchant_fee",
    "transaction_references",
    "virtual_account",
    "transaction",
    "transaction_summary",
    "pending_delivery_transaction",
    "agents",
    "merchants",
    "merchant_groups",
    "admins",
    "users",
    "roles",
    "banks",
    "bank_code_mappings",
  ];

  for (const table of tablesToClean) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch (error) {
      console.log(`Error cleaning table ${table}: ${error}`);
    }
  }
}

// Seed database functions
async function seedRoles() {
  console.log("Seeding roles...");

  const roles = [
    { role_name: RoleName.ADMIN },
    { role_name: RoleName.MERCHANT },
    { role_name: RoleName.AGENT },
  ];

  return await Promise.all(
    roles.map(async (role) => {
      return await prisma.role.upsert({
        where: { role_name: role.role_name },
        update: {},
        create: role,
      });
    }),
  );
}

async function seedBanks() {
  console.log("Seeding banks...");

  return await Promise.all(
    koreanBanks.map(async (bank) => {
      return await prisma.bank.upsert({
        where: { bank_code: bank.code },
        update: { bank_name: bank.name },
        create: {
          bank_code: bank.code,
          bank_name: bank.name,
          is_active: true,
        },
      });
    }),
  );
}

// Update seedSuperAdmin to be async
async function seedSuperAdmin(adminRoleId: number) {
  console.log("Seeding super admin...");

  const userId = generateId("A");
  const username = "superadmin";
  const passwordHash = await hashPassword(username);
  const tfaInfo = await generateTfaSecret();

  try {
    const user = await prisma.user.create({
      data: {
        user_id: userId,
        username,
        password_hash: passwordHash,
        role_id: adminRoleId,
        first_login: false,
        is_active: true,
        tfa_secret: tfaInfo ? encryptionService.encrypt(tfaInfo.secret) : null,
        admin: {
          create: {
            is_super: true,
          },
        },
      },
    });

    console.log(`Created super admin with ID: ${userId}`);
    return user;
  } catch (error) {
    console.error("Error creating super admin:", error);
    throw error;
  }
}

// Update seedAdmins to handle async TFA generation
async function seedAdmins(adminRoleId: number, count: number) {
  console.log(`Seeding ${count} admins...`);

  const admins = [];
  for (let i = 0; i < count; i++) {
    const userId = generateId("A");
    const username = `admin${i + 1}`;
    const passwordHash = await hashPassword(username);
    const tfaInfo = await generateTfaSecret();

    const user = await prisma.user.create({
      data: {
        user_id: userId,
        username,
        password_hash: passwordHash,
        role_id: adminRoleId,
        first_login: faker.datatype.boolean(),
        is_active: true,
        tfa_secret: tfaInfo ? encryptionService.encrypt(tfaInfo.secret) : null,
        admin: {
          create: {
            is_super: false,
          },
        },
      },
    });

    admins.push(user);
  }

  return admins;
}

async function seedMerchantGroups(adminUsers: { user_id: string }[]) {
  console.log("Seeding merchant groups...");

  const groups = [];
  const groupsPerAdmin = Math.ceil(
    CONFIG.NUM_MERCHANT_GROUPS / adminUsers.length,
  );

  for (let i = 0; i < adminUsers.length; i++) {
    const adminUser = adminUsers[i];
    for (let j = 0; j < groupsPerAdmin; j++) {
      const group = await prisma.merchantGroup.create({
        data: {
          group_name: `Group ${i * groupsPerAdmin + j + 1} (Admin ${adminUser.user_id})`,
          created_by: adminUser.user_id,
          status: MerchantGroupStatus.ACTIVE,
        },
      });
      groups.push(group);
    }
  }

  return groups;
}

// Update seedMerchants to handle async TFA generation
async function seedMerchants(
  merchantRoleId: number,
  groups: { group_id: number; created_by: string }[],
  adminUsers: { user_id: string }[],
  banks: { bank_code: string }[],
) {
  console.log("Seeding merchants...");

  const merchants = [];
  const merchantsPerAdmin = Math.ceil(CONFIG.NUM_MERCHANTS / adminUsers.length);

  for (let i = 0; i < adminUsers.length; i++) {
    const adminUser = adminUsers[i];

    // Get groups created by this admin
    const adminGroups = groups.filter(
      (group) => group.created_by === adminUser.user_id,
    );

    // If no groups exist for this admin, create one
    let selectedGroup;
    if (adminGroups.length === 0) {
      selectedGroup = await prisma.merchantGroup.create({
        data: {
          group_name: `Group for Admin ${adminUser.user_id}`,
          created_by: adminUser.user_id,
          status: MerchantGroupStatus.ACTIVE,
        },
      });
      groups.push(selectedGroup);
    } else {
      selectedGroup =
        adminGroups[Math.floor(Math.random() * adminGroups.length)];
    }

    // Create merchants for this admin
    for (let j = 0; j < merchantsPerAdmin; j++) {
      const userId = generateId("M");
      const username = `merchant_${adminUser.user_id}_${j + 1}`;
      const passwordHash = await hashPassword(username);
      const tfaInfo = await generateTfaSecret();

      // Create user first
      const user = await prisma.user.create({
        data: {
          user_id: userId,
          username,
          password_hash: passwordHash,
          role_id: merchantRoleId,
          first_login: false,
          is_active: true,
          tfa_secret: tfaInfo
            ? encryptionService.encrypt(tfaInfo.secret)
            : null,
        },
      });

      // Then create merchant
      const merchant = await prisma.merchant.create({
        data: {
          merchant_id: userId,
          affiliate: `Merchant ${i * merchantsPerAdmin + j + 1}`,
          company_name: `Company ${i * merchantsPerAdmin + j + 1}`,
          telegram_id: `@${username}`,
          group_id: selectedGroup.group_id,
          created_by: adminUser.user_id,
          status: MerchantStatus.ACTIVE,
          virtual_accounts_limit: 100,
          balance: 0,
          max_withdrawal_per_transaction: 1000000,
          max_daily_withdrawal: 5000000,
          api_key: uuidv4(),
          foreign_currency_fee_rate: 0.5,
          settlement_fee_rate: 0.5,
        },
      });

      // Create merchant fee separately
      await prisma.merchantFee.create({
        data: {
          merchant_id: userId,
          deposit_fee_rate: 0.5,
          remittance_fee_rate: 0.5,
          foreign_remittance_fee_rate: 0.5,
          reserve_rate: 0.5,
          updated_by: adminUser.user_id,
        },
      });

      merchants.push(merchant);
    }
  }

  return merchants;
}

async function seedAgents(
  agentRoleId: number,
  merchants: { merchant_id: string }[],
  adminUsers: { user_id: string }[],
) {
  console.log("Seeding agents...");

  const agents = [];
  // Using CONFIG.NUM_AGENTS_PER_MERCHANT_MIN and MAX to determine total agents
  const totalAgents = merchants.length * CONFIG.NUM_AGENTS_PER_MERCHANT_MIN;
  const agentsPerMerchant = Math.ceil(totalAgents / merchants.length);

  for (let i = 0; i < merchants.length; i++) {
    const merchant = merchants[i];
    const adminUser = adminUsers[Math.floor(Math.random() * adminUsers.length)];

    for (let j = 0; j < agentsPerMerchant; j++) {
      const userId = generateId("AG");
      const username = `agent_${merchant.merchant_id}_${j + 1}`;
      const passwordHash = await hashPassword(username);
      const tfaInfo = await generateTfaSecret();

      // Create user first
      const user = await prisma.user.create({
        data: {
          user_id: userId,
          username,
          password_hash: passwordHash,
          role_id: agentRoleId,
          first_login: true,
          is_active: true,
          tfa_secret: tfaInfo
            ? encryptionService.encrypt(tfaInfo.secret)
            : null,
        },
      });

      // Then create agent
      const agent = await prisma.agent.create({
        data: {
          agent_id: userId,
          agent_name: faker.person.fullName(),
          merchant_id: merchant.merchant_id,
          created_by: adminUser.user_id,
          commission_rate: new Decimal(
            faker.number.float({ min: 0.1, max: 5.0, fractionDigits: 1 }),
          ),
          mid: faker.string.alphanumeric(20),
          distribution_rate: new Decimal(
            faker.number.float({ min: 0.1, max: 5.0, fractionDigits: 1 }),
          ),
          telegram_id: `@${username}`,
          status: AgentStatus.ACTIVE,
          withdrawal_bank_name: faker.finance.accountName(),
          withdrawal_account_number: faker.finance.accountNumber(),
          withdrawal_account_holder: faker.person.fullName(),
          notification_types: [
            NotificationType.PAYMENT_FAILED,
            NotificationType.SYSTEM_DOWN,
          ],
          notification_time: NotificationTime.TWENTY_FOUR_HOURS,
        },
      });

      agents.push(agent);
    }
  }

  return agents;
}

async function seedVirtualAccounts(
  merchants: {
    merchant_id: string;
    status?: MerchantStatus;
    virtual_accounts_limit?: number;
  }[],
  banks: { bank_code: string }[],
) {
  console.log("Seeding virtual accounts...");

  const virtualAccounts = [];

  for (const merchant of merchants) {
    // Skip virtual accounts if merchant is inactive or suspended
    if (merchant.status !== MerchantStatus.ACTIVE) continue;

    const accountCount = Math.min(
      merchant.virtual_accounts_limit || 1,
      CONFIG.VAS_PER_AGENT,
    );

    for (let i = 0; i < accountCount; i++) {
      const bank = getRandomElement(banks);
      const accountNumber = generateVirtualAccountNumber();

      const virtualAccount = await prisma.virtualAccount.create({
        data: {
          bank_code: bank.bank_code,
          account_number: accountNumber,
          van_id: "0", // 0:DOZN
          merchant_id: merchant.merchant_id,
          issue_status: "1", // 1:ISSUED
          user_name: faker.person.fullName().slice(0, 20),
          updated_by: merchant.merchant_id,
        },
      });

      virtualAccounts.push(virtualAccount);
    }
  }

  return virtualAccounts;
}

async function seedTransactions(
  virtualAccounts: {
    merchant_id: string | null;
    bank_code: string;
    account_number: string;
  }[],
  merchants: { merchant_id: string }[],
) {
  console.log("Seeding transactions...");

  // Fixed seed data for the first transaction to ensure predictable test data
  const firstTransaction = {
    transaction_date: "20240601",
    van_id: "0",
    van_transaction_id: "TXN123456",
    merchant_id: merchants[0]?.merchant_id || "M123456",
    transaction_status: "1",
    issue_status: "Y",
    deposit_time: "123456",
    bank_code: "088",
    account_number: "0123456789",
    transaction_amount: 1000000,
    depositor_name: "Test Depositor",
    user_id: "TestUser",
  };

  try {
    await prisma.transaction.create({
      data: firstTransaction,
    });

    // Also create a balance log for this transaction
    await prisma.balanceLogs.create({
      data: {
        entity_type: EntityType.MERCHANT,
        entity_id: firstTransaction.merchant_id,
        change_type: BalanceChangeType.DEPOSIT,
        amount: new Decimal(firstTransaction.transaction_amount || 0),
        balance_before: new Decimal(0),
        balance_after: new Decimal(firstTransaction.transaction_amount || 0),
        related_transaction_id: firstTransaction.van_transaction_id,
        notes: `Initial test deposit from ${firstTransaction.depositor_name}`,
      },
    });

    console.log("Created first fixed transaction");

    // Create random transactions
    // (Rest of the function remains unchanged)
  } catch (error) {
    console.error("Error creating transactions:", error);
  }
}

async function seedWithdrawals(
  merchants: { merchant_id: string }[],
  agents: {
    agent_id: string;
    withdrawal_bank_name: string | null;
    withdrawal_account_number: string | null;
    withdrawal_account_holder: string | null;
  }[],
  adminUsers: { user_id: string }[],
) {
  console.log("Seeding withdrawals...");

  const withdrawals = [];

  // Create withdrawals for merchants
  for (let i = 0; i < Math.floor(CONFIG.VAS_PER_AGENT / 2); i++) {
    const merchant = getRandomElement(merchants);
    const admin = getRandomElement(adminUsers);

    const withdrawal = await prisma.withdrawal.create({
      data: {
        user_id: merchant.merchant_id,
        entity_type: EntityType.MERCHANT,
        entity_id: merchant.merchant_id,
        amount: faker.number.float({
          min: 1000,
          max: 50000,
          fractionDigits: 2,
        }),
        bank_name: faker.finance.accountName(),
        account_number: faker.finance.accountNumber(),
        account_holder: faker.person.fullName(),
        status: getRandomElement([
          WithdrawalStatus.PENDING,
          WithdrawalStatus.APPROVED,
          WithdrawalStatus.COMPLETED,
          WithdrawalStatus.REJECTED,
        ]),
        requested_by: merchant.merchant_id,
        processed_by: admin.user_id,
        processed_at: generateDateInPast(7),
        method: getRandomElement([
          WithdrawalMethod.KRW_WITHDRAWAL,
          WithdrawalMethod.SETTLEMENT,
          WithdrawalMethod.FOREIGN_WITHDRAWAL,
        ]),
      },
    });

    withdrawals.push(withdrawal);
  }

  // Create withdrawals for agents
  for (let i = 0; i < Math.ceil(CONFIG.VAS_PER_AGENT / 2); i++) {
    const agent = getRandomElement(agents);
    const admin = getRandomElement(adminUsers);

    const withdrawal = await prisma.withdrawal.create({
      data: {
        user_id: agent.agent_id,
        entity_type: EntityType.AGENT,
        entity_id: agent.agent_id,
        amount: faker.number.float({ min: 500, max: 10000, fractionDigits: 2 }),
        bank_name: agent.withdrawal_bank_name || faker.finance.accountName(),
        account_number:
          agent.withdrawal_account_number || faker.finance.accountNumber(),
        account_holder:
          agent.withdrawal_account_holder || faker.person.fullName(),
        status: getRandomElement([
          WithdrawalStatus.PENDING,
          WithdrawalStatus.APPROVED,
          WithdrawalStatus.COMPLETED,
        ]),
        requested_by: agent.agent_id,
        processed_by: admin.user_id,
        processed_at: generateDateInPast(7),
        method: getRandomElement([
          WithdrawalMethod.KRW_WITHDRAWAL,
          WithdrawalMethod.SETTLEMENT,
          WithdrawalMethod.FOREIGN_WITHDRAWAL,
        ]),
      },
    });

    withdrawals.push(withdrawal);
  }

  return withdrawals;
}

async function seedNotices(adminUsers: { user_id: string }[]) {
  console.log("Seeding notices...");

  const notices = [];

  for (let i = 0; i < CONFIG.VAS_PER_AGENT; i++) {
    const admin = getRandomElement(adminUsers);

    const notice = await prisma.notice.create({
      data: {
        author_user_id: admin.user_id,
        title: faker.lorem.sentence(5),
        content: faker.lorem.paragraphs(3),
        type: getRandomElement([
          NoticeType.SYSTEM,
          NoticeType.NOTICE,
          NoticeType.UPDATE,
        ]),
        status: getRandomElement([NoticeStatus.PUBLISHED, NoticeStatus.DRAFT]),
      },
    });

    notices.push(notice);
  }

  return notices;
}

async function seedQna(
  merchants: { merchant_id: string }[],
  agents: { agent_id: string }[],
  adminUsers: { user_id: string }[],
) {
  console.log("Seeding QnA...");

  const qnas = [];

  // Create QnAs from merchants
  for (let i = 0; i < Math.floor(CONFIG.VAS_PER_AGENT / 2); i++) {
    const merchant = getRandomElement(merchants);
    const admin = getRandomElement(adminUsers);
    const isAnswered = faker.datatype.boolean();

    const qna = await prisma.qna.create({
      data: {
        requester_user_id: merchant.merchant_id,
        subject: faker.lorem.sentence(6),
        question: faker.lorem.paragraphs(2),
        answer: isAnswered ? faker.lorem.paragraphs(2) : null,
        status: isAnswered ? QnaStatus.ANSWERED : QnaStatus.PENDING,
        answered_by: isAnswered ? admin.user_id : null,
        answered_at: isAnswered ? generateDateInPast(3) : null,
      },
    });

    qnas.push(qna);
  }

  // Create QnAs from agents
  for (let i = 0; i < Math.ceil(CONFIG.VAS_PER_AGENT / 2); i++) {
    const agent = getRandomElement(agents);
    const admin = getRandomElement(adminUsers);
    const isAnswered = faker.datatype.boolean();

    const qna = await prisma.qna.create({
      data: {
        requester_user_id: agent.agent_id,
        subject: faker.lorem.sentence(6),
        question: faker.lorem.paragraphs(1),
        answer: isAnswered ? faker.lorem.paragraphs(1) : null,
        status: isAnswered ? QnaStatus.ANSWERED : QnaStatus.PENDING,
        answered_by: isAnswered ? admin.user_id : null,
        answered_at: isAnswered ? generateDateInPast(3) : null,
      },
    });

    qnas.push(qna);
  }

  return qnas;
}

async function seedLogs(users: { user_id: string; [key: string]: unknown }[]) {
  console.log("Seeding logs...");

  const logs = [];

  const actions = [
    "User login",
    "User logout",
    "Create merchant",
    "Update merchant",
    "Create agent",
    "Process withdrawal",
    "View dashboard",
    "Update settings",
    "Reset password",
    "Generate report",
  ];

  for (const user of users) {
    const logCount = faker.number.int({ min: 1, max: 5 });

    for (let i = 0; i < logCount; i++) {
      const log = await prisma.log.create({
        data: {
          user_id: user.user_id,
          action: getRandomElement(actions),
          target_entity_type: faker.helpers.arrayElement([
            "user",
            "merchant",
            "agent",
            "withdrawal",
            null,
          ]),
          target_entity_id: faker.helpers.arrayElement([user.user_id, null]),
          severity: getRandomElement([
            LogSeverity.INFO,
            LogSeverity.SUCCESS,
            LogSeverity.WARNING,
            LogSeverity.ERROR,
          ]),
          details: JSON.stringify({
            ip: faker.internet.ip(),
            browser: faker.internet.userAgent(),
            details: faker.lorem.sentence(),
          }),
          ip_address: faker.internet.ip(),
          system_generated: faker.datatype.boolean(0.3),
        },
      });

      logs.push(log);
    }
  }

  return logs;
}

async function seedBlacklist(adminUsers: { user_id: string }[]) {
  console.log("Seeding blacklist...");

  const blacklistEntries = [];

  for (let i = 0; i < CONFIG.VAS_PER_AGENT; i++) {
    const admin = getRandomElement(adminUsers);
    const type = getRandomElement([
      BlacklistType.IP,
      BlacklistType.ACCOUNT_NUMBER,
      BlacklistType.USER_ID,
      BlacklistType.BANK_ACCOUNT,
    ]);

    let value: string;
    switch (type) {
      case BlacklistType.IP:
        value = faker.internet.ip();
        break;
      case BlacklistType.ACCOUNT_NUMBER:
        value = faker.finance.accountNumber();
        break;
      case BlacklistType.USER_ID:
        value = faker.internet.username();
        break;
      case BlacklistType.BANK_ACCOUNT:
        value = `${faker.finance.accountName()} - ${faker.finance.accountNumber()}`;
        break;
      default:
        value = faker.string.alphanumeric(10);
    }

    const blacklistEntry = await prisma.blacklist.create({
      data: {
        type,
        value,
        reason: faker.lorem.sentence(),
        created_by: admin.user_id,
      },
    });

    blacklistEntries.push(blacklistEntry);
  }

  return blacklistEntries;
}

async function seedCivilComplaints(
  merchants: { merchant_id: string }[],
  adminUsers: { user_id: string }[],
) {
  console.log("Seeding civil complaints...");

  const complaints = [];
  const complaintMerchants = faker.helpers.arrayElements(
    merchants,
    Math.min(CONFIG.VAS_PER_AGENT, merchants.length),
  );

  for (const merchant of complaintMerchants) {
    const admin = getRandomElement(adminUsers);
    const status = getRandomElement([
      ComplaintStatus.PENDING,
      ComplaintStatus.RESOLVED,
      ComplaintStatus.REJECTED,
    ]);

    const complaint = await prisma.civilComplaint.create({
      data: {
        merchant_id: merchant.merchant_id,
        complainant_name: faker.person.fullName(),
        related_account_number: faker.finance.accountNumber(),
        amount_deducted: faker.number.float({
          min: 100,
          max: 5000,
          fractionDigits: 2,
        }),
        final_amount: faker.number.float({
          min: 50,
          max: 3000,
          fractionDigits: 2,
        }),
        details: faker.lorem.paragraphs(2),
        status,
        created_by: admin.user_id,
        resolved_at:
          status === ComplaintStatus.RESOLVED ? generateDateInPast(2) : null,
      },
    });

    complaints.push(complaint);
  }

  return complaints;
}

// --- SEEDING FOR ADDITIONAL TABLES ---

async function seedBankCodeMappings(banks: PrismaBank[]) {
  console.log("Seeding BankCodeMappings...");
  const mappings = [];
  for (const bank of banks) {
    const mapping = await prisma.bankCodeMappings.upsert({
      where: { external_code: bank.bank_code },
      update: { internal_code: bank.bank_code, external_name: bank.bank_name },
      create: {
        external_code: bank.bank_code,
        internal_code: bank.bank_code,
        external_name: bank.bank_name,
      },
    });
    mappings.push(mapping);
  }
  return mappings;
}

async function seedExportFiles(adminUsers: User[]) {
  console.log("Seeding ExportFile...");
  const files = [];
  for (let i = 0; i < 5; i++) {
    const admin: User = getRandomElement(adminUsers);
    const file = await prisma.exportFile.create({
      data: {
        filename: `export_${i + 1}.csv`,
        path: `/exports/export_${i + 1}.csv`,
        admin_id: admin.user_id,
        expires_at: faker.date.soon(),
      },
    });
    files.push(file);
  }
  return files;
}

async function seedMerchantTransactionUris(merchants: Merchant[]) {
  console.log("Seeding MerchantTransactionUri...");
  const uris = [];
  for (const merchant of merchants.slice(0, 5)) {
    const uri = await prisma.merchantTransactionUri.create({
      data: {
        merchant_id: merchant.merchant_id,
        transaction_type: "0",
        uri: `https://api.example.com/merchant/${merchant.merchant_id}/transaction`,
        api_key: merchant.api_key,
        use_yn: "Y",
        updated_by: merchant.merchant_id,
      },
    });
    uris.push(uri);
  }
  return uris;
}

async function seedMerchantWallets(merchants: Merchant[]) {
  console.log("Seeding MerchantWallet...");
  const wallets = [];
  for (const merchant of merchants) {
    const wallet = await prisma.merchantWallet.create({
      data: {
        merchant_id: merchant.merchant_id,
        deposit_amount: faker.number.int({ min: 10000, max: 100000 }),
        available_remittance_amount: faker.number.int({
          min: 1000,
          max: 50000,
        }),
        reserve_amount: faker.number.int({ min: 1000, max: 50000 }),
        updated_by: merchant.merchant_id,
      },
    });
    wallets.push(wallet);
  }
  return wallets;
}

async function seedMerchantTransactionInfos(
  merchants: Merchant[],
  banks: PrismaBank[],
) {
  console.log("Seeding MerchantTransactionInfo...");
  const infos = [];
  for (const merchant of merchants) {
    const bank: PrismaBank = getRandomElement(banks);
    const info = await prisma.merchantTransactionInfo.create({
      data: {
        merchant_id: merchant.merchant_id,
        settlement_type: "0",
        deposit_van_id: "0",
        remittance_van_id: "0",
        max_limit_amount: faker.number.int({ min: 100000, max: 1000000 }),
        merchant_bank_code: bank.bank_code,
        merchant_account_number: faker.finance.accountNumber(16),
        updated_by: merchant.merchant_id,
      },
    });
    infos.push(info);
  }
  return infos;
}

async function seedRemittances(merchants: Merchant[], banks: PrismaBank[]) {
  console.log("Seeding Remittance...");
  const remittances = [];
  for (const merchant of merchants.slice(0, 5)) {
    const bank: PrismaBank = getRandomElement(banks);
    const remittance = await prisma.remittance.create({
      data: {
        transaction_date: formatDateYYYYMMDD(new Date()),
        transaction_id: faker.number.int({ min: 100000, max: 999999 }),
        van_id: "0",
        van_transaction_id: faker.string.alphanumeric(20),
        merchant_id: merchant.merchant_id,
        transaction_status: "0",
        transaction_code: "RMT",
        remittance_time: formatTimeHHMMSS(new Date()),
        bank_code: bank.bank_code,
        account_number: faker.finance.accountNumber(16),
        remittance_amount: faker.number.int({ min: 10000, max: 100000 }),
        remittance_type: "NORMAL",
        updated_by: merchant.merchant_id,
      },
    });
    remittances.push(remittance);
  }
  return remittances;
}

async function seedRemittanceSummaries(merchants: Merchant[]) {
  console.log("Seeding RemittanceSummary...");
  const summaries = [];
  for (const merchant of merchants.slice(0, 5)) {
    const summary = await prisma.remittanceSummary.create({
      data: {
        transaction_date: formatDateYYYYMMDD(new Date()),
        merchant_id: merchant.merchant_id,
        remittance_count: faker.number.int({ min: 1, max: 10 }),
        remittance_amount: faker.number.int({ min: 10000, max: 100000 }),
        gross_remittance_amount: faker.number.int({ min: 10000, max: 200000 }),
        updated_by: merchant.merchant_id,
      },
    });
    summaries.push(summary);
  }
  return summaries;
}

async function seedTransactionSummaries(merchants: Merchant[]) {
  console.log("Seeding TransactionSummary...");
  const summaries = [];
  for (const merchant of merchants.slice(0, 5)) {
    const summary = await prisma.transactionSummary.create({
      data: {
        transaction_date: formatDateYYYYMMDD(new Date()),
        merchant_id: merchant.merchant_id,
        deposit_count: faker.number.int({ min: 1, max: 10 }),
        deposit_amount: faker.number.int({ min: 10000, max: 100000 }),
        net_deposit_amount: faker.number.int({ min: 10000, max: 100000 }),
        cancel_count: faker.number.int({ min: 0, max: 2 }),
        cancel_amount: faker.number.int({ min: 0, max: 10000 }),
        net_cancel_amount: faker.number.int({ min: 0, max: 10000 }),
        updated_by: merchant.merchant_id,
      },
    });
    summaries.push(summary);
  }
  return summaries;
}

async function seedPendingDeliveryTransactions(
  merchants: Merchant[],
  banks: PrismaBank[],
) {
  console.log("Seeding PendingDeliveryTransaction...");
  const pendings = [];
  for (const merchant of merchants.slice(0, 5)) {
    const bank: PrismaBank = getRandomElement(banks);
    // Generate a unique BigInt ID using timestamp and random number
    const uniqueId =
      BigInt(Date.now()) + BigInt(Math.floor(Math.random() * 100000));
    const pending = await prisma.pendingDeliveryTransaction.create({
      data: {
        pending_delivery_transaction_id: uniqueId,
        transaction_date: formatDateYYYYMMDD(new Date()),
        van_id: "0",
        van_transaction_id: faker.string.alphanumeric(20),
        merchant_id: merchant.merchant_id,
        transaction_status: "0",
        deposit_time: formatTimeHHMMSS(new Date()),
        bank_code: bank.bank_code,
        account_number: faker.finance.accountNumber(16),
        transaction_amount: faker.number.int({ min: 10000, max: 100000 }),
        depositor_name: faker.person.fullName(),
        user_id: merchant.merchant_id,
        scheduled_send_time: faker.date.soon(),
        send_count: 0n,
        max_send_count: 10n,
        updated_by: merchant.merchant_id,
      },
    });
    pendings.push(pending);
  }
  return pendings;
}

async function seedPendingDeliveryRemittances(
  merchants: Merchant[],
  banks: PrismaBank[],
) {
  console.log("Seeding PendingDeliveryRemittance...");
  const pendings = [];
  for (const merchant of merchants.slice(0, 5)) {
    const bank: PrismaBank = getRandomElement(banks);
    const pending = await prisma.pendingDeliveryRemittance.create({
      data: {
        transaction_date: formatDateYYYYMMDD(new Date()),
        transaction_id: faker.number.int({ min: 100000, max: 999999 }),
        van_id: "0",
        van_transaction_id: faker.string.alphanumeric(20),
        merchant_id: merchant.merchant_id,
        remittance_time: formatTimeHHMMSS(new Date()),
        bank_code: bank.bank_code,
        account_number: faker.finance.accountNumber(16),
        remittance_amount: faker.number.int({ min: 10000, max: 100000 }),
        remittance_type: "NORMAL",
        scheduled_send_time: faker.date.soon(),
        send_count: faker.number.int({ min: 0, max: 3 }),
        max_send_count: 10,
        updated_by: merchant.merchant_id,
      },
    });
    pendings.push(pending);
  }
  return pendings;
}

// Main seeding function
async function main() {
  const seeder = new Seeder(prisma, encryptionService);
  try {
    await seeder.cleanDatabase();
    const roles = await seeder.seedRoles();
    const adminRoleId =
      roles.find((r) => r.role_name === RoleName.ADMIN)?.role_id || 1;
    const merchantRoleId =
      roles.find((r) => r.role_name === RoleName.MERCHANT)?.role_id || 2;
    const agentRoleId =
      roles.find((r) => r.role_name === RoleName.AGENT)?.role_id || 3;
    const banks = await seeder.seedBanks();
    const superAdmin = await seeder.seedSuperAdmin(adminRoleId);
    const adminUsers = await seeder.seedAdmins(adminRoleId, CONFIG.NUM_ADMINS);
    adminUsers.unshift(superAdmin);
    const merchantGroups = await seeder.seedMerchantGroups(adminUsers);
    const unassignedAgents = await seeder.seedAgents(
      agentRoleId,
      [],
      adminUsers,
    );
    const merchants = await seeder.seedMerchants(
      merchantRoleId,
      merchantGroups,
      adminUsers,
      banks,
    );
    const assignedAgents = await seeder.seedAgents(
      agentRoleId,
      merchants,
      adminUsers,
    );
    const agents = [...unassignedAgents, ...assignedAgents];
    const virtualAccounts = await seeder.seedVirtualAccounts(merchants, banks);
    const { transactions, transactionReferences } =
      await seeder.seedTransactions(virtualAccounts, merchants);
    const withdrawals = await seeder.seedWithdrawals(
      merchants,
      agents,
      adminUsers,
    );
    const notices = await seeder.seedNotices(adminUsers);
    const qnas = await seeder.seedQna(merchants, agents, adminUsers);
    const allUsers = [
      ...adminUsers,
      ...merchants.map((m) => ({ user_id: m.merchant_id })),
      ...agents.map((a) => ({ user_id: a.agent_id })),
    ];
    const logs = await seeder.seedLogs(allUsers);
    const blacklistEntries = await seeder.seedBlacklist(adminUsers);
    const civilComplaints = await seeder.seedCivilComplaints(
      merchants,
      adminUsers,
    );
    await seeder.seedBankCodeMappings(banks);
    await seeder.seedExportFiles(adminUsers);
    await seeder.seedMerchantTransactionUris(merchants);
    await seeder.seedMerchantWallets(merchants);
    await seeder.seedMerchantTransactionInfos(merchants, banks);
    await seeder.seedRemittances(merchants, banks);
    await seeder.seedRemittanceSummaries(merchants);
    await seeder.seedTransactionSummaries(merchants);
    await seeder.seedPendingDeliveryTransactions(merchants, banks);
    await seeder.seedPendingDeliveryRemittances(merchants, banks);
    console.log("Database seeding completed successfully!");
    return {
      roles,
      banks,
      adminUsers,
      merchantGroups,
      merchants,
      agents,
      virtualAccounts,
      transactions: transactions.length,
      withdrawals: withdrawals.length,
      notices: notices.length,
      qnas: qnas.length,
      logs: logs.length,
      blacklistEntries: blacklistEntries.length,
      civilComplaints: civilComplaints.length,
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Wrap the main seeding logic in a class to avoid reloading env/config multiple times
class Seeder {
  prisma: typeof prisma;
  encryptionService: EncryptionService;
  constructor(
    prismaClient: typeof prisma,
    encryptionService: EncryptionService,
  ) {
    this.prisma = prismaClient;
    this.encryptionService = encryptionService;
  }

  async cleanDatabase() {
    await cleanDatabase();
  }

  async seedRoles() {
    return await seedRoles();
  }

  async seedBanks() {
    return await seedBanks();
  }

  async seedSuperAdmin(adminRoleId: number) {
    return await seedSuperAdmin(adminRoleId);
  }

  async seedAdmins(adminRoleId: number, count: number) {
    return await seedAdmins(adminRoleId, count);
  }

  async seedMerchantGroups(adminUsers: { user_id: string }[]) {
    return await seedMerchantGroups(adminUsers);
  }

  async seedMerchants(
    merchantRoleId: number,
    groups: { group_id: number; created_by: string }[],
    adminUsers: { user_id: string }[],
    banks: { bank_code: string }[],
  ) {
    return await seedMerchants(merchantRoleId, groups, adminUsers, banks);
  }

  async seedAgents(
    agentRoleId: number,
    merchants: { merchant_id: string }[],
    adminUsers: { user_id: string }[],
  ) {
    return await seedAgents(agentRoleId, merchants, adminUsers);
  }

  async seedVirtualAccounts(
    merchants: {
      merchant_id: string;
      status?: MerchantStatus;
      virtual_accounts_limit?: number;
    }[],
    banks: { bank_code: string }[],
  ) {
    return await seedVirtualAccounts(merchants, banks);
  }

  async seedTransactions(
    virtualAccounts: {
      merchant_id: string | null;
      bank_code: string;
      account_number: string;
    }[],
    merchants: { merchant_id: string }[],
  ) {
    return await seedTransactions(virtualAccounts, merchants);
  }

  async seedWithdrawals(
    merchants: { merchant_id: string }[],
    agents: {
      agent_id: string;
      withdrawal_bank_name: string | null;
      withdrawal_account_number: string | null;
      withdrawal_account_holder: string | null;
    }[],
    adminUsers: { user_id: string }[],
  ) {
    return await seedWithdrawals(merchants, agents, adminUsers);
  }

  async seedNotices(adminUsers: { user_id: string }[]) {
    return await seedNotices(adminUsers);
  }

  async seedQna(
    merchants: { merchant_id: string }[],
    agents: { agent_id: string }[],
    adminUsers: { user_id: string }[],
  ) {
    return await seedQna(merchants, agents, adminUsers);
  }

  async seedLogs(users: { user_id: string; [key: string]: unknown }[]) {
    return await seedLogs(users);
  }

  async seedBlacklist(adminUsers: { user_id: string }[]) {
    return await seedBlacklist(adminUsers);
  }

  async seedCivilComplaints(
    merchants: { merchant_id: string }[],
    adminUsers: { user_id: string }[],
  ) {
    return await seedCivilComplaints(merchants, adminUsers);
  }

  async seedBankCodeMappings(banks: PrismaBank[]) {
    return await seedBankCodeMappings(banks);
  }

  async seedExportFiles(adminUsers: User[]) {
    return await seedExportFiles(adminUsers);
  }

  async seedMerchantTransactionUris(merchants: Merchant[]) {
    return await seedMerchantTransactionUris(merchants);
  }

  async seedMerchantWallets(merchants: Merchant[]) {
    return await seedMerchantWallets(merchants);
  }

  async seedMerchantTransactionInfos(
    merchants: Merchant[],
    banks: PrismaBank[],
  ) {
    return await seedMerchantTransactionInfos(merchants, banks);
  }

  async seedRemittances(merchants: Merchant[], banks: PrismaBank[]) {
    return await seedRemittances(merchants, banks);
  }

  async seedRemittanceSummaries(merchants: Merchant[]) {
    return await seedRemittanceSummaries(merchants);
  }

  async seedTransactionSummaries(merchants: Merchant[]) {
    return await seedTransactionSummaries(merchants);
  }

  async seedPendingDeliveryTransactions(
    merchants: Merchant[],
    banks: PrismaBank[],
  ) {
    return await seedPendingDeliveryTransactions(merchants, banks);
  }

  async seedPendingDeliveryRemittances(
    merchants: Merchant[],
    banks: PrismaBank[],
  ) {
    return await seedPendingDeliveryRemittances(merchants, banks);
  }
}

// Remove MockConfigService and use real ConfigService
const configService = new AppConfigService(new ConfigService());
const encryptionService = new EncryptionService(configService);

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
