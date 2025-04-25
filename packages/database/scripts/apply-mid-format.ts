import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: __dirname + "/../../../apps/server/.env" });

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  console.log("Applying mid format update to agents...");

  try {
    // Update mid to follow the format: USERNAME_XXXXX (where XXXXX is 5 random digits)
    const result = await prisma.$executeRawUnsafe(`
      UPDATE "agents" SET "mid" = CONCAT(
        UPPER((SELECT "username" FROM "users" WHERE "user_id" = "agents"."agent_id")),
        '_',
        LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0')
      )
    `);

    console.log(`Updated ${result} agent records with new mid format`);
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Error applying migration:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
