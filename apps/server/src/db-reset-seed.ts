#!/usr/bin/env node
/**
 * Database Reset and Seed CLI Tool
 *
 * This script resets the database and runs the seed script to populate it with fresh data.
 * Usage: npm run db:reset-seed
 */

import { ServerInitializer } from "./initialize-server";

async function main() {
  console.log("=== EZPG Database Reset and Seed Tool ===");
  console.log(
    "This will COMPLETELY RESET your database and repopulate it with fresh data.",
  );
  console.log("All existing data will be PERMANENTLY DELETED.");
  console.log("");

  // Create the server initializer
  const initializer = new ServerInitializer();

  try {
    // Reset and seed the database
    await initializer.resetAndSeedDatabase();
    console.log("✅ Database reset and seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to reset and seed database:", error);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
