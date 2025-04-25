import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { LogSeverity, PrismaService, RoleName } from "@ezpg/database";
import { LoggingService } from "../../core/logging/logging.service";
import { LogAction } from "../../core/logging/log-action.enum";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";

/**
 * Service for managing admin entity operations
 * Handles creating Admin entity records when admin users are created
 */
@Injectable()
export class AdminAdminsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggingService,
  ) {}

  /**
   * Creates an Admin entity for a user with Admin role
   * This should be called after a user with Admin role is created
   *
   * @param adminId The admin user's ID
   * @param isSuperAdmin Whether this admin is a super admin
   * @param createdBy The ID of the admin that created this admin
   * @returns The created Admin entity
   */
  async createAdmin(
    adminId: string,
    isSuperAdmin: boolean = false,
    createdBy: string,
  ): Promise<{ admin_id: string }> {
    try {
      // Check if user exists and has admin role
      const user = await this.prisma.user.findUnique({
        where: {
          user_id: adminId,
          role: { role_name: RoleName.ADMIN },
        },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${adminId} not found or is not an admin.`,
        );
      }

      // Check if an Admin entity already exists for this user
      const existingAdmin = await this.prisma.admin.findUnique({
        where: { admin_id: adminId },
      });

      if (existingAdmin) {
        return { admin_id: existingAdmin.admin_id };
      }

      // Create the Admin entity
      const admin = await this.prisma.admin.create({
        data: {
          admin_id: adminId,
          is_super: isSuperAdmin,
        },
      });

      // Log the creation
      this.logger.logUserAction(
        { userId: createdBy } as JwtUser,
        LogAction.USER_CREATED,
        LogSeverity.INFO,
        "user",
        admin.admin_id,
        { isSuperAdmin },
      );

      return { admin_id: admin.admin_id };
    } catch (error) {
      this.logger.standardError(
        `Failed to create admin entity: ${(error as Error).message}`,
        (error as Error).stack,
        "AdminAdminsService",
      );
      throw new InternalServerErrorException("Failed to create admin entity");
    }
  }

  /**
   * Checks if a user is a superadmin by querying the admin table
   *
   * @param userId The user ID to check
   * @returns Promise resolving to true if the user is a superadmin, false otherwise
   */
  async isSuperAdmin(userId: string): Promise<boolean> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { admin_id: userId },
        select: { is_super: true },
      });

      return admin?.is_super || false;
    } catch (error) {
      this.logger.standardError(
        `Failed to check superadmin status: ${(error as Error).message}`,
        (error as Error).stack,
        "AdminAdminsService",
      );
      // Default to false on error for security reasons
      return false;
    }
  }
}
