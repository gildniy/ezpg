// Script to verify Korean banks
const { Client } = require("pg");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Also try to load from local directory
if (fs.existsSync(path.resolve(__dirname, ".env"))) {
  dotenv.config({ path: path.resolve(__dirname, ".env") });
}

// If still not set, try from packages/database directory
if (
  !process.env.DATABASE_URL &&
  fs.existsSync(path.resolve(__dirname, "../.env"))
) {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

// If DATABASE_URL is still not set, use a default for local development
if (!process.env.DATABASE_URL) {
  console.log(
    "DATABASE_URL not found in environment variables, using default local connection",
  );
  process.env.DATABASE_URL =
    "postgresql://postgres:postgres@localhost:5432/ezpg";
}

console.log(
  "Using database connection:",
  process.env.DATABASE_URL.replace(/\/\/([^:]+):[^@]+@/, "//\$1:****@"),
);

async function verifyBanks() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("Connected to database");

    // Query the banks table
    console.log("Querying banks table...");
    const result = await client.query(`
      SELECT bank_code, bank_name, is_active, created_at
      FROM banks
      ORDER BY bank_name
    `);

    // Print the results
    console.log("\n===== Banks in Database =====");
    console.log(`Total banks: ${result.rowCount}`);

    console.log("\nBank Code | Bank Name | Active | Created At");
    console.log("---------------------------------------");

    result.rows.forEach((bank) => {
      console.log(
        `${bank.bank_code.padEnd(9)} | ${bank.bank_name.padEnd(25)} | ${bank.is_active ? "Yes" : "No"} | ${bank.created_at.toISOString().slice(0, 19).replace("T", " ")}`,
      );
    });

    console.log("\n===== End of Banks List =====");

    // Check for primary_bank_code in merchants
    try {
      const merchantsResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_name = 'merchants' 
        AND column_name = 'primary_bank_code'
      `);

      if (merchantsResult.rows[0].count > 0) {
        console.log("\nMerchants table has primary_bank_code column ✅");

        // Check if any merchants have primary_bank_code set
        const merchantsWithBankResult = await client.query(`
          SELECT COUNT(*) as count 
          FROM merchants 
          WHERE primary_bank_code IS NOT NULL
        `);

        console.log(
          `Merchants with primary bank set: ${merchantsWithBankResult.rows[0].count}`,
        );
      } else {
        console.log(
          "\nMerchants table does NOT have primary_bank_code column ❌",
        );
      }
    } catch (err) {
      console.error("Error checking merchants table:", err.message);
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
    console.log("\nDatabase connection closed");
  }
}

verifyBanks();
