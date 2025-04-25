import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

import { Config } from "./config.types";

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {
    // Log for debugging
    console.log(
      "ConfigService initialized with NestConfigService:",
      !!this.nestConfigService,
    );
    // Log a sample value to make sure env variables are loaded
    try {
      const appName = this.nestConfigService.get("APP_NAME");
      console.log("APP_NAME from environment:", appName);
    } catch (err) {
      console.error("Failed to get APP_NAME:", err);
    }
  }

  get database(): Config["database"] {
    return {
      url: this.nestConfigService.getOrThrow<string>("DATABASE_URL"),
    };
  }

  get jwt(): Config["jwt"] {
    return {
      secret: this.nestConfigService.getOrThrow<string>("JWT_SECRET"),
      tempSecret: this.nestConfigService.getOrThrow<string>("JWT_TEMP_SECRET"),
      accessTokenExpiration: this.nestConfigService.get<string>(
        "JWT_ACCESS_TOKEN_EXPIRATION_TIME",
        "15m",
      ),
      tempTokenExpiration: this.nestConfigService.get<string>(
        "JWT_TEMP_TOKEN_EXPIRATION_TIME",
        "10m",
      ),
      refreshTokenSecret: this.nestConfigService.getOrThrow<string>(
        "JWT_REFRESH_TOKEN_SECRET",
      ),
      refreshTokenExpiration: this.nestConfigService.get<string>(
        "JWT_REFRESH_TOKEN_EXPIRATION_TIME",
        "7d",
      ),
    };
  }

  get tfa(): Config["tfa"] {
    return {
      encryptionKey:
        this.nestConfigService.getOrThrow<string>("TFA_ENCRYPTION_KEY"),
    };
  }

  get cors(): Config["cors"] {
    const origins = this.nestConfigService.get<string>(
      "ALLOWED_ORIGINS",
      "http://localhost:3000,http://localhost:8080",
    );
    return {
      allowedOrigins: origins.split(",").map((origin: string) => origin.trim()),
    };
  }

  get app(): Config["app"] {
    return {
      name: this.nestConfigService.get<string>(
        "APP_NAME",
        "EZPG_Payment_System",
      ),
      nodeEnv: this.nestConfigService.get<string>("NODE_ENV", "development"),
      port: this.nestConfigService.get<number>("PORT", 8080),
    };
  }
}
