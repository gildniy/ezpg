import { Injectable } from "@nestjs/common";
import { PrismaService } from "@ezpg/database";

/**
 * Service for generating unique alphanumeric IDs for various entity types
 * Can be reused across multiple modules
 */
@Injectable()
export class IdGeneratorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generates a prefixed ID for a specific entity type
   *
   * @param entityType The type of entity to generate an ID for
   * @returns Prefixed ID
   */
  generatePrefixedId(entityType: "merchant" | "agent" | "admin"): string {
    // Generate a random 6-character alphanumeric string
    const randomPart = this.generateRandomAlphanumeric(6);

    switch (entityType) {
      case "merchant":
        return `ME${randomPart}`; // ME + 6 alphanumeric chars = 8 chars
      case "agent":
        return `AG${randomPart}`; // AG + 6 alphanumeric chars = 8 chars
      case "admin":
        return `AD${randomPart}`; // AD + 6 alphanumeric chars = 8 chars
      default:
        return randomPart; // Fallback to just the random part
    }
  }

  /**
   * Generates a unique ID for a specific entity type that doesn't exist in the database
   *
   * @param entityType - The type of entity to generate an ID for ('merchant', 'agent', 'admin')
   * @returns Promise resolving to a unique entity ID
   */
  async generateUniqueId(
    entityType: "merchant" | "agent" | "admin",
  ): Promise<string> {
    let id: string;
    let exists = true;

    do {
      id = this.generatePrefixedId(entityType);

      // Check if ID exists based on entity type
      switch (entityType) {
        case "merchant":
          const merchant = await this.prisma.merchant.findUnique({
            where: { merchant_id: id },
          });
          exists = !!merchant;
          break;
        case "agent":
          const agent = await this.prisma.agent.findUnique({
            where: { agent_id: id },
          });
          exists = !!agent;
          break;
        case "admin":
          const admin = await this.prisma.admin.findUnique({
            where: { admin_id: id },
          });
          exists = !!admin;
          break;
      }
    } while (exists);

    return id;
  }

  /**
   * Generates a unique merchant ID
   * Convenience method that calls generateUniqueId with 'merchant' type
   *
   * @returns Promise resolving to a unique merchant ID
   */
  async generateUniqueMerchantId(): Promise<string> {
    return this.generateUniqueId("merchant");
  }

  /**
   * Generates a unique agent ID
   * Convenience method that calls generateUniqueId with 'agent' type
   *
   * @returns Promise resolving to a unique agent ID
   */
  async generateUniqueAgentId(): Promise<string> {
    return this.generateUniqueId("agent");
  }

  /**
   * Generates a unique admin ID
   * Convenience method that calls generateUniqueId with 'admin' type
   *
   * @returns Promise resolving to a unique admin ID
   */
  async generateUniqueAdminId(): Promise<string> {
    return this.generateUniqueId("admin");
  }

  /**
   * Helper to convert entity ID for logs
   * Used when log system requires numeric IDs but entities have string IDs
   *
   * @param id - The string ID to convert for log usage
   * @returns Numeric ID for the log system
   */
  getEntityIdForLogs(id: string): number {
    // Convert the alphanumeric ID to a numeric value for logs
    // Simple hashing function
    let numericId = 0;
    for (let i = 0; i < id.length; i++) {
      numericId = (numericId * 31 + id.charCodeAt(i)) % 1000000;
    }
    return numericId;
  }

  /**
   * Generates a random alphanumeric string of specified length (0-9, A-Z)
   *
   * @param length The length of the alphanumeric string to generate
   * @returns Random alphanumeric string
   */
  private generateRandomAlphanumeric(length: number): string {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }

    return result;
  }
}
