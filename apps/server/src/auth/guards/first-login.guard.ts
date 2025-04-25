import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class FirstLoginGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Allow access if no user object or not first login
    if (!user || !user.firstLogin) {
      return true;
    }

    // If it IS the first login, check if TFA is required and verified
    // This guard assumes TfaSessionGuard runs *before* it if TFA is mandatory
    if (user.tfaSecret && !user.tfaVerified) {
      // TfaSessionGuard should have already blocked or allowed specific routes
      // If we reach here, it implies TfaSessionGuard allowed it (e.g., verify-tfa route)
      return true;
    }

    // If first login AND (TFA not enabled OR TFA is verified)
    // Only allow access to the dedicated first login password set route
    const isSetPasswordFirstLoginRoute = request.path?.includes(
      "/auth/set-password-first-login",
    );

    if (!isSetPasswordFirstLoginRoute) {
      throw new ForbiddenException(
        "Password change required after first login.",
      );
    }

    // Allow access to password change route during first login
    return true;
  }
}
