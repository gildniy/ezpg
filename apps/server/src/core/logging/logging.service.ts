// Basic placeholder - Consider using Winston or Pino for production logging
import { Injectable, Logger as NestLogger, Scope } from "@nestjs/common";
import { Log, LogSeverity, PrismaService, RoleName } from "@ezpg/database";
import { JwtUser } from "src/auth/interfaces/jwt-user.interface";
import { LogAction } from "./log-action.enum";

@Injectable({ scope: Scope.TRANSIENT }) // Transient scope if context is needed per request
export class LoggingService {
  protected context: string = "Application";
  private prisma: PrismaService;
  private nestLogger: NestLogger;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
    this.nestLogger = new NestLogger(this.context);
  }

  setContext(context: string): void {
    this.context = context;
    // Create a new logger with the updated context
    this.nestLogger = new NestLogger(context);
  }

  // Standard logger methods that delegate to NestLogger
  standardLog(message: string | object | unknown, context?: string): void {
    this.nestLogger.log(message, context);
  }

  standardError(
    message: string | object | unknown,
    stack?: string,
    context?: string,
  ): void {
    this.nestLogger.error(message, stack, context);
  }

  standardWarn(message: string | object | unknown, context?: string): void {
    this.nestLogger.warn(message, context);
  }

  standardDebug(message: string | object | unknown, context?: string): void {
    this.nestLogger.debug(message, context);
  }

  async logUserAction(
    user: JwtUser,
    action: LogAction,
    severity: LogSeverity,
    entityType: string,
    entityId: number | string,
    metadata?: Record<string, unknown>,
    ipAddress?: string,
  ) {
    // Handle different user object formats
    const userId = user.userId;
    const username = user.username;
    const roleId =
      "role_id" in user ? user.role_id : user.role === RoleName.ADMIN ? 1 : 2;

    // Console logging for debugging
    const userType = roleId === 1 ? RoleName.ADMIN : RoleName.MERCHANT;
    const message =
      `${userType} ACTION: User ${username} (${userId}) performed action [${action}]` +
      (entityType ? ` on ${entityType}` : "") +
      (entityId ? ` (ID: ${entityId})` : "");

    this.standardLog(message);
    if (metadata && Object.keys(metadata).length > 0)
      this.standardLog(`Details: ${JSON.stringify(metadata)}`);
    if (ipAddress) this.standardLog(`IP Address: ${ipAddress}`);

    // DB logging using unified Log model
    try {
      await this.prisma.log.create({
        data: {
          user_id: userId,
          action,
          severity,
          target_entity_type: entityType,
          target_entity_id: entityId ? String(entityId) : null,
          details: metadata ? JSON.parse(JSON.stringify(metadata)) : {},
          ip_address: ipAddress,
          system_generated: false,
        },
      });
    } catch (error) {
      // Add type check
      if (error instanceof Error) {
        console.error(`Failed to log action to database: ${error.message}`);
      } else {
        console.error(`Failed to log action to database: ${String(error)}`);
      }
    }
  }

  async logSystemAction(
    action: LogAction | string,
    severity: LogSeverity = LogSeverity.INFO,
    details?: Record<string, unknown>,
  ) {
    this.standardLog(`SYSTEM ACTION: ${action}`);
    if (details) this.standardLog(`Details: ${JSON.stringify(details)}`);

    try {
      await this.prisma.log.create({
        data: {
          user_id: null, // No user for system logs
          action,
          severity,
          details: details ? JSON.parse(JSON.stringify(details)) : {},
          system_generated: true,
        },
      });
    } catch (error) {
      // Add type check
      if (error instanceof Error) {
        console.error(
          `Failed to log system action to database: ${error.message}`,
        );
      } else {
        console.error(
          `Failed to log system action to database: ${String(error)}`,
        );
      }
    }
  }

  /**
   * Log a debug message
   */
  debug(
    severity: LogSeverity,
    component: string,
    message: LogAction,
    details?: string,
    userId?: string | null,
    stack?: string | null,
    ipAddress?: string,
  ) {
    return this.log(
      severity,
      component,
      message,
      details,
      userId,
      stack,
      ipAddress,
    );
  }

  /**
   * Log an info message
   */
  info(
    severity: LogSeverity,
    component: string,
    message: LogAction,
    details?: string,
    userId?: string | null,
    stack?: string | null,
    ipAddress?: string,
  ) {
    return this.log(
      severity,
      component,
      message,
      details,
      userId,
      stack,
      ipAddress,
    );
  }

  /**
   * Log a warning message
   */
  warn(
    severity: LogSeverity,
    component: string,
    message: LogAction,
    details?: string,
    userId?: string | null,
    stack?: string | null,
    ipAddress?: string,
  ) {
    return this.log(
      severity,
      component,
      message,
      details,
      userId,
      stack,
      ipAddress,
    );
  }

  /**
   * Log an error message
   */
  error(
    severity: LogSeverity,
    component: string,
    message: LogAction,
    details?: string,
    userId?: string | null,
    stack?: string | null,
    ipAddress?: string,
  ) {
    return this.log(
      severity,
      component,
      message,
      details,
      userId,
      stack,
      ipAddress,
    );
  }

  /**
   * Log a message to the database
   */
  async log(
    severity: LogSeverity,
    component: string,
    message: LogAction,
    details?:
      | string
      | Record<string, string | number | boolean | object | null>
      | null,
    userId?: string,
    stack?: string | null,
    ipAddress?: string,
  ): Promise<Log | null> {
    try {
      // Convert details to object if it's a string
      let detailsObj: Record<
        string,
        string | number | boolean | object | null
      > | null = null;
      if (typeof details === "string") {
        detailsObj = { message: details };
      } else if (details) {
        detailsObj = details;
      }

      return await this.prisma.log.create({
        data: {
          severity,
          action: message,
          details: {
            component,
            stack: stack || null,
            ip_address: ipAddress || null,
            user_id: userId || null,
            ...(detailsObj || {}),
          },
        },
      });
    } catch (error) {
      // If logging to database fails, log to console as fallback
      console.error(`[${severity}] ${component}: ${message}`, details, stack);
      return null;
    }
  }
}
