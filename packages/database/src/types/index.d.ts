import { PrismaClient as OriginalPrismaClient } from "@prisma/client";

declare global {
  namespace Prisma {
    interface PrismaClient extends OriginalPrismaClient {
      // Database models
      user: any;
      merchant: any;
      agent: any;
      merchantGroup: any;
      admin: any;
      role: any;
      transaction: any;
      virtualAccount: any;
      withdrawal: any;
      transactionSummary: any;
      balanceLogs: any;
      civilComplaint: any;
      log: any;
      notice: any;
      qna: any;
      bank: any;
      merchantWallet: any;
      merchantFee: any;
      merchantTransactionUri: any;
      exportFile: any;
      blacklist: any;

      // Raw query methods
      $queryRaw: any;
      $executeRaw: any;
      $queryRawUnsafe: any;
      $transaction: any;
    }
  }
}
