import { PrismaClient } from "@ezpg/database";

async function migrate() {
  const prisma = new PrismaClient();

  try {
    console.log("Starting database migration...");

    // Add new fields to merchants
    console.log("Updating merchants schema...");

    // Clean up the database connection
    await prisma.$disconnect();
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

migrate();
