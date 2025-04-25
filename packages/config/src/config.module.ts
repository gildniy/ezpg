import { join, resolve } from "path";

import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

import { ConfigService } from "./config.service";
import { validationSchema } from "./config.validation";

// Get the absolute path to the project root by going up from packages/config/src
const projectRoot = resolve(__dirname, "../../..");
const envPath = join(projectRoot, "apps/server/.env");

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envPath,
      validationSchema: validationSchema,
      ignoreEnvFile: false,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
