import { WithdrawalMethod, WithdrawalStatus } from "@ezpg/database";
import { SearchCriteriaType } from "../enums/search-criteria-type.enum";
import { SortOrderEnum } from "../enums/sort-order.enum";
import { MerchantSearchType } from "../enums/merchant-search-type.enum";
import { AgentSearchType } from "../enums/agent-search-type.enum";
import { TimePeriod } from "@ezpg/types";
import { DepositFormatType } from "../enums/deposit-format-type.enum";
import { DepositStatusType } from "../enums/deposit-status-type.enum";

/**
 * Centralized Swagger enum definitions
 *
 * The OpenAPI generator creates a separate enum definition each time an enum is used in a different endpoint.
 * This leads to duplicated definitions with different names but identical values.
 *
 * To prevent this, we define these common enum schemas once and reference them throughout the application.
 */

// Withdrawal status values
export const WithdrawalStatusValues = Object.values(WithdrawalStatus);

// Withdrawal method values
export const WithdrawalMethodValues = Object.values(WithdrawalMethod);

// Search criteria type values (REQUESTED_DATE, PROCESSED_DATE, ACCOUNT_DATE)
export const SearchCriteriaTypeValues = Object.values(SearchCriteriaType);

// Sort order values (ASC, DESC)
export const SortOrderValues = Object.values(SortOrderEnum);

// Order by field values for withdrawal queries
export const WithdrawalOrderByFieldValues = [
  "requestedAt",
  "processedAt",
  "accountDate",
  "amount",
];

// Merchant search type values
export const MerchantSearchTypeValues = Object.values(MerchantSearchType);

// Agent search type values
export const AgentSearchTypeValues = Object.values(AgentSearchType);

// User type values for dashboard activity
export const UserTypeValues = ["ADMIN", "MERCHANT", "AGENT"];

// Time period values for dashboard stats and trends
export const TimePeriodValues = Object.values(TimePeriod);

// Deposit format type values
export const DepositFormatTypeValues = Object.values(DepositFormatType);

// Deposit status type values
export const DepositStatusTypeValues = Object.values(DepositStatusType);
