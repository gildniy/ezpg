// Optional: Create a typed service for accessing config values
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {
    // Log during startup to see what's loaded
    console.log(
      "[AppConfigService] Loaded JWT_TEMP_SECRET:",
      this.configService.get<string>("JWT_TEMP_SECRET"),
    );
  }

  get nodeEnv(): string {
    return this.configService.getOrThrow<string>("NODE_ENV");
  }

  get port(): number {
    return this.configService.getOrThrow<number>("PORT");
  }

  get allowedOrigins(): string[] {
    const origins = this.configService.getOrThrow<string>("ALLOWED_ORIGINS");
    return origins.split(",").map((origin) => origin.trim());
  }

  get jwtSecret(): string {
    return this.configService.getOrThrow<string>("JWT_SECRET");
  }

  get jwtTempSecret(): string {
    return this.configService.get<string>("JWT_TEMP_SECRET") || "";
  }

  get jwtAccessTokenExpirationTime(): string {
    return this.configService.getOrThrow<string>(
      "JWT_ACCESS_TOKEN_EXPIRATION_TIME",
    );
  }

  get jwtTempTokenExpirationTime(): string {
    return (
      this.configService.get<string>("JWT_TEMP_TOKEN_EXPIRATION_TIME") || "3m"
    );
  }

  get jwtFirstLoginSecret(): string {
    return (
      this.configService.get<string>("JWT_FIRST_LOGIN_SECRET") ||
      this.jwtTempSecret
    );
  }

  get jwtFirstLoginTokenExpirationTime(): string {
    return (
      this.configService.get<string>("JWT_FIRST_LOGIN_TOKEN_EXPIRATION_TIME") ||
      "10m"
    );
  }

  get jwtRefreshTokenSecret(): string {
    return this.configService.getOrThrow<string>("JWT_REFRESH_TOKEN_SECRET");
  }

  get jwtRefreshTokenExpirationTime(): string {
    return this.configService.getOrThrow<string>(
      "JWT_REFRESH_TOKEN_EXPIRATION_TIME",
    );
  }

  get tfaEncryptionKey(): string {
    return this.configService.getOrThrow<string>("TFA_ENCRYPTION_KEY");
  }

  get appName(): string {
    return this.configService.getOrThrow<string>("APP_NAME");
  }

  // Add getters for other config values (refresh tokens, etc.)
}
