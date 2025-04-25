import { Module } from "@nestjs/common";
import { AdminSettlementsService } from "./admin-settlements.service";
import { AdminSettlementsController } from "./admin-settlements.controller";
import { PrismaModule } from "@ezpg/database";
import { CoreModule } from "../../core/core.module";

@Module({
  imports: [PrismaModule, CoreModule], // Add CoreModule for Logging
  controllers: [AdminSettlementsController],
  providers: [AdminSettlementsService],
})
export class AdminSettlementsModule {}
