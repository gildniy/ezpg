import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";
import { ComplaintQueryDto } from "./dto/complaint-query.dto";
import {
  CivilComplaint,
  ComplaintStatus as PrismaComplaintStatus,
  LogSeverity,
  Merchant,
  Prisma,
  PrismaService,
  User,
} from "@ezpg/database";
// import { LogSeverity } from "../../core/logging/log-severity.enum";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { LoggingService } from "../../core/logging/logging.service";
import { ComplaintResponseDto } from "./dto/complaint-response.dto";
import { JwtUser } from "src/auth/interfaces/jwt-user.interface";
import { LogAction } from "src/core/logging/log-action.enum";

// Interface for complaint with included relations
interface ComplaintWithRelations extends CivilComplaint {
  merchant?: Pick<Merchant, "merchant_id" | "affiliate">;
  handler?: Pick<User, "user_id" | "username">;
}

@Injectable()
export class AdminComplaintsService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggingService,
  ) {}

  async create(
    dto: CreateComplaintDto,
    adminuserId: string,
  ): Promise<ComplaintResponseDto> {
    const merchant = await this.prisma.merchant.findUnique({
      where: {
        merchant_id: String(dto.merchantInternalId),
        deleted_at: null,
      },
    });
    if (!merchant)
      throw new NotFoundException(
        `Merchant with internal ID ${dto.merchantInternalId} not found.`,
      );

    const newComplaint = await this.prisma.civilComplaint.create({
      data: {
        merchant_id: String(dto.merchantInternalId),
        details: dto.details,
        complainant_name: dto.complainantName,
        related_account_number: dto.relatedAccountNumber,
        amount_deducted: dto.amountDeducted, // Stored as Decimal
        final_amount: dto.finalAmount, // Stored as Decimal
        created_by: adminuserId,
        status: PrismaComplaintStatus.PENDING,
        resolved_at: null,
      },
    });
    this.logger.logUserAction(
      { userId: adminuserId } as JwtUser,
      LogAction.ADMIN_COMPLAINT_CREATE,
      LogSeverity.INFO,
      "civil_complaint",
      newComplaint.complaint_id,
      { merchantId: merchant.merchant_id },
    );

    return {
      complaintId: newComplaint.complaint_id,
      merchantId: merchant.merchant_id,
      merchantName: merchant.affiliate,
      details: newComplaint.details,
      complainantName: newComplaint.complainant_name,
      status: newComplaint.status,
      createdAt: newComplaint.created_at,
      resolvedAt: newComplaint.resolved_at,
      amountDeducted: newComplaint.amount_deducted
        ? Number(newComplaint.amount_deducted)
        : null,
      finalAmount: newComplaint.final_amount
        ? Number(newComplaint.final_amount)
        : null,
    };
  }

  async findAll(
    query: ComplaintQueryDto,
  ): Promise<PaginatedResult<ComplaintResponseDto>> {
    const {
      page,
      limit,
      skip,
      orderBy,
      search,
      startDate,
      endDate,
      status,
      merchantInternalId,
    } = query;
    const where: Prisma.CivilComplaintWhereInput = {};

    if (status) where.status = status;
    if (merchantInternalId) where.merchant_id = String(merchantInternalId);
    if (startDate) where.created_at = { gte: new Date(startDate) };
    if (endDate)
      where.created_at = { lte: new Date(endDate + "T23:59:59.999Z") };
    if (search) {
      where.OR = [
        { details: { contains: search, mode: "insensitive" } },
        { complainant_name: { contains: search, mode: "insensitive" } },
        { related_account_number: { contains: search, mode: "insensitive" } },
        {
          merchants: {
            is: {
              affiliate: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    try {
      const totalItems = await this.prisma.civilComplaint.count({ where });
      const complaints = await this.prisma.civilComplaint.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          merchants: { select: { merchant_id: true, affiliate: true } },
          handler: { select: { user_id: true, username: true } },
        },
      });

      const safeComplaints = complaints.map((c) => this.formatDecimalFields(c));

      return {
        data: safeComplaints,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      };
    } catch (error) {
      let stack: string | undefined;
      let message = "Failed to retrieve complaints.";
      if (error instanceof Error) {
        stack = error.stack;
        message += `: ${error.message}`;
      }
      this.logger.error(
        LogSeverity.ERROR,
        "AdminComplaintsService",
        LogAction.ADMIN_COMPLAINT_OPERATION_FAILED,
        message,
        null,
        stack,
      );
      throw new InternalServerErrorException(`Failed to retrieve complaints.`);
    }
  }

  async findOne(id: number): Promise<ComplaintResponseDto> {
    const complaint = await this.prisma.civilComplaint.findUnique({
      where: { complaint_id: id },
      include: {
        merchants: { select: { merchant_id: true, affiliate: true } },
        handler: { select: { user_id: true, username: true } },
      },
    });
    if (!complaint)
      throw new NotFoundException(`Complaint with ID ${id} not found.`);
    return this.formatDecimalFields(complaint);
  }

  async update(
    id: number,
    dto: UpdateComplaintDto,
    adminUser: JwtUser,
  ): Promise<ComplaintResponseDto> {
    const { status, ...updateData } = dto;
    const prismaUpdateData: Prisma.CivilComplaintUpdateInput = {
      ...updateData,
    };

    if (status) {
      prismaUpdateData.status = status;
      if (
        status === PrismaComplaintStatus.RESOLVED ||
        status === PrismaComplaintStatus.REJECTED
      ) {
        prismaUpdateData.resolved_at = new Date();
      } else {
        prismaUpdateData.resolved_at = null;
      }
    }
    // Update handler? Only if reassigning.
    // prismaUpdateData.handler = { connect: { user_id: adminUserId } };

    try {
      const updatedComplaint = await this.prisma.civilComplaint.update({
        where: { complaint_id: id },
        data: prismaUpdateData,
      });
      this.logger.logUserAction(
        adminUser,
        LogAction.ADMIN_COMPLAINT_UPDATE,
        LogSeverity.INFO,
        "civil_complaint",
        id,
        { changes: dto },
      );

      const merchant = await this.prisma.merchant.findUnique({
        where: { merchant_id: updatedComplaint.merchant_id },
      });

      return {
        complaintId: updatedComplaint.complaint_id,
        merchantId: merchant.merchant_id,
        merchantName: merchant.affiliate,
        details: updatedComplaint.details,
        complainantName: updatedComplaint.complainant_name,
        relatedAccountNumber: updatedComplaint.related_account_number,
        status: updatedComplaint.status,
        createdAt: updatedComplaint.created_at,
        resolvedAt: updatedComplaint.resolved_at,
        amountDeducted: updatedComplaint.amount_deducted
          ? Number(updatedComplaint.amount_deducted)
          : null,
        finalAmount: updatedComplaint.final_amount
          ? Number(updatedComplaint.final_amount)
          : null,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException(`Complaint with ID ${id} not found.`);
      }
      let stack: string | undefined;
      let message = `Failed to update complaint.`;
      if (error instanceof Error) {
        stack = error.stack;
        message = `Failed to update complaint ${id}: ${error.message}`;
      }
      this.logger.error(
        LogSeverity.ERROR,
        "AdminComplaintsService",
        LogAction.ADMIN_COMPLAINT_OPERATION_FAILED,
        message,
        adminUser.userId,
        stack,
      );
      throw new InternalServerErrorException(`Failed to update complaint.`);
    }
  }

  // Helper to convert Decimal fields to numbers for response
  private formatDecimalFields(
    complaint: ComplaintWithRelations,
  ): ComplaintResponseDto {
    return {
      complaintId: complaint.complaint_id,
      merchantId: complaint.merchant?.merchant_id,
      merchantName: complaint.merchant?.affiliate,
      details: complaint.details,
      complainantName: complaint.complainant_name,
      relatedAccountNumber: complaint.related_account_number,
      status: complaint.status,
      handledBy: complaint.handler?.user_id || complaint.created_by,
      handlerUsername: complaint.handler?.username,
      createdAt: complaint.created_at,
      resolvedAt: complaint.resolved_at,
      amountDeducted: complaint.amount_deducted
        ? Number(complaint.amount_deducted)
        : null,
      finalAmount: complaint.final_amount
        ? Number(complaint.final_amount)
        : null,
    };
  }
}
