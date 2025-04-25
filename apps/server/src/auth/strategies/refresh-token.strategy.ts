import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express"; // Import Request type
import { AppConfigService } from "../../config/app-config.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface"; // Reuse or create specific RefreshTokenPayload
import { AuthService } from "../auth.service";
import { JwtUser } from "../interfaces/jwt-user.interface";
import { RoleName } from "@ezpg/database";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  // Unique name 'jwt-refresh'
  constructor(
    private readonly configService: AppConfigService,
    private readonly authService: AuthService, // Needed to validate against stored hash
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refresh_token"),
      secretOrKey: configService.jwtRefreshTokenSecret,
      passReqToCallback: true, // Pass request to validate method
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtUser> {
    // Extract the refresh token from the request body
    const refreshToken = req.body.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token is required");
    }

    // Validate user exists, is active, and the refresh token matches the stored hash
    const user = await this.authService.validateUserForRefreshToken(
      payload.userId,
      refreshToken,
    );

    if (!user) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Return user object to attach to request
    return {
      userId: user.user_id,
      username: user.username,
      role: payload.role, // Use role from payload as it's already validated
      // If user has TFA enabled, don't auto-verify on refresh
      tfaVerified: !user.tfa_secret, // TFA is verified only if TFA is not enabled
      firstLogin: user.first_login,
      tfaSecret: user.tfa_secret || undefined,
    };
  }
}
