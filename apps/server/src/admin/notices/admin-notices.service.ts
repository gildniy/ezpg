import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { LogSeverity, Prisma, PrismaService } from "@ezpg/database";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { UpdateNoticeDto } from "./dto/update-notice.dto";
import { NoticeQueryDto } from "./dto/notice-query.dto";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { NoticeResponseDto } from "./dto/notice-response.dto";
import { plainToClass } from "class-transformer";
import { LoggingService } from "../../core/logging/logging.service";
import { LogAction } from "../../core/logging/log-action.enum";

@Injectable()
export class AdminNoticesService {
  constructor(
    private prisma: PrismaService,
    private loggingService: LoggingService,
  ) {}

  async create(
    dto: CreateNoticeDto,
    authorUserId: string,
  ): Promise<NoticeResponseDto> {
    try {
      const newNotice = await this.prisma.notice.create({
        data: { ...dto, author_user_id: authorUserId },
        include: { author: { select: { user_id: true, username: true } } },
      });

      return this.mapToNoticeResponseDto(newNotice);
    } catch (error) {
      this.loggingService.error(
        LogSeverity.ERROR,
        "AdminNoticesService",
        LogAction.NOTICE_CREATE,
        `Failed to create notice: ${(error as Error).message}`,
      );
      throw new InternalServerErrorException("Failed to create notice");
    }
  }

  async findAll(
    query: NoticeQueryDto,
  ): Promise<PaginatedResult<NoticeResponseDto>> {
    const { page, limit, skip, orderBy, type, status } = query;
    const where: Prisma.NoticeWhereInput = {};
    if (type) where.type = type;
    if (status) where.status = status;

    try {
      const totalItems = await this.prisma.notice.count({ where });
      const notices = await this.prisma.notice.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { author: { select: { user_id: true, username: true } } },
      });
      return {
        data: notices.map((notice) => ({
          ...notice,
          is_pinned: false,
          created_by: notice.author_user_id,
          author_username: notice.author.username,
        })),
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      };
    } catch (error) {
      this.loggingService.error(
        LogSeverity.ERROR,
        "AdminNoticesService",
        LogAction.SYSTEM,
        `Failed to retrieve notices: ${(error as Error).message}`,
      );
      throw new Error(
        `Failed to retrieve notices: ${(error as Error).message}`,
      );
    }
  }

  async findOne(id: number): Promise<NoticeResponseDto> {
    const notice = await this.prisma.notice.findUnique({
      where: { notice_id: id },
      include: { author: { select: { user_id: true, username: true } } },
    });
    if (!notice) throw new NotFoundException(`Notice with ID ${id} not found.`);
    return plainToClass(NoticeResponseDto, notice, { strategy: "excludeAll" });
  }

  async update(
    id: number,
    dto: UpdateNoticeDto,
    adminuserId: string,
  ): Promise<NoticeResponseDto> {
    try {
      const updatedNotice = await this.prisma.notice.update({
        where: { notice_id: id },
        data: dto,
      });
      this.loggingService.info(
        LogSeverity.INFO,
        "AdminNoticesService",
        LogAction.NOTICE_UPDATE,
        `Notice ${id} updated by admin ${adminuserId}`,
      );
      return plainToClass(NoticeResponseDto, updatedNotice, {
        strategy: "excludeAll",
      });
    } catch (error) {
      this.loggingService.error(
        LogSeverity.ERROR,
        "AdminNoticesService",
        LogAction.NOTICE_UPDATE,
        `Failed to update notice: ${(error as Error).message}`,
      );
      throw new Error(`Failed to update notice: ${(error as Error).message}`);
    }
  }

  async remove(id: number, adminuserId: string): Promise<void> {
    try {
      await this.prisma.notice.delete({ where: { notice_id: id } });
      this.loggingService.info(
        LogSeverity.INFO,
        "AdminNoticesService",
        LogAction.NOTICE_DELETE,
        `Notice ${id} deleted by admin ${adminuserId}`,
      );
    } catch (error) {
      this.loggingService.error(
        LogSeverity.ERROR,
        "AdminNoticesService",
        LogAction.NOTICE_DELETE,
        `Failed to delete notice: ${(error as Error).message}`,
      );
      throw new Error(`Failed to delete notice: ${(error as Error).message}`);
    }
  }

  private mapToNoticeResponseDto(
    notice: Prisma.NoticeGetPayload<{
      include: { author: { select: { user_id: true; username: true } } };
    }>,
  ): NoticeResponseDto {
    return plainToClass(NoticeResponseDto, notice, { strategy: "excludeAll" });
  }
}
