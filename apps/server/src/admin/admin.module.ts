import { Module } from "@nestjs/common";
import { AdminMerchantsModule } from "./merchants/admin-merchants.module";
import { AdminAgentsModule } from "./agents/admin-agents.module";
import { AdminMerchantGroupsModule } from "./merchant-groups/admin-merchant-groups.module";
import { AdminUsersModule } from "./users/admin-users.module";
import { AdminDashboardModule } from "./dashboard/admin-dashboard.module";
import { AdminDepositsModule } from "./deposits/admin-deposits.module";
import { AdminAdminsModule } from "./admins/admin-admins.module";
import { AdminWithdrawalsModule } from "./withdrawals/admin-withdrawals.module";

/**
 * Main admin module that imports all admin-related submodules
 */
@Module({
  imports: [
    AdminMerchantsModule,
    AdminAgentsModule,
    AdminWithdrawalsModule,
    AdminMerchantGroupsModule,
    AdminUsersModule,
    AdminDashboardModule,
    AdminDepositsModule,
    AdminAdminsModule,
  ],
  exports: [AdminAgentsModule, AdminAdminsModule],
})
export class AdminModule {}
