import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { AdminAdminsService } from "../../admins/admin-admins.service";

/**
 * Guard for superadmin users
 *
 * This guard ensures that only superadmin users can access certain routes.
 * It uses the centralized AdminAdminsService to check if the user is a superadmin.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly adminService: AdminAdminsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Use the centralized service to check for superadmin
    if (!user || !(await this.adminService.isSuperAdmin(user.userId))) {
      throw new ForbiddenException(
        "This action requires superadmin privileges.",
      );
    }
    return true;
  }
}
