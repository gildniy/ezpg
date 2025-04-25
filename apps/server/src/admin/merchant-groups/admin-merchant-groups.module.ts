import { Module } from "@nestjs/common";
import { PrismaModule } from "@ezpg/database";
import { LoggingModule } from "../../core/logging/logging.module";
import { BankModule } from "../../core/bank/bank.module";
import { AdminAdminsModule } from "../admins/admin-admins.module";
import { AdminMerchantGroupsService } from "./admin-merchant-groups.service";
import { AdminMerchantGroupsController } from "./admin-merchant-groups.controller";

@Module({
  imports: [PrismaModule, LoggingModule, BankModule, AdminAdminsModule],
  controllers: [AdminMerchantGroupsController],
  providers: [AdminMerchantGroupsService],
  exports: [AdminMerchantGroupsService],
})
export class AdminMerchantGroupsModule {}
