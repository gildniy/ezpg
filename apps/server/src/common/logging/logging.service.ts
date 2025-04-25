import { Injectable } from "@nestjs/common";
import { PrismaService, LogSeverity } from "@ezpg/database";

@Injectable()
export class LoggingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log a debug message
   */
  debug(
    severity: LogSeverity,
    component: string,
    details: Record<string, unknown> | null,
    message: string,
    userId?: string | null,
    stack?: string | null,
    ipAddress?: string,
  ) {
    return this.log(
      severity,
      component,
      details,
      message,
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
    details: Record<string, unknown> | null,
    message: string,
    userId?: string | null,
    stack?: string | null,
    ipAddress?: string,
  ) {
    return this.log(
      severity,
      component,
      details,
      message,
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
    details: Record<string, unknown> | null,
    message: string,
    userId?: string | null,
    stack?: string | null,
    ipAddress?: string,
  ) {
    return this.log(
      severity,
      component,
      details,
      message,
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
    details: Record<string, unknown> | null,
    message: string,
    userId?: string | null,
    stack?: string | null,
    ipAddress?: string,
  ) {
    return this.log(
      severity,
      component,
      details,
      message,
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
    details: Record<string, unknown> | null,
    message: string,
    userId?: string | null,
    stack?: string | null,
    ipAddress?: string,
  ) {
    try {
      const logData: any = {
        severity,
        details: JSON.stringify(details),
        ip_address: ipAddress || undefined,
      };
      if (userId) {
        logData.user_id = userId;
      }
      return await this.prisma.log.create({
        data: logData,
      });
    } catch (error) {
      // If logging to database fails, log to console as fallback
      console.error(`[${severity}] ${component}: ${message}`, details, stack);
      return null;
    }
  }
}
