import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { AppConfigService } from "./config/app-config.service";
import { SwaggerModule } from "@nestjs/swagger"; // Import Swagger
import {
  createSwaggerConfig,
  extraModels,
  swaggerOptions,
} from "./swagger.config"; // Import the shared config function
import csurf = require("csurf"); // <-- Re-enable
import cookieParser = require("cookie-parser");
import { ServerInitializer } from "./initialize-server";

// import { Request, Response, NextFunction } from "express"; // Revert back to express types

async function bootstrap() {
  console.log("--- BOOTSTRAP V12 RUNNING ---");

  // Initialize server components
  const initializer = new ServerInitializer();
  try {
    await initializer.initialize();
  } catch (error) {
    console.error("Server initialization failed:", error);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug", "verbose"],
  });
  const logger = new Logger("Bootstrap");

  // --- Cookie Parser (EARLY!) ---
  app.use(cookieParser()); // Needs to run before CSRF and anything needing req.cookies
  logger.log("Cookie Parser middleware registered.");

  const configService = app.get(AppConfigService);
  // const reflector = app.get(Reflector);

  // --- Global Pipes ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // --- Global Guards (Conditional) ---
  logger.log(
    "Global guards are disabled. Apply guards explicitly using @UseGuards.",
  );

  // --- CORS ---
  const allowedOrigins = configService.allowedOrigins;
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS: Blocked origin ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });
  logger.log(`CORS enabled for origins: ${allowedOrigins.join(", ")}`);

  // --- API Versioning ---
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: "api/v",
    defaultVersion: "1",
  });

  // --- CSRF Middleware (AFTER Versioning Prefix) ---
  const csrfProtection = csurf({
    // <-- Re-enable
    cookie: true,
    // Keep default ignoreMethods: ["GET", "HEAD", "OPTIONS"]
  });
  app.use(csrfProtection); // Apply directly // <-- Re-enable
  logger.log("CSRF middleware registered."); // <-- Re-enable

  // --- Swagger (OpenAPI) Setup using shared config ---
  const swaggerConfig = createSwaggerConfig(configService);

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ...swaggerOptions,
    extraModels: extraModels,
  });

  SwaggerModule.setup("api-docs", app, document, {
    // Setup UI at /api-docs
    swaggerOptions: {
      persistAuthorization: true, // Keep auth token in UI after refresh
    },
    customSiteTitle: "EZPG API Docs",
  });
  logger.log(`Swagger UI available at /api-docs`);

  // --- Start Listening ---
  const port = configService.port;
  await app.listen(port);
  logger.log(`🚀 EZPG API is running on: http://localhost:${port}`);
  logger.log(
    `📚 API Documentation available at: http://localhost:${port}/api-docs`,
  );
  logger.log(
    `🔍 OpenAPI JSON available at: http://localhost:${port}/api-docs-json`,
  );
  logger.log(
    `🔍 Admin app at: http://localhost:3000 - (Need fix: First load needs refresh page)`,
  );
  logger.log(
    `🔍 Merchant app at http://localhost:3001 - (Need fix: First load needs refresh page)`,
  );
}

bootstrap();
