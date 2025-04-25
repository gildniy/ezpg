import { Module } from "@nestjs/common";
import { IdGeneratorService } from "./id-generator.service";
import { PrismaService } from "@ezpg/database";

@Module({
  providers: [IdGeneratorService, PrismaService],
  exports: [IdGeneratorService],
})
export class IdGeneratorModule {}
