import { Module } from "@nestjs/common";
import { AdminVirtualAccountsService } from "./admin-virtual-accounts.service";
import { AdminVirtualAccountsController } from "./admin-virtual-accounts.controller";
import { PrismaModule } from "@ezpg/database";
import { CoreModule } from "../../core/core.module";

@Module({
  imports: [PrismaModule, CoreModule], // Add CoreModule for Logging
  controllers: [AdminVirtualAccountsController],
  providers: [AdminVirtualAccountsService],
})
export class AdminVirtualAccountsModule {}
