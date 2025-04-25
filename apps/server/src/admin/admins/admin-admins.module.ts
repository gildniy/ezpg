import { Module } from "@nestjs/common";
import { AdminAdminsService } from "./admin-admins.service";
import { AdminAdminsController } from "./admin-admins.controller";
import { IdGeneratorModule } from "../../core/id-generator/id-generator.module";
import { LoggingModule } from "../../core/logging/logging.module";
import { PrismaModule } from "@ezpg/database";

@Module({
  imports: [IdGeneratorModule, LoggingModule, PrismaModule],
  controllers: [AdminAdminsController],
  providers: [AdminAdminsService],
  exports: [AdminAdminsService],
})
export class AdminAdminsModule {}
