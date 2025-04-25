import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import * as cookie from "cookie";
import { JwtService } from "@nestjs/jwt";
import { AppConfigService } from "../../config/app-config.service";
import { AuthErrorCode } from "@ezpg/types";
import { TempJwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class TempJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: AppConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log("[TempJwtAuthGuard - Manual] canActivate CALLED");
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      console.log("[TempJwtAuthGuard - Manual] Token not found in cookie");
      throw new UnauthorizedException({
        message: "Missing temporary authentication token.",
        code: AuthErrorCode.TempTokenInvalid,
      });
    }

    try {
      console.log(
        "[TempJwtAuthGuard - Manual] Attempting to verify token:",
        token,
      );
      const payload: TempJwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.jwtTempSecret, // Use the specific temp secret
      });
      console.log(
        "[TempJwtAuthGuard - Manual] Token verification successful, payload:",
        payload,
      );
      // Attach the payload to the request object
      // We only need the userId for the verifyTfa controller method
      request["user"] = { userId: payload.userId };
    } catch (error) {
      // Check if error is an instance of Error to safely access properties
      if (error instanceof Error) {
        console.error(
          "[TempJwtAuthGuard - Manual] Token verification failed:",
          error.message,
        );
        if (error.name === "TokenExpiredError") {
          throw new UnauthorizedException({
            message: "Temporary session expired. Please log in again.",
            code: AuthErrorCode.TempTokenExpired,
          });
        } else {
          // Handle other JsonWebTokenErrors or generic errors
          throw new UnauthorizedException({
            message: "Invalid or expired temporary token.",
            code: AuthErrorCode.TempTokenInvalid, // Use invalid for other JWT errors
          });
        }
      } else {
        // Handle non-Error exceptions (e.g., strings thrown)
        console.error(
          "[TempJwtAuthGuard - Manual] Unknown error during token verification:",
          error,
        );
        throw new UnauthorizedException({
          message: "An unexpected error occurred during authentication.",
          code: AuthErrorCode.TempTokenInvalid, // Or a more generic code
        });
      }
    }
    return true; // Proceed if verification is successful
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    let token: string | undefined = undefined;
    if (request.cookies && request.cookies.temp_token) {
      console.log(
        "[TempJwtAuthGuard - Manual] Extracted token via req.cookies",
      );
      token = request.cookies.temp_token;
    } else if (request.headers.cookie) {
      try {
        const cookies = cookie.parse(request.headers.cookie);
        token = cookies["temp_token"];
        console.log(
          "[TempJwtAuthGuard - Manual] Extracted token via manual parse",
        );
      } catch (e) {
        console.error(
          "[TempJwtAuthGuard - Manual] Failed to parse cookie header",
          e,
        );
      }
    }
    console.log(
      "[TempJwtAuthGuard - Manual] Final extracted token:",
      token ? "Found" : "Not Found",
    );
    return token;
  }
}
