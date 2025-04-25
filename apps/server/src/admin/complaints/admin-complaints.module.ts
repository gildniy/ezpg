import { Module } from "@nestjs/common";
import { AdminComplaintsService } from "./admin-complaints.service";
import { AdminComplaintsController } from "./admin-complaints.controller";
import { PrismaModule } from "@ezpg/database";
import { CoreModule } from "../../core/core.module";

@Module({
  imports: [PrismaModule, CoreModule], // Add CoreModule for Logging
  controllers: [AdminComplaintsController],
  providers: [AdminComplaintsService],
})
export class AdminComplaintsModule {}
