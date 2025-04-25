import { Module } from "@nestjs/common";
import { TfaService } from "./tfa.service";
import { AppConfigModule } from "../../config/app-config.module";

@Module({
  imports: [AppConfigModule],
  providers: [TfaService],
  exports: [TfaService],
})
export class TfaModule {}
