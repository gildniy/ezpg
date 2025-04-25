import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { TempJwtStrategy } from "./strategies/temp-jwt.strategy";
import { RefreshTokenStrategy } from "./strategies/refresh-token.strategy";
import { UsersModule } from "../users/users.module"; // Import UsersModule
import { CoreModule } from "../core/core.module"; // Import CoreModule for EncryptionService
import { PrismaModule } from "@ezpg/database"; // RESTORE PrismaModule import
import { TempJwtAuthGuard } from "./guards/temp-jwt-auth.guard"; // <-- Import the guard
import { ConfigModule, ConfigService } from "@ezpg/config"; // Import the correct ConfigModule/Service

@Module({
  imports: [
    PrismaModule, // RESTORED
    ConfigModule, // Ensure the correct ConfigModule is imported (should be global already)
    CoreModule, // Make EncryptionService available
    forwardRef(() => UsersModule), // Use forwardRef if UsersModule imports AuthModule
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule here if not global (it is global, but explicit import is okay)
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwt.secret, // Access nested config
        signOptions: { expiresIn: configService.jwt.accessTokenExpiration }, // Access nested config
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // Strategy for regular JWT
    TempJwtStrategy, // Strategy for temporary JWT (TFA step)
    RefreshTokenStrategy,
    TempJwtAuthGuard, // <-- Add the guard here
  ],
  exports: [AuthService, JwtModule, PassportModule], // Export services/modules needed elsewhere
})
export class AuthModule {}
