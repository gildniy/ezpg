import { Injectable } from "@nestjs/common";
import { AdminSettlementQueryDto } from "./dto/settlement-query.dto";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import {
  EntityType,
  LogSeverity,
  Prisma,
  PrismaService,
  WithdrawalStatus as AdminWithdrawalStatus,
} from "@ezpg/database";
import { Decimal } from "@prisma/client/runtime/library";
import { LoggingService } from "../../core/logging/logging.service";
// import { LogSeverity } from "../../core/logging/log-severity.enum";
import { LogAction } from "../../core/logging/log-action.enum";

interface AdminDailySettlementData {
  date: string;
  merchantId: string; // Added merchant ID
  merchantName?: string; // Added merchant Name
  depositAmount: number;
  depositCount: number;
  cancelAmount: number;
  cancelCount: number;
  totalWithdrawalAmount: number;
  // Add calculated fees if needed (requires fetching merchant fee settings)
}

interface MerchantInfo {
  name: string;
  merchantId: string;
}

@Injectable()
export class AdminSettlementsService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggingService,
  ) {}

  async getSettlementReport(
    query: AdminSettlementQueryDto,
  ): Promise<PaginatedResult<AdminDailySettlementData>> {
    const {
      page,
      limit,
      skip,
      endDate,
      merchantId,
      orderBy: queryOrderBy,
    } = query;

    // Use endDate if provided, otherwise use today's date
    const today = new Date().toISOString().split("T")[0];
    const filterDate = endDate || today;
    const endDateStr = filterDate.replace(/-/g, "");

    // --- Query Read-Only Transaction Summary ---
    const summaryWhere: Prisma.TransactionSummaryWhereInput = {};
    if (merchantId) summaryWhere.merchant_id = merchantId;
    if (endDateStr) summaryWhere.transaction_date = { lte: endDateStr };

    const summaryOrderBy: Prisma.TransactionSummaryOrderByWithRelationInput =
      {};
    if (queryOrderBy && queryOrderBy.transaction_date)
      summaryOrderBy.transaction_date = queryOrderBy.transaction_date;
    else if (queryOrderBy && queryOrderBy.merchant_id)
      summaryOrderBy.merchant_id = queryOrderBy.merchant_id;
    else summaryOrderBy.transaction_date = "desc"; // Default

    try {
      const totalItems = await this.prisma.transactionSummary.count({
        where: summaryWhere,
      });
      const summaries = await this.prisma.transactionSummary.findMany({
        where: summaryWhere,
        skip,
        take: limit,
        orderBy: summaryOrderBy,
      });

      // --- Fetch Merchant Names (Writable DB) ---
      const uniqueMerchantIds = [
        ...new Set(summaries.map((s) => s.merchant_id)),
      ];
      const merchants = await this.prisma.merchant.findMany({
        where: { merchant_id: { in: uniqueMerchantIds } },
        select: {
          merchant_id: true,
          affiliate: true,
        },
      });
      const merchantMap = new Map<string, MerchantInfo>(
        merchants.map((m) => [
          m.merchant_id,
          {
            name: m.affiliate,
            merchantId: m.merchant_id,
          },
        ]),
      );

      // --- Query Completed Withdrawals (Writable DB) ---
      const withdrawalWhere: Prisma.WithdrawalWhereInput = {
        entity_type: EntityType.MERCHANT,
        status: AdminWithdrawalStatus.COMPLETED,
      };
      // Filter by relevant merchant internal IDs and date range
      const relevantInternalIds = merchants.map((m) => m.merchant_id);
      if (relevantInternalIds.length > 0)
        withdrawalWhere.entity_id = { in: relevantInternalIds };
      else return { data: [], totalItems: 0, totalPages: 0, currentPage: page }; // No merchants found

      // Use the same filter date for withdrawals
      withdrawalWhere.processed_at = {
        lte: new Date(filterDate + "T23:59:59.999Z"),
      };

      const withdrawals = await this.prisma.withdrawal.groupBy({
        by: ["processed_at", "entity_id"], // Group by date AND merchant internal ID
        where: withdrawalWhere,
        _sum: { amount: true },
      });

      // Re-aggregate by date string and merchant internal ID
      const withdrawalsByDateAndMerchant: { [key: string]: Decimal } = {}; // Key: "YYYY-MM-DD_merchantInternalId"
      withdrawals.forEach((w) => {
        if (w.processed_at) {
          const dateStr = w.processed_at.toISOString().slice(0, 10);
          const key = `${dateStr}_${w.entity_id}`;
          const amount = new Decimal(w._sum.amount || 0);
          withdrawalsByDateAndMerchant[key] = (
            withdrawalsByDateAndMerchant[key] || new Decimal(0)
          ).plus(amount);
        }
      });

      // --- Combine Data ---
      const reportData = summaries.map((summary) => {
        const dateStr = summary.transaction_date.replace(
          /(\d{4})(\d{2})(\d{2})/,
          "$1-$2-$3",
        );
        const merchantInfo = merchantMap.get(summary.merchant_id);
        const withdrawalKey = `${dateStr}_${merchantInfo?.merchantId}`;
        const totalWithdrawal =
          withdrawalsByDateAndMerchant[withdrawalKey] || new Decimal(0);

        return {
          date: dateStr,
          merchantId: summary.merchant_id,
          merchantName: merchantInfo?.name,
          depositAmount: Number(summary.deposit_amount?.toString() ?? "0"),
          depositCount: Number(summary.deposit_count?.toString() ?? "0"),
          cancelAmount: Number(summary.cancel_amount?.toString() ?? "0"),
          cancelCount: Number(summary.cancel_count?.toString() ?? "0"),
          totalWithdrawalAmount: Number(totalWithdrawal),
          // Add fee calculations if needed
        };
      });

      return {
        data: reportData,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      };
    } catch (error) {
      this.logger.error(
        LogSeverity.ERROR,
        "AdminSettlementsService",
        LogAction.SYSTEM,
        `Get admin settlement report error: ${(error as Error).message}`,
        null,
        (error as Error).stack,
      );
      throw new Error(
        `Get admin settlement report error: ${(error as Error).message}`,
      );
    }
  }
}
