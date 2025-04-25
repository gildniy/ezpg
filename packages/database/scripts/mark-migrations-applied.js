const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Get list of all migration directories
const migrationsDir = path.join(__dirname, "../prisma/migrations");
const migrations = fs
  .readdirSync(migrationsDir)
  .filter((dir) => fs.statSync(path.join(migrationsDir, dir)).isDirectory())
  .sort();

console.log("Found migrations:", migrations);

// Mark each migration as applied
migrations.forEach((migration) => {
  try {
    console.log(`Marking migration ${migration} as applied...`);
    execSync(`npx prisma migrate resolve --applied ${migration}`, {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
    console.log(`Successfully marked ${migration} as applied.`);
  } catch (error) {
    console.error(
      `Failed to mark migration ${migration} as applied:`,
      error.message,
    );
  }
});

console.log("All migrations marked as applied!");
