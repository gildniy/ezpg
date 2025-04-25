// Import types from NestJS Common but don't use decorators
import { Type } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// Define a module class that NestJS can use
class PrismaModuleClass {
  // This is needed to match the NestJS module interface
}

// Export a module definition object that matches NestJS's import syntax
export const PrismaModule = {
  // The actual module class
  module: PrismaModuleClass as Type<any>,

  // Providers that will be instantiated by the Nest injector
  providers: [PrismaService],

  // Subset of providers that should be exported
  exports: [PrismaService],

  // Factory method to use in the AppModule
  forRoot() {
    return {
      module: PrismaModuleClass as Type<any>,
      global: true,
      providers: [PrismaService],
      exports: [PrismaService],
    };
  },
};
