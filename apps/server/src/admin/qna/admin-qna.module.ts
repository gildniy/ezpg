import { Module } from "@nestjs/common";
import { AdminQnaService } from "./admin-qna.service";
import { AdminQnaController } from "./admin-qna.controller";
import { PrismaModule } from "@ezpg/database";

@Module({
  imports: [PrismaModule],
  controllers: [AdminQnaController],
  providers: [AdminQnaService],
})
export class AdminQnaModule {}
