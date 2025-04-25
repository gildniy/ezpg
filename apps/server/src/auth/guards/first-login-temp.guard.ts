import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { AppConfigService } from "../../config/app-config.service";
import { FirstLoginTempPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class FirstLoginTempGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: AppConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException("First login token not found");
    }

    try {
      const payload = this.jwtService.verify<FirstLoginTempPayload>(token, {
        secret: this.configService.jwtFirstLoginSecret,
      });

      // Verify this is specifically a first login password change token
      if (!payload || !payload.firstLoginPasswordChange) {
        throw new UnauthorizedException("Invalid first login token");
      }

      // Add user to request (limited info)
      request.user = {
        userId: payload.userId,
        firstLoginPasswordChange: true,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired first login token");
    }
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.first_login_token;
  }
}
