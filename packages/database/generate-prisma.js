#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Get the absolute path to the schema.prisma file
const schemaPath = path.resolve(__dirname, "prisma/schema.prisma");

// Check if the schema file exists
if (!fs.existsSync(schemaPath)) {
  console.error(`Error: Schema file not found at ${schemaPath}`);
  process.exit(1);
}

try {
  console.log(`Generating Prisma client from schema at ${schemaPath}`);

  // Run the prisma generate command with the absolute path
  execSync(`npx prisma generate --schema="${schemaPath}"`, {
    stdio: "inherit",
    env: { ...process.env },
  });

  console.log("Prisma client generation completed successfully");
} catch (error) {
  console.error("Error generating Prisma client:", error.message);
  process.exit(1);
}
