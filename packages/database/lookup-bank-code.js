// Script to look up bank codes using our mapping system
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

// Get command line arguments
const args = process.argv.slice(2);
const mode = args[0]; // 'external' or 'internal'
const code = args[1]; // the code to look up

if (!mode || !code || !["external", "internal"].includes(mode)) {
  console.log("Usage: node lookup-bank-code.js <mode> <code>");
  console.log(
    '  mode: "external" (look up external code) or "internal" (look up internal code)',
  );
  console.log("  code: the bank code to look up");
  console.log("\nExamples:");
  console.log(
    "  node lookup-bank-code.js external 004   # Look up external code 004",
  );
  console.log(
    "  node lookup-bank-code.js internal KB    # Look up internal code KB",
  );
  process.exit(1);
}

async function lookupBankCode() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("Connected to database");

    let query, params;

    // Check if the bank_code_mappings table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'bank_code_mappings'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.error(
        "Error: The bank_code_mappings table does not exist. Please run map-bank-codes.js first.",
      );
      process.exit(1);
    }

    if (mode === "external") {
      // Look up by external code
      query = `
        SELECT m.external_code, m.internal_code, m.external_name, b.bank_name
        FROM bank_code_mappings m
        JOIN banks b ON m.internal_code = b.bank_code
        WHERE m.external_code = $1
      `;
      params = [code];
    } else {
      // Look up by internal code
      query = `
        SELECT m.external_code, m.internal_code, m.external_name, b.bank_name
        FROM bank_code_mappings m
        JOIN banks b ON m.internal_code = b.bank_code
        WHERE m.internal_code = $1
      `;
      params = [code];
    }

    const result = await client.query(query, params);

    if (result.rows.length === 0) {
      console.log(`No mapping found for ${mode} code: ${code}`);
    } else {
      console.log("\n===== Bank Code Lookup Results =====");
      console.log(
        `Found ${result.rows.length} mapping(s) for ${mode} code: ${code}`,
      );

      console.log(
        "\nExternal Code | Internal Code | External Name | Internal Name",
      );
      console.log("--------------------------------------------------------");

      result.rows.forEach((row) => {
        console.log(
          `${row.external_code.padEnd(13)} | ${row.internal_code.padEnd(13)} | ${row.external_name || "N/A".padEnd(13)} | ${row.bank_name}`,
        );
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
    console.log("\nDatabase connection closed");
  }
}

lookupBankCode();
