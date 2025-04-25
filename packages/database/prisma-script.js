#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Set up the environment variable
const envPath = path.resolve(__dirname, "../../apps/server/.env");
let dbUrl = "";

try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const dbUrlMatch = envContent.match(/DATABASE_URL=["']?([^"'\n]+)/);
    if (dbUrlMatch && dbUrlMatch[1]) {
      dbUrl = dbUrlMatch[1];
    }
  }
} catch (error) {
  console.error("Error reading .env file:", error);
}

if (!dbUrl) {
  console.log("DATABASE_URL not found in .env file, using default");
  dbUrl = "postgresql://postgres:Open-Open@localhost:5432/ezpg";
}

// Set the DATABASE_URL in the environment
process.env.DATABASE_URL = dbUrl;
console.log(`Using DATABASE_URL: ${dbUrl}`);

// Set the schema path
const schemaPath = path.resolve(__dirname, "prisma/schema.prisma");
console.log(`Using schema path: ${schemaPath}`);

// Run prisma generate
const generate = spawn(
  "npx",
  ["prisma", "generate", `--schema=${schemaPath}`],
  {
    stdio: "inherit",
    env: process.env,
  },
);

generate.on("close", (code) => {
  if (code !== 0) {
    console.error(`Prisma generate exited with code ${code}`);
    process.exit(code);
  }
  console.log("Prisma client generated successfully");
});
