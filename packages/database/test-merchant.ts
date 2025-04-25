import { PrismaClient } from "./src/generated/client";

async function main() {
  const prisma = new PrismaClient();

  try {
    const merchant = await prisma.merchant.findFirst();
    console.log("Merchant data:");
    console.log(merchant);

    // Check if the field is api_key (new) instead of apiKey (old)
    if (merchant && merchant.api_key) {
      console.log("\nConfirmed merchant has api_key field:", merchant.api_key);
    } else if (merchant) {
      console.log("\nWARNING: Merchant does not have api_key field");
      console.log("Available fields:", Object.keys(merchant));
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
