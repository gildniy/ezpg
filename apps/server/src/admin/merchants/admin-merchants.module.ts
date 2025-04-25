import { Module } from "@nestjs/common";
import { AdminMerchantsService } from "./admin-merchants.service";
import { AdminMerchantsController } from "./admin-merchants.controller";
import { PrismaModule } from "@ezpg/database";
import { AdminUsersModule } from "../users/admin-users.module";
import { CoreModule } from "../../core/core.module";
import { DownloadModule } from "../../core/download/download.module";
import { AdminAdminsModule } from "../admins/admin-admins.module";
import { EncryptionModule } from "../../core/encryption/encryption.module";
import { TfaModule } from "../../core/tfa/tfa.module";

/**
 * Module for handling merchant-related functionality in the admin panel.
 * Provides services for creating, managing, and monitoring merchants.
 */
@Module({
  imports: [
    PrismaModule,
    CoreModule,
    AdminUsersModule,
    DownloadModule,
    AdminAdminsModule,
    EncryptionModule,
    TfaModule,
  ],
  controllers: [AdminMerchantsController],
  providers: [AdminMerchantsService],
  exports: [AdminMerchantsService],
})
export class AdminMerchantsModule {}
