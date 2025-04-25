import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService, RoleName } from "@ezpg/database";

@Injectable()
export class ExportFileGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const filename = request.params.filename;

    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    // Find the file metadata
    const fileMetadata = await this.prisma.exportFile.findUnique({
      where: { filename },
      include: { admin: true },
    });

    if (!fileMetadata) {
      throw new ForbiddenException("File not found");
    }

    // Check if file has expired
    if (new Date() > fileMetadata.expires_at) {
      throw new ForbiddenException("File has expired");
    }

    // Get the admin's role
    const adminUser = await this.prisma.user.findUnique({
      where: { user_id: user.userId },
      include: { role: true },
    });

    if (!adminUser) {
      throw new ForbiddenException("User not found");
    }

    // Allow access if:
    // 1. User is the admin who created the file
    // 2. User is a superadmin (has ADMIN role)
    if (
      user.userId === fileMetadata.admin_id ||
      adminUser.role.role_name === RoleName.ADMIN
    ) {
      return true;
    }

    throw new ForbiddenException(
      "You do not have permission to access this file",
    );
  }
}
