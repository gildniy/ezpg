const { PrismaClient } = require("./src/generated/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing Merchant-Agent relationships...");
    console.log("\n==== Current Database Schema Constraints ====");
    console.log(
      "1. Currently, there's a UNIQUE constraint on agent.merchant_id in the database",
    );
    console.log(
      "2. This prevents multiple agents from being assigned to the same merchant",
    );
    console.log(
      "3. The schema.prisma has been updated, but the database constraints need fixing",
    );
    console.log("4. To implement the proper relationship where:");
    console.log("   - An agent can belong to 0 or 1 merchant");
    console.log("   - A merchant must have at least 1 agent");
    console.log("   - Multiple agents can be assigned to the same merchant");
    console.log("\n==== The following steps are required: ====");
    console.log("1. Drop the unique constraint/index on agent.merchant_id");
    console.log(
      "2. Run a direct SQL command: DROP INDEX agents_merchant_id_key;",
    );
    console.log(
      "3. Ensure the Agent.merchant_id field is nullable in the schema",
    );
    console.log(
      "4. Update the seed.ts to enforce the constraint of min 5-8 agents per merchant",
    );
    console.log("\n==== Current Database State: ====");

    // Query merchants with their agents
    const merchants = await prisma.merchant.findMany({
      include: {
        agents: true,
      },
    });

    console.log(`Found ${merchants.length} merchants`);
    merchants.forEach((m) => {
      console.log(`Merchant ${m.merchant_id} has ${m.agents.length} agents`);
    });

    // Query agents to see if any are "unassigned" by username
    const agentsWithUsernames = await prisma.agent.findMany({
      include: {
        user: true,
      },
    });

    const unassignedByName = agentsWithUsernames.filter((agent) =>
      agent.user.username.startsWith("unassigned_"),
    );

    console.log(
      `\nFound ${unassignedByName.length} agents marked as "unassigned" by username`,
    );

    if (unassignedByName.length > 0) {
      unassignedByName.forEach((a) => {
        console.log(
          `Agent ${a.agent_id} (${a.agent_name}) with username ${a.user.username} assigned to merchant ${a.merchant_id || "NULL"}`,
        );
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error testing relationships:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
