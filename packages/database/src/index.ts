import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { ConfigModule } from "@nestjs/config";

// Direct export of PrismaService
export * from "./prisma.service";

// Export the module
export { PrismaModule } from "./prisma.module";

// Export types
export * from "./types";
