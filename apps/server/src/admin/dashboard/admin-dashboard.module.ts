import { Module } from "@nestjs/common";
import { AdminDashboardService } from "./admin-dashboard.service";
import { AdminDashboardController } from "./admin-dashboard.controller";
import { PrismaModule } from "@ezpg/database";
import { CoreModule } from "../../core/core.module";
import { AdminAdminsModule } from "../admins/admin-admins.module";

@Module({
  imports: [PrismaModule, CoreModule, AdminAdminsModule],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}
