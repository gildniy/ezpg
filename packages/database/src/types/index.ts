import { PrismaClient, Prisma } from "@prisma/client";

export { PrismaClient, Prisma };
export type {
  User,
  Merchant,
  Agent,
  MerchantGroup,
  Admin,
  Role,
  Transaction,
  VirtualAccount,
  Withdrawal,
  TransactionSummary,
  BalanceLogs,
  CivilComplaint,
  Log,
  Notice,
  Qna,
  Bank,
  MerchantWallet,
  MerchantFee,
  MerchantTransactionUri,
  ExportFile,
  Blacklist,
} from "@prisma/client";

// Re-export Prisma namespace types
export type {
  PrismaClientOptions,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

// Re-export all enums from Prisma
export {
  RoleName,
  MerchantStatus,
  AgentStatus,
  WithdrawalMethod,
  WithdrawalStatus,
  EntityType,
  BalanceChangeType,
  NoticeType,
  NoticeStatus,
  QnaStatus,
  LogSeverity,
  BlacklistType,
  ComplaintStatus,
  MerchantGroupStatus,
  NotificationType,
  NotificationTime,
} from "@prisma/client";

// Export PrismaService
export { PrismaService } from "../prisma.service";
