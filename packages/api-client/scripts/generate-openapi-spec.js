#!/usr/bin/env node

/**
 * Script to generate OpenAPI specification from the NestJS application.
 * This generates a swagger.json file that will be used by the openapi-generator-cli
 * to generate the TypeScript client library.
 */

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

// Path to the server app
const SERVER_PATH = path.resolve(__dirname, "../../../apps/server");
const OUTPUT_PATH = path.resolve(SERVER_PATH, "swagger-spec.json");

console.log("Generating OpenAPI specification...");

// Create a simplified OpenAPI spec if we can't build the server
function createFallbackOpenApiSpec() {
  console.log("Creating fallback OpenAPI specification...");

  // Check if an existing spec exists
  if (fs.existsSync(OUTPUT_PATH)) {
    console.log("Using existing OpenAPI specification");
    return true;
  }

  // Create a minimal OpenAPI spec
  const fallbackSpec = {
    openapi: "3.0.0",
    info: {
      title: "EZPG API (Fallback)",
      description: "Fallback API specification",
      version: "1.0.0",
    },
    paths: {},
    components: {
      schemas: {},
    },
  };

  try {
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(fallbackSpec, null, 2));
    console.log("Created fallback OpenAPI specification");
    return true;
  } catch (error) {
    console.error("Error creating fallback OpenAPI specification:", error);
    return false;
  }
}

// Temporarily create a script that starts the NestJS app in development mode with Swagger enabled
const tempScriptPath = path.resolve(SERVER_PATH, "temp-swagger-gen.js");
fs.writeFileSync(
  tempScriptPath,
  `
const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { AppModule } = require('./dist/app.module');
const fs = require('fs');

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    const config = new DocumentBuilder()
      .setTitle('EZPG API')
      .setDescription('EZPG API documentation')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'jwt-bearer-auth'
      )
      .build();
      
    const document = SwaggerModule.createDocument(app, config);
    
    // Write the OpenAPI spec to file
    fs.writeFileSync('${OUTPUT_PATH.replace(/\\/g, "\\\\")}', JSON.stringify(document, null, 2));
    
    console.log('OpenAPI specification generated at: ${OUTPUT_PATH}');
    
    await app.close();
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
    process.exit(1);
  }
  process.exit(0);
}

bootstrap();
`,
);

try {
  // Try to build the server
  console.log("Building the server application...");
  try {
    execSync("npm run build", { cwd: SERVER_PATH, stdio: "inherit" });
  } catch (error) {
    console.error(
      "Server build failed, falling back to existing or minimal spec",
    );
    if (createFallbackOpenApiSpec()) {
      // Clean up and exit
      fs.unlinkSync(tempScriptPath);
      process.exit(0);
    } else {
      throw error;
    }
  }

  // If build succeeded, run the temporary script
  console.log("Running the Swagger generator...");
  try {
    execSync(`node ${tempScriptPath}`, { stdio: "inherit" });
  } catch (error) {
    console.error(
      "Error running Swagger generator, falling back to existing or minimal spec",
    );
    if (!createFallbackOpenApiSpec()) {
      throw error;
    }
  }

  console.log(
    "OpenAPI specification successfully generated or fallback created!",
  );
} catch (error) {
  console.error("Error generating OpenAPI specification:", error);
  process.exit(1);
} finally {
  // Clean up
  if (fs.existsSync(tempScriptPath)) {
    fs.unlinkSync(tempScriptPath);
  }
}
