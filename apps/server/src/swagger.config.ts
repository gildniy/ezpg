import { DocumentBuilder, SwaggerDocumentOptions } from "@nestjs/swagger";
import { AppConfigService } from "./config/app-config.service";
import {
  LogSeverity,
  WithdrawalMethod,
  WithdrawalStatus,
} from "@ezpg/database";
import { SearchCriteriaType } from "./common/enums/search-criteria-type.enum";
import { SortOrderEnum } from "./common/enums/sort-order.enum";
import { MerchantSearchType } from "./common/enums/merchant-search-type.enum";
import { AgentSearchType } from "./common/enums/agent-search-type.enum";
import { TimePeriod } from "@ezpg/types";
import { DepositFormatType } from "./common/enums/deposit-format-type.enum";
import { DepositStatusType } from "./common/enums/deposit-status-type.enum";

/**
 * Creates the base Swagger/OpenAPI configuration object.
 * @param configService The application config service to get runtime values like port.
 * @returns The built DocumentBuilder configuration object.
 */
export function createSwaggerConfig(configService: AppConfigService) {
  // This configuration should match the one used in main.ts and generate-spec.ts
  return (
    new DocumentBuilder()
      .setTitle("EZPG API")
      .setDescription("API documentation for the EZPG Payment Gateway")
      .setVersion("1.0")
      // --- REMOVE Server Definition --- //
      // Removing this prevents Swagger UI from incorrectly duplicating the path prefix.
      // The actual client relies on the apiClient baseURL and generated method paths.
      // .addServer("/api/v1", "Local Development Server V1")
      .addBearerAuth(
        // Define Bearer Auth security scheme (for JWT access/temp tokens)
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          name: "JWT",
          description: "Enter JWT token (Access Token or Temp Token for TFA)",
          in: "header",
        },
        "jwt-bearer-auth", // Name this security scheme
      )
      .addSecurity("jwt-refresh", {
        // Define scheme for refresh token
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "Enter Refresh Token",
        in: "header",
      })
      .addSecurity("csrf", {
        // Define scheme for CSRF token
        type: "apiKey",
        name: "X-CSRF-Token", // Match the header name used by the client interceptor
        in: "header",
        description: "CSRF Token obtained from /auth/csrf-token endpoint",
      })
      // Default security requirement (can be overridden by @ApiSecurity or @Public)
      // If most endpoints need JWT bearer auth, you might add:
      // .addSecurityRequirements('jwt-bearer-auth')
      // If most endpoints need CSRF protection (non-GET), you might add:
      .addSecurityRequirements("csrf")
      .build()
  );
}

/**
 * Options for Swagger document generation
 * Used to control how the OpenAPI document is generated
 */
export const swaggerOptions: SwaggerDocumentOptions = {
  // Add consistent schema naming for enums to avoid duplication
  operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
};

// Create classes for each enum to fix the extraModels issue
class WithdrawalStatusClass {}

Object.defineProperties(
  WithdrawalStatusClass,
  Object.getOwnPropertyDescriptors(WithdrawalStatus),
);

class WithdrawalMethodClass {}

Object.defineProperties(
  WithdrawalMethodClass,
  Object.getOwnPropertyDescriptors(WithdrawalMethod),
);

class SearchCriteriaTypeClass {}

Object.defineProperties(
  SearchCriteriaTypeClass,
  Object.getOwnPropertyDescriptors(SearchCriteriaType),
);

class SortOrderEnumClass {}

Object.defineProperties(
  SortOrderEnumClass,
  Object.getOwnPropertyDescriptors(SortOrderEnum),
);

class MerchantSearchTypeClass {}

Object.defineProperties(
  MerchantSearchTypeClass,
  Object.getOwnPropertyDescriptors(MerchantSearchType),
);

class AgentSearchTypeClass {}

Object.defineProperties(
  AgentSearchTypeClass,
  Object.getOwnPropertyDescriptors(AgentSearchType),
);

class UserTypeClass {}

Object.defineProperties(UserTypeClass, {
  ADMIN: { value: "ADMIN" },
  MERCHANT: { value: "MERCHANT" },
  AGENT: { value: "AGENT" },
});

class TimePeriodClass {}

Object.defineProperties(
  TimePeriodClass,
  Object.getOwnPropertyDescriptors(TimePeriod),
);

class DepositFormatTypeClass {}

Object.defineProperties(
  DepositFormatTypeClass,
  Object.getOwnPropertyDescriptors(DepositFormatType),
);

class DepositStatusTypeClass {}

Object.defineProperties(
  DepositStatusTypeClass,
  Object.getOwnPropertyDescriptors(DepositStatusType),
);

/**
 * Extra schema models for Swagger document generation
 * Centralized enum schema definitions as Function[] (required by Swagger)
 */
import { LogAction } from "./core/logging/log-action.enum";
import { TransactionStatus } from "./common/enums/transaction-status.enum";
import { DepositSearchFieldEnum } from "./common/enums/deposit-search-field.enum";
import { TransactionType } from "./admin/dashboard/dto/admin-dashboard-recent-transactions.dto";
import { AlarmSeverity } from "./admin/dashboard/dto/admin-dashboard-alarm.dto";
import { ActivityType } from "./admin/dashboard/dto/admin-dashboard-activity.dto";
import { AgentStatus } from "./admin/agents/dto/agent-status.enum";
import { BalanceOperationType } from "./admin/agents/dto/agent-balance-update.dto";

class LogActionClass {}

Object.defineProperties(
  LogActionClass,
  Object.getOwnPropertyDescriptors(LogAction),
);

class LogSeverityClass {}

Object.defineProperties(
  LogSeverityClass,
  Object.getOwnPropertyDescriptors(LogSeverity),
);

class TransactionStatusClass {}

Object.defineProperties(
  TransactionStatusClass,
  Object.getOwnPropertyDescriptors(TransactionStatus),
);

class DepositSearchFieldEnumClass {}

Object.defineProperties(
  DepositSearchFieldEnumClass,
  Object.getOwnPropertyDescriptors(DepositSearchFieldEnum),
);

class TransactionTypeClass {}

Object.defineProperties(
  TransactionTypeClass,
  Object.getOwnPropertyDescriptors(TransactionType),
);

class AlarmSeverityClass {}

Object.defineProperties(
  AlarmSeverityClass,
  Object.getOwnPropertyDescriptors(AlarmSeverity),
);

class ActivityTypeClass {}

Object.defineProperties(
  ActivityTypeClass,
  Object.getOwnPropertyDescriptors(ActivityType),
);

class AgentStatusClass {}

Object.defineProperties(
  AgentStatusClass,
  Object.getOwnPropertyDescriptors(AgentStatus),
);

class BalanceOperationTypeClass {}

Object.defineProperties(
  BalanceOperationTypeClass,
  Object.getOwnPropertyDescriptors(BalanceOperationType),
);

export const extraModels: Function[] = [
  WithdrawalStatusClass,
  WithdrawalMethodClass,
  SearchCriteriaTypeClass,
  SortOrderEnumClass,
  MerchantSearchTypeClass,
  AgentSearchTypeClass,
  UserTypeClass,
  TimePeriodClass,
  DepositFormatTypeClass,
  DepositStatusTypeClass,
  LogActionClass,
  LogSeverityClass,
  TransactionStatusClass,
  DepositSearchFieldEnumClass,
  TransactionTypeClass,
  AlarmSeverityClass,
  ActivityTypeClass,
  AgentStatusClass,
  BalanceOperationTypeClass,
];
