console.log("--- temp-jwt.strategy.ts MODULE V7 TESTING RELOAD ---"); // <-- ADD TOP-LEVEL LOG
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { AppConfigService } from "../../config/app-config.service";
import { TempJwtPayload } from "../interfaces/jwt-payload.interface"; // Use a specific interface if needed
import { Request } from "express";
import { UsersService } from "../../users/users.service";
import * as cookie from "cookie"; // Uncomment manual parsing

@Injectable()
export class TempJwtStrategy extends PassportStrategy(Strategy, "jwt-temp") {
  // Name this strategy 'jwt-temp'
  constructor(
    private readonly configService: AppConfigService,
    private usersService: UsersService,
  ) {
    const secretForVerification = configService.jwtTempSecret; // Get secret
    console.log(
      "[TempJwtStrategy Constructor] Secret used for VERIFICATION (from config):",
      secretForVerification,
    );
    super({
      // jwtFromRequest: tempCookieExtractor, // <-- Use inline function instead
      jwtFromRequest: (req: Request): string | null => {
        // --- INLINE EXTRACTOR LOGIC ---
        console.log("--- INLINE EXTRACTOR V2 RUNNING ---"); // <-- V2
        console.log(
          "[Inline Extractor] Raw Cookie Header:",
          req.headers.cookie,
        );
        let token = null;
        if (req && req.cookies) {
          // Using req.cookies (via cookie-parser middleware)
          token = req.cookies["temp_token"];
          console.log("[Inline Extractor] Found token via req.cookies");
        }

        // Manual parsing (fallback / for curl)
        if (!token && req.headers.cookie) {
          try {
            const cookies = cookie.parse(req.headers.cookie);
            token = cookies["temp_token"];
            console.log("[Inline Extractor] Found token via manual parse");
          } catch (err) {
            console.error(
              "[Inline Extractor] Error parsing cookie header:",
              err,
            );
            token = null;
          }
        }

        console.log("[Inline Extractor] Token found?", token ? "Yes" : "No");
        console.log("[DEBUG Inline Extractor] Extracted token value:", token);
        return token;
        // --- END INLINE EXTRACTOR LOGIC ---
      },
      ignoreExpiration: false,
      secretOrKey: secretForVerification,
    });
  }

  async validate(payload: TempJwtPayload): Promise<TempJwtPayload> {
    // Payload for temp token might just contain { userId, iat, exp }
    console.log("[TempJwtStrategy] Validate method called.");
    console.log("[TempJwtStrategy] Validating payload:", payload);

    // Optional: Check if user exists and is active
    const user = await this.usersService.findActiveById(payload.userId);
    console.log(
      "[TempJwtStrategy] User lookup result:",
      user ? `Found user ${user.user_id}` : "User not found or inactive",
    );
    if (!user) {
      throw new UnauthorizedException("User not found for TFA verification.");
    }

    // Return minimal payload needed for the next step (TFA verification)
    return { userId: payload.userId };
  }
}
