import { Module } from "@nestjs/common";
import { ConfigModule } from "@ezpg/config";
import { PrismaModule } from "@ezpg/database";
import { CoreModule } from "./core/core.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { AdminModule } from "./admin/admin.module";
import { MerchantModule } from "./merchant/merchant.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { TfaSessionGuard } from "./auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "./auth/guards/first-login.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { DownloadModule } from "./core/download/download.module";
import { IdGeneratorModule } from "./core/id-generator/id-generator.module";

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CoreModule,
    AuthModule,
    UsersModule,
    AdminModule,
    MerchantModule,
    DownloadModule,
    IdGeneratorModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../../../", "apps/server/upload"),
      serveRoot: "/upload",
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: "APP_GUARD",
      useClass: JwtAuthGuard,
    },
    {
      provide: "APP_GUARD",
      useClass: TfaSessionGuard,
    },
    {
      provide: "APP_GUARD",
      useClass: FirstLoginGuard,
    },
    {
      provide: "APP_GUARD",
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
