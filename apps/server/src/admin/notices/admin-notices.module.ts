import { Module } from "@nestjs/common";
import { AdminNoticesService } from "./admin-notices.service";
import { AdminNoticesController } from "./admin-notices.controller";
import { PrismaModule } from "@ezpg/database";

@Module({
  imports: [PrismaModule],
  controllers: [AdminNoticesController],
  providers: [AdminNoticesService],
})
export class AdminNoticesModule {}
