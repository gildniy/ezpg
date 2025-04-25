import { forwardRef, Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { PrismaModule } from "@ezpg/database"; // RESTORE PrismaModule import
import { AuthModule } from "../auth/auth.module"; // Import AuthModule if needed
import { CoreModule } from "../core/core.module"; // <-- Import CoreModule
import { AppConfigModule } from "../config/app-config.module"; // <-- Import AppConfigModule

@Module({
  imports: [
    PrismaModule,
    CoreModule,
    AppConfigModule,
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService],
  exports: [UsersService], // Export service for AuthModule to use
})
export class UsersModule {}
