import { Module } from "@nestjs/common";
import { AdminCustomersService } from "./admin-customers.service";
import { AdminCustomersController } from "./admin-customers.controller";
import { PrismaModule } from "@ezpg/database";
import { CoreModule } from "../../core/core.module";

@Module({
  imports: [PrismaModule, CoreModule], // Add CoreModule for Logging
  controllers: [AdminCustomersController],
  providers: [AdminCustomersService],
})
export class AdminCustomersModule {}
