import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, PrismaService } from "@ezpg/database";
import { AnswerQnaDto } from "./dto/answer-qna.dto";
import { AdminQnaQueryDto } from "./dto/qna-query.dto";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { QnaResponseDto } from "./dto/qna-response.dto";
import { plainToClass } from "class-transformer";
import { LoggingService } from "../../common/logging/logging.service";
import { LogSeverity } from "@ezpg/database";
import { validate as uuidValidate } from "uuid";
import { QnaStatus, RoleName } from "@ezpg/database";

@Injectable()
export class AdminQnaService {
  constructor(
    private prisma: PrismaService,
    private loggingService: LoggingService,
  ) {}

  async findAll(
    query: AdminQnaQueryDto,
  ): Promise<PaginatedResult<QnaResponseDto>> {
    const { page, limit, skip, orderBy, status } = query;
    const where: Prisma.QnaWhereInput = {};
    if (status) where.status = status;

    try {
      const totalItems = await this.prisma.qna.count({ where });
      const qnaList = await this.prisma.qna.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          requester: { select: { user_id: true, username: true } },
          responder: { select: { user_id: true, username: true } },
        },
      });
      const transformedQnaList = qnaList.map((qna) => ({
        qna_id: qna.qna_id,
        merchant_internal_id: qna.qna_id,
        merchant_id: qna.requester_user_id,
        title: qna.subject,
        content: qna.question,
        status: qna.status,
        created_at: qna.created_at,
        answer: qna.answer,
        answered_by: qna.answered_by,
        admin_username: qna.responder?.username,
        answered_at: qna.answered_at,
      }));
      return {
        data: transformedQnaList,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      };
    } catch (error) {
      this.loggingService.error(
        LogSeverity.ERROR,
        "AdminQnaService",
        { error: (error as Error).message },
        "Failed to retrieve QnA list",
        null,
        `Failed to retrieve QnA list: ${(error as Error).message}`,
      );
      throw new Error(
        `Failed to retrieve QnA list: ${(error as Error).message}`,
      );
    }
  }

  async findOne(id: number): Promise<QnaResponseDto> {
    const qna = await this.prisma.qna.findUnique({
      where: { qna_id: id },
      include: {
        requester: { select: { user_id: true, username: true } },
        responder: { select: { user_id: true, username: true } },
      },
    });
    if (!qna) throw new NotFoundException(`QnA with ID ${id} not found.`);
    return plainToClass(QnaResponseDto, qna, { strategy: "excludeAll" });
  }

  async answer(
    id: number,
    dto: AnswerQnaDto,
    answeredBy: string,
  ): Promise<QnaResponseDto> {
    try {
      const qna = await this.prisma.qna.findUnique({ where: { qna_id: id } });
      if (!qna) {
        throw new NotFoundException(`QnA with ID ${id} not found`);
      }

      const updatedQna = await this.prisma.qna.update({
        where: { qna_id: id },
        data: {
          answer: dto.answer,
          answered_at: new Date(),
          answered_by: answeredBy,
          status: "ANSWERED",
        },
      });

      return this.mapToQnaResponseDto(updatedQna);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.loggingService.error(
        LogSeverity.ERROR,
        "AdminQnaService",
        { error: (error as Error).message },
        "Failed to answer QnA",
        null,
        `Failed to answer QnA: ${(error as Error).message}`,
      );
      throw new InternalServerErrorException("Failed to answer QnA");
    }
  }

  private mapToQnaResponseDto(qna: Prisma.QnaGetPayload<any>): QnaResponseDto {
    return plainToClass(QnaResponseDto, qna, { strategy: "excludeAll" });
  }
}
