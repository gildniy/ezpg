import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateBlacklistDto } from "./dto/create-blacklist.dto";
import { BlacklistQueryDto } from "./dto/blacklist-query.dto";
import { Blacklist, LogSeverity, Prisma, PrismaService } from "@ezpg/database";
// import { LogSeverity } from "../../core/logging/log-severity.enum";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { LoggingService } from "../../core/logging/logging.service";
import { BlacklistEntryDto } from "./dto/blacklist-response.dto";
import { JwtUser } from "src/auth/interfaces/jwt-user.interface";
import { LogAction } from "../../core/logging/log-action.enum";

@Injectable()
export class AdminBlacklistService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggingService,
  ) {}

  async create(
    dto: CreateBlacklistDto,
    currentAdmin: JwtUser,
  ): Promise<Blacklist & { created_by_username: string }> {
    const result = await this.prisma.blacklist.create({
      data: { ...dto, created_by: currentAdmin.userId },
    });
    this.logger.logUserAction(
      currentAdmin,
      LogAction.ADMIN_BLACKLIST_CREATE,
      LogSeverity.INFO,
      "blacklist",
      result.blacklist_id,
      {
        type: dto.type,
        value: dto.value,
      },
    );
    // Fetch the admin user details (assuming model is 'user')
    const adminUser = await this.prisma.user.findUnique({
      where: { user_id: currentAdmin.userId },
      select: { username: true },
    });

    // Add username to the result for the response
    return {
      ...result,
      created_by_username: adminUser?.username || "Unknown",
    };
  }

  async findAll(
    query: BlacklistQueryDto,
  ): Promise<PaginatedResult<BlacklistEntryDto>> {
    const { page, limit, skip, orderBy, search, type } = query;
    const where: Prisma.BlacklistWhereInput = {};
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { value: { contains: search, mode: "insensitive" } },
        { reason: { contains: search, mode: "insensitive" } },
      ];
    }

    try {
      const totalItems = await this.prisma.blacklist.count({ where });
      const entries = await this.prisma.blacklist.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { creator: { select: { user_id: true, username: true } } },
      });

      // Map entries to BlacklistEntryDto, adding the username
      const data: BlacklistEntryDto[] = entries.map((entry) => ({
        ...entry,
        created_by_username: entry.creator?.username || "Unknown",
      }));

      return {
        data,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      };
    } catch (error) {
      // Add type check
      let stack: string | undefined;
      let message = "Failed to retrieve blacklist.";
      if (error instanceof Error) {
        stack = error.stack;
        message += `: ${error.message}`;
      }
      this.logger.error(
        LogSeverity.ERROR,
        "AdminBlacklistService",
        LogAction.ADMIN_BLACKLIST_FIND_ALL_FAILED,
        message,
        null,
        stack,
      );
      throw new InternalServerErrorException(message);
    }
  }

  async remove(id: number, user: JwtUser): Promise<void> {
    try {
      const deletedEntry = await this.prisma.blacklist.delete({
        where: { blacklist_id: id },
      });
      this.logger.logUserAction(
        user,
        LogAction.ADMIN_BLACKLIST_DELETE,
        LogSeverity.INFO,
        "blacklist",
        id,
        {
          type: deletedEntry.type,
          value: deletedEntry.value,
        },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException(`Blacklist entry with ID ${id} not found.`);
      }
      // Add type check
      let stack: string | undefined;
      let message = `Failed to delete blacklist entry.`;
      if (error instanceof Error) {
        stack = error.stack;
        message = `Failed to delete blacklist entry ${id}: ${error.message}`;
      }
      this.logger.error(
        LogSeverity.ERROR,
        "AdminBlacklistService",
        LogAction.ADMIN_BLACKLIST_DELETE_FAILED,
        message,
        null,
        stack,
      );
      throw new InternalServerErrorException(
        `Failed to delete blacklist entry.`,
      );
    }
  }
}
