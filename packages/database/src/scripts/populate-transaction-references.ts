import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function populateTransactionReferences() {
  try {
    console.log("Starting transaction reference population...");

    // Execute the SQL function directly
    await prisma.$executeRawUnsafe(
      "SELECT populate_existing_transaction_references()",
    );

    console.log("Transaction reference population completed successfully");

    // Count how many records were updated
    const referencesCount = await prisma.transactionReference.count();
    const balanceLogsWithReferences = await prisma.balanceLogs.count({
      where: {
        transaction_reference_id: {
          not: null,
        },
      },
    });

    console.log(`Total transaction references created: ${referencesCount}`);
    console.log(
      `Total balance logs with references: ${balanceLogsWithReferences}`,
    );
  } catch (error) {
    console.error("Error populating transaction references:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function if this file is run directly
if (require.main === module) {
  populateTransactionReferences().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { populateTransactionReferences };
