import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AdminMerchantGroupsCreateDto,
  AdminMerchantGroupsResponseDto,
} from "./dto";
import {
  PrismaService,
  Prisma,
  LogSeverity,
  MerchantGroup,
  MerchantGroupStatus,
} from "@ezpg/database";
import { PaginatedResponse } from "../../common/dto/paginated-response.dto";
import { AdminAdminsService } from "../admins/admin-admins.service";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";
import { LogAction } from "../../core/logging/log-action.enum";
import { LoggingService } from "../../core/logging/logging.service";

type MerchantGroupWithCreator = MerchantGroup & {
  creator: { username: string };
  created_by: string;
  group_name: string;
  group_id: number;
  status: MerchantGroupStatus;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class AdminMerchantGroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminService: AdminAdminsService,
    private readonly logger: LoggingService,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
    skip?: number,
    search?: string,
    includeDeleted = false,
    onlyDeleted = false,
    user?: JwtUser,
    viewAsAdminId?: string,
  ): Promise<PaginatedResponse<AdminMerchantGroupsResponseDto>> {
    const take = limit;
    const actualSkip = skip ?? (page - 1) * take;

    let where = {
      AND: [
        search
          ? {
              OR: [{ group_name: { contains: search, mode: "insensitive" } }],
            }
          : {},
        includeDeleted
          ? {}
          : onlyDeleted
            ? { deleted_at: { not: null } }
            : { deleted_at: null },
      ],
    } as Prisma.MerchantGroupWhereInput;

    // Add user filter if provided
    if (user) {
      const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);
      const targetAdminId =
        isSuperAdmin && viewAsAdminId ? viewAsAdminId : user.userId;
      where = {
        ...where,
        created_by: targetAdminId,
      } as Prisma.MerchantGroupWhereInput;
    }

    const [total, items] = await Promise.all([
      this.prisma.merchantGroup.count({ where }),
      this.prisma.merchantGroup.findMany({
        where,
        skip: actualSkip,
        take,
        orderBy: { created_at: "desc" },
        include: {
          creator: {
            select: {
              username: true,
            },
          },
          _count: {
            select: {
              merchants: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const mappedItems = items.map((item) =>
      this.mapToResponseDto(item as MerchantGroupWithCreator),
    );

    const response = new PaginatedResponse<AdminMerchantGroupsResponseDto>();
    response.data = mappedItems;
    response.items = mappedItems;
    response.meta = {
      total,
      page,
      limit,
      totalPages,
    };
    response.currentPage = page;
    response.totalPages = totalPages;

    return response;
  }

  async findOne(id: number): Promise<AdminMerchantGroupsResponseDto> {
    const group = await this.prisma.merchantGroup.findUnique({
      where: { group_id: id },
      include: {
        creator: {
          select: {
            username: true,
          },
        },
        merchants: {
          where: { deleted_at: null } as Prisma.MerchantWhereInput,
          select: {
            merchant_id: true,
            company_name: true,
            status: true,
          },
        },
        _count: {
          select: {
            merchants: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Merchant group with ID ${id} not found`);
    }

    return this.mapToResponseDto(group as MerchantGroupWithCreator);
  }

  async create(
    createMerchantGroupDto: AdminMerchantGroupsCreateDto,
    user: JwtUser,
  ): Promise<AdminMerchantGroupsResponseDto> {
    const { groupName, status } = createMerchantGroupDto;

    const group = await this.prisma.merchantGroup.create({
      data: {
        group_name: groupName,
        status,
        created_by: user.userId,
      },
      include: {
        creator: {
          select: {
            username: true,
          },
        },
      },
    });

    this.logger.logUserAction(
      user,
      LogAction.MERCHANT_GROUP_CREATE,
      LogSeverity.INFO,
      "merchant_group",
      group.group_id,
      { groupName },
    );

    return this.mapToResponseDto(group as MerchantGroupWithCreator);
  }

  async remove(id: number, user: JwtUser): Promise<void> {
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.userId);

    // Check if group exists and get its details
    const existingGroup = await this.prisma.findActiveMerchantGroup(id);

    if (!existingGroup) {
      throw new NotFoundException(`Merchant group with ID ${id} not found.`);
    }

    if (!isSuperAdmin && existingGroup.created_by !== user.userId) {
      throw new ForbiddenException(
        "You do not have access to delete this merchant group.",
      );
    }

    // Check if group has active merchants
    const activeMerchants = await this.prisma.merchant.count({
      where: {
        group_id: id,
        deleted_at: null,
      } as Prisma.MerchantWhereInput,
    });

    if (activeMerchants > 0) {
      throw new ForbiddenException(
        "Cannot delete a merchant group that has active merchants.",
      );
    }

    await this.prisma.softDeleteMerchantGroup(id);

    this.logger.logUserAction(
      user,
      LogAction.MERCHANT_GROUP_DELETE,
      LogSeverity.INFO,
      "merchant_group",
      id,
      { groupName: existingGroup.group_name },
    );
  }

  private mapToResponseDto(
    group: MerchantGroupWithCreator,
  ): AdminMerchantGroupsResponseDto {
    return {
      groupId: group.group_id,
      groupName: group.group_name,
      status: group.status,
      creatorUsername: group.creator.username,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
    };
  }
}
