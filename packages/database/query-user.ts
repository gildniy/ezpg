// Simple test to query a user by username
const { PrismaClient } = require("./src/generated/client");

async function main() {
  const prisma = new PrismaClient();

  try {
    // Query the user we just created via direct SQL
    const user = await prisma.user.findUnique({
      where: {
        username: "direct_sql_user",
      },
    });

    if (user) {
      console.log("User found:", user);
    } else {
      console.log("User not found");
    }
  } catch (error) {
    console.error("Error querying user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
