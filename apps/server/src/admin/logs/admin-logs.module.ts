import { Module } from "@nestjs/common";
import { AdminLogsService } from "./admin-logs.service";
import { AdminLogsController } from "./admin-logs.controller";
import { PrismaModule } from "@ezpg/database";

@Module({
  imports: [PrismaModule],
  controllers: [AdminLogsController],
  providers: [AdminLogsService],
})
export class AdminLogsModule {}
