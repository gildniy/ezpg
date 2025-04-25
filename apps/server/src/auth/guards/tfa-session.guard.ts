import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class TfaSessionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assumes user object is attached by JwtAuthGuard

    // Allow access if no user object (e.g., public route handled earlier)
    // Or if TFA is not enabled for the user (no tfa_secret)
    if (!user || !user.tfaSecret) {
      return true;
    }

    // If TFA is enabled, check if it has been verified in this session
    if (user.tfaSecret && !user.tfaVerified) {
      // Allow access ONLY to the TFA verification endpoint or password change if first login
      const isTfaVerificationRoute = request.path?.includes("/auth/verify-tfa"); // Adjust path check as needed
      const isPasswordChangeRoute = request.path?.includes(
        "/auth/change-password",
      );

      if (
        isTfaVerificationRoute ||
        (user.firstLogin && isPasswordChangeRoute)
      ) {
        return true;
      } else {
        throw new ForbiddenException(
          "TFA verification required for this session.",
        );
      }
    }

    // If TFA is enabled AND verified, allow access
    return true;
  }
}
