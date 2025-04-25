import { NestFactory } from "@nestjs/core";
import { SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AppConfigService } from "./config/app-config.service";
import * as fs from "fs";
import * as path from "path";
import {
  createSwaggerConfig,
  extraModels,
  swaggerOptions,
} from "./swagger.config"; // Import the shared config function

async function generateSpec() {
  // Create a FULL, temporary app instance instead of just context
  // Temporarily enable logging to diagnose startup errors
  const app = await NestFactory.create(AppModule, {
    // logger: false, // Disable logging for script
  });
  const configService = app.get(AppConfigService);

  // --- Get Swagger Config using shared function --- //
  const swaggerConfig = createSwaggerConfig(configService);

  // createDocument requires INestApplication, which we now have
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ...swaggerOptions,
    extraModels: extraModels,
  });

  // Define output path (e.g., project root)
  const outputPath = path.resolve(
    __dirname,
    "../../../packages/api-client/src/swagger.json",
  ); // Adjust path as needed

  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log(`Swagger JSON specification saved to: ${outputPath}`);

  await app.close(); // Close the full app instance
}

generateSpec();
