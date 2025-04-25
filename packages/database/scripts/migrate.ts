import { execSync } from "child_process";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from the server's .env file
dotenv.config({ path: path.resolve(__dirname, "../../../apps/server/.env") });

function runCommand(command: string) {
  try {
    console.log(`Running command: ${command}`);
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error("Error executing command:", error);
    process.exit(1);
  }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Get the migration name from command line arguments
const migrationName = process.argv[2];
if (!migrationName) {
  console.error("Error: Migration name is required");
  console.log("Usage: npm run migrate <migration-name>");
  process.exit(1);
}

// Run the migration
console.log(`Creating migration: ${migrationName}`);
runCommand(`npx prisma migrate dev --name ${migrationName}`);

console.log("Migration completed successfully");
