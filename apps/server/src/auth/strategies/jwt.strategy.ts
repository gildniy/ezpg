import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppConfigService } from "../../config/app-config.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { AuthService } from "../auth.service";
import { Request } from "express";
import { JwtUser } from "../interfaces/jwt-user.interface";
import { PrismaService, RoleName } from "@ezpg/database";

// Helper function to extract JWT from cookie
const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies.access_token || null;
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: AppConfigService,
    private readonly authService: AuthService, // Inject AuthService or UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      secretOrKey: configService.jwtSecret,
      ignoreExpiration: false,
    });
    this.logger.log("JwtStrategy initialized");
  }

  // This method is called by Passport after verifying the token's signature and expiration
  async validate(payload: JwtPayload): Promise<JwtUser> {
    // Get the user from the database to verify they still exist and are active
    const user = await this.authService.validateUserByIdForJwt(payload.userId);

    if (!user) {
      throw new UnauthorizedException("User not found or inactive");
    }

    // Return the user information that will be accessible in @CurrentUser() decorator
    return {
      userId: user.user_id,
      username: user.username,
      role: payload.role, // Use the role from the payload to avoid potential type issues
      tfaVerified: payload.tfaVerified, // Pass TFA status along
      firstLogin: user.first_login, // Pass first login status
      tfaSecret: user.tfa_secret || undefined, // Pass the TFA secret if exists
    };
  }
}
