import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { extraModels } from "./swagger.config";
import * as glob from "glob";

/**
 * Server Initialization Script
 *
 * This script automatically handles various initialization tasks when the server starts:
 * - Checks and applies database migrations
 * - Seeds essential data if needed
 * - Performs necessary setup operations
 * - Creates required directories and resources
 * - Updates Swagger configuration
 * - Auto-detects and registers new enums for Swagger
 */
export class ServerInitializer {
  private readonly logger = new Logger("ServerInitializer");
  private prismaClient: PrismaClient;
  private workspaceRoot: string;
  private databaseDir: string;
  private serverDir: string;

  constructor() {
    this.workspaceRoot = path.resolve(__dirname, "../../../");
    this.databaseDir = path.join(this.workspaceRoot, "packages/database");
    this.serverDir = path.join(this.workspaceRoot, "apps/server");
    this.prismaClient = new PrismaClient();
  }

  /**
   * Main initialization method to be called during server bootstrap
   */
  async initialize(): Promise<void> {
    this.logger.log("Starting server initialization...");

    try {
      // Create required directories
      this.createRequiredDirectories();

      // Check database connection and migrations
      await this.checkDatabase();

      // Seed essential data if needed
      await this.seedEssentialData();

      // Initialize Swagger configuration
      await this.initializeSwaggerConfig();

      // Initialize any other components
      await this.initializeComponents();

      this.logger.log("Server initialization completed successfully");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Initialization failed: ${errorMessage}`);
      throw error;
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  /**
   * Create any required directories for the server
   */
  private createRequiredDirectories(): void {
    this.logger.log("Creating required directories...");

    // Ensure uploads directory exists
    const uploadsDir = path.join(this.serverDir, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      this.logger.log(`Created uploads directory at ${uploadsDir}`);
    }
  }

  /**
   * Check database connection and run migrations if needed
   */
  private async checkDatabase(): Promise<void> {
    this.logger.log("Checking database connection and migrations...");

    try {
      // Test database connection
      await this.prismaClient.$queryRaw`SELECT 1`;
      this.logger.log("Database connection successful");

      // Check migrations
      const dbPushedMarker = path.join(this.databaseDir, ".db-pushed");
      if (!fs.existsSync(dbPushedMarker)) {
        this.logger.log("Running database migration check...");

        try {
          // Run check-migrations script
          execSync(
            "yarn with-env ts-node -r tsconfig-paths/register packages/database/scripts/check-migrations.ts",
            {
              cwd: this.workspaceRoot,
              stdio: "inherit",
            },
          );
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(`Migration check failed: ${errorMessage}`);
          throw new Error("Database migration check failed");
        }
      } else {
        this.logger.log("Database migrations already applied");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Database check failed: ${errorMessage}`);
      throw new Error("Database check failed");
    }
  }

  /**
   * Reset the database and run seed
   * This method can be called manually when a complete reset is needed
   */
  public async resetAndSeedDatabase(): Promise<void> {
    this.logger.log("Resetting and seeding database...");

    try {
      // Use the custom reset-database.sh script which handles dependencies correctly and includes seeding
      execSync("cd packages/database && ./reset-database.sh", {
        cwd: this.workspaceRoot,
        stdio: "inherit",
      });

      this.logger.log("Database reset and seed completed successfully");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Database reset and seed failed: ${errorMessage}`);
      throw new Error("Database reset and seed failed");
    }
  }

  /**
   * Seed essential data if the database is empty
   */
  private async seedEssentialData(): Promise<void> {
    this.logger.log("Checking if essential data needs to be seeded...");

    try {
      // Check if banks table is empty
      const banksCount = await this.prismaClient.bank.count();

      if (banksCount === 0) {
        this.logger.log("Seeding Korean banks data...");
        try {
          // Run SQL script to insert Korean banks
          const sqlFilePath = path.join(
            this.databaseDir,
            "prisma/insert-korean-banks.sql",
          );

          if (fs.existsSync(sqlFilePath)) {
            const sql = fs.readFileSync(sqlFilePath, "utf8");
            await this.prismaClient.$executeRawUnsafe(sql);
            this.logger.log("Korean banks data seeded successfully");
          } else {
            this.logger.warn("Korean banks SQL file not found");
          }
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(`Error seeding banks: ${errorMessage}`);
        }
      } else {
        this.logger.log("Essential data already exists, skipping seed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Data seeding check failed: ${errorMessage}`);
    }
  }

  /**
   * Initialize Swagger configuration
   */
  private async initializeSwaggerConfig(): Promise<void> {
    this.logger.log("Initializing Swagger configuration...");

    try {
      // Check that all extraModels are properly loaded
      if (!extraModels || extraModels.length === 0) {
        this.logger.warn("Swagger extraModels array is empty or not defined");
      } else {
        this.logger.log(
          `Loaded ${extraModels.length} existing models for Swagger documentation`,
        );
      }

      // Ensure swagger config file exists and is up to date
      const swaggerConfigPath = path.join(
        this.serverDir,
        "src/swagger.config.ts",
      );
      if (!fs.existsSync(swaggerConfigPath)) {
        this.logger.warn(
          `Swagger config file not found at ${swaggerConfigPath}`,
        );
      } else {
        // File exists, check if it needs any updates by detecting new enums
        await this.detectAndUpdateEnums(swaggerConfigPath);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Swagger initialization warning (non-fatal): ${errorMessage}`,
      );
      // Non-fatal error, don't throw
    }
  }

  /**
   * Detect new enums in the codebase and update the swagger.config.ts file
   */
  private async detectAndUpdateEnums(swaggerConfigPath: string): Promise<void> {
    this.logger.log("Scanning for new enums in the codebase...");

    try {
      // 1. Read the current swagger.config.ts content
      const currentContent = fs.readFileSync(swaggerConfigPath, "utf8");

      // 2. Extract existing enum class names
      const existingClassNames =
        this.extractExistingEnumClasses(currentContent);
      this.logger.log(
        `Found ${existingClassNames.size} existing enum classes in swagger.config.ts`,
      );

      // 3. Scan the codebase for enum definitions
      const detectedEnums = await this.scanForEnums();
      this.logger.log(
        `Detected ${Object.keys(detectedEnums).length} enums in codebase`,
      );

      // 4. Find new enums that aren't in swagger.config.ts yet
      const newEnums: Record<string, string[]> = {};
      for (const [enumName, enumValues] of Object.entries(detectedEnums)) {
        const className = `${enumName}Class`;
        if (!existingClassNames.has(className)) {
          newEnums[enumName] = enumValues;
        }
      }

      if (Object.keys(newEnums).length === 0) {
        this.logger.log(
          "No new enums detected, swagger.config.ts is up to date",
        );
        return;
      }

      this.logger.log(
        `Found ${Object.keys(newEnums).length} new enums to add to swagger.config.ts`,
      );

      // 5. Generate code to add new enum classes
      const updates = this.generateEnumClassesCode(newEnums);

      // 6. Update extraModels array with new classes
      const updatedContent = this.updateExtraModelsArray(
        currentContent,
        Object.keys(newEnums),
      );

      // 7. Insert new enum class definitions before extraModels
      const finalContent = this.insertEnumClassDefinitions(
        updatedContent,
        updates,
      );

      // 8. Write the updated content back to the file
      fs.writeFileSync(swaggerConfigPath, finalContent, "utf8");

      this.logger.log(
        `Updated swagger.config.ts with ${Object.keys(newEnums).length} new enums`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update swagger.config.ts: ${errorMessage}`);
    }
  }

  /**
   * Extract existing enum class names from swagger.config.ts
   */
  private extractExistingEnumClasses(content: string): Set<string> {
    const classNames = new Set<string>();
    const classRegex = /class\s+(\w+)\s*\{/g;
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      classNames.add(match[1]);
    }

    return classNames;
  }

  /**
   * Scan the server src directory for enum definitions
   */
  private async scanForEnums(): Promise<Record<string, string[]>> {
    const detectedEnums: Record<string, string[]> = {};

    // Only scan the server's src directory
    const srcPath = path.join(this.serverDir, "src");
    this.logger.log(`Scanning for enums in: ${srcPath}`);

    // Find all TypeScript files in the server src directory
    const files = glob.sync("**/*.ts", {
      cwd: srcPath,
      ignore: ["swagger.config.ts"],
    });

    this.logger.log(`Found ${files.length} TypeScript files to scan`);

    for (const file of files) {
      const filePath = path.join(srcPath, file);
      const content = fs.readFileSync(filePath, "utf8");

      // Match enum definitions
      const enumRegex = /export\s+enum\s+(\w+)\s*\{([^}]+)\}/g;
      let match;

      while ((match = enumRegex.exec(content)) !== null) {
        const enumName = match[1];
        const enumBody = match[2];

        // Extract enum values - handle both string values and numeric values
        const valueRegex = /(\w+)\s*=\s*(?:['"](.+?)['"]|(.+?)(?:,|\s|$))/g;
        const enumValues: string[] = [];
        let valueMatch;

        while ((valueMatch = valueRegex.exec(enumBody)) !== null) {
          enumValues.push(valueMatch[1]);
        }

        if (enumValues.length > 0) {
          detectedEnums[enumName] = enumValues;
          this.logger.log(
            `Found enum '${enumName}' in ${file} with ${enumValues.length} values`,
          );
        }
      }
    }

    return detectedEnums;
  }

  /**
   * Generate code for new enum class definitions
   */
  private generateEnumClassesCode(newEnums: Record<string, string[]>): string {
    // First, locate where each enum is defined
    const enumLocations = this.findEnumLocations(Object.keys(newEnums));

    // Generate import statements if needed
    let importStatements = "";
    for (const [enumName, location] of Object.entries(enumLocations)) {
      if (location) {
        // Convert file path to relative import path
        const relativePath = location.replace(
          path.join(this.serverDir, "src"),
          ".",
        );
        const importPath = relativePath.replace(/\.ts$/, "");
        importStatements += `import { ${enumName} } from "${importPath}";\n`;
      }
    }

    // Add a blank line after imports if we have any
    if (importStatements) {
      importStatements += "\n";
    }

    // Generate class definitions
    let classDefinitions = "";
    for (const [enumName, enumValues] of Object.entries(newEnums)) {
      classDefinitions += `\nclass ${enumName}Class {\n}\n\n`;
      classDefinitions += `Object.defineProperties(\n`;
      classDefinitions += `    ${enumName}Class,\n`;
      classDefinitions += `    Object.getOwnPropertyDescriptors(${enumName}),\n`;
      classDefinitions += `);\n\n`;
    }

    return importStatements + classDefinitions;
  }

  /**
   * Find where each enum is defined in the codebase
   */
  private findEnumLocations(enumNames: string[]): Record<string, string> {
    const locations: Record<string, string> = {};
    const srcPath = path.join(this.serverDir, "src");

    // Create a set for faster lookups
    const enumSet = new Set(enumNames);

    // Find all TypeScript files
    const files = glob.sync("**/*.ts", {
      cwd: srcPath,
      ignore: ["swagger.config.ts"],
    });

    // Look for each enum in the files
    for (const file of files) {
      const filePath = path.join(srcPath, file);
      const content = fs.readFileSync(filePath, "utf8");

      // Check which enums are defined in this file
      for (const enumName of enumSet) {
        if (
          !locations[enumName] &&
          content.includes(`export enum ${enumName}`)
        ) {
          locations[enumName] = filePath;
          // If we've found all enums, we can stop searching
          if (Object.keys(locations).length === enumNames.length) {
            break;
          }
        }
      }
    }

    return locations;
  }

  /**
   * Update the extraModels array with new enum classes
   */
  private updateExtraModelsArray(
    content: string,
    newEnumNames: string[],
  ): string {
    // Find the extraModels array
    const extraModelsRegex =
      /export\s+const\s+extraModels:\s*Function\[\]\s*=\s*\[([\s\S]*?)\];/;
    const match = extraModelsRegex.exec(content);

    if (!match) {
      throw new Error("Could not find extraModels array in swagger.config.ts");
    }

    // Current extraModels content
    const currentExtraModels = match[1];

    // Add new enum class names
    const newClasses = newEnumNames
      .map((name) => `    ${name}Class`)
      .join(",\n");

    // Combine existing and new values
    let updatedExtraModels;
    if (currentExtraModels.trim()) {
      updatedExtraModels = `${currentExtraModels},\n${newClasses}`;
    } else {
      updatedExtraModels = newClasses;
    }

    // Replace the array content
    return content.replace(
      extraModelsRegex,
      `export const extraModels: Function[] = [\n${updatedExtraModels}\n];`,
    );
  }

  /**
   * Insert new enum class definitions before the extraModels array
   */
  private insertEnumClassDefinitions(
    content: string,
    newClassesCode: string,
  ): string {
    // Find the extraModels array declaration
    const extraModelsRegex = /export\s+const\s+extraModels:\s*Function\[\]\s*=/;
    const match = extraModelsRegex.exec(content);

    if (!match) {
      throw new Error(
        "Could not find extraModels array declaration in swagger.config.ts",
      );
    }

    // Split the content at the extraModels declaration
    const index = match.index;
    const before = content.substring(0, index);
    const after = content.substring(index);

    // Insert the new class definitions before the extraModels array
    return before + newClassesCode + after;
  }

  /**
   * Initialize any additional components or services
   */
  private async initializeComponents(): Promise<void> {
    this.logger.log("Initializing additional components...");

    // Create the uploads directory if it doesn't exist
    const uploadsDir = path.join(this.serverDir, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      this.logger.log(`Created uploads directory at ${uploadsDir}`);
    }

    // Add any other component initialization here
    // For example: cache warmup, external service checks, etc.
  }
}
