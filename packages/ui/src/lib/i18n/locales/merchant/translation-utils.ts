import koTranslations from "./ko.json";
import enTranslations from "./en.json";

export type Language = "ko" | "en";
export type TranslationKey = keyof typeof koTranslations;
export type NestedTranslationKey<T extends TranslationKey> =
  keyof (typeof koTranslations)[T];

// Type-safe translation interface
export interface Translations {
  ko: typeof koTranslations;
  en: typeof enTranslations;
}

export const translations: Translations = {
  ko: koTranslations,
  en: enTranslations,
};

// Utility function to get nested translation
export function getTranslation<
  T extends TranslationKey,
  K extends NestedTranslationKey<T>,
>(language: Language, category: T, key: K): string {
  return translations[language][category][key] as string;
}

// Helper functions for specific categories
export const dashboardTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.dashboard) =>
    getTranslation(language, "dashboard", key),
};

export const salesTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.sales) =>
    getTranslation(language, "sales", key),
};

export const withdrawalTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.withdrawal) =>
    getTranslation(language, "withdrawal", key),
};

export const merchantTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.merchant) =>
    getTranslation(language, "merchant", key),
};

export const agentTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.agent) =>
    getTranslation(language, "agent", key),
};

export const memberTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.member) =>
    getTranslation(language, "member", key),
};

export const settlementTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.settlement) =>
    getTranslation(language, "settlement", key),
};

export const operationTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.operation) =>
    getTranslation(language, "operation", key),
};

export const userTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.user) =>
    getTranslation(language, "user", key),
};

export const tableTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.table) =>
    getTranslation(language, "table", key),
};

export const formTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.form) =>
    getTranslation(language, "form", key),
};

export const filterTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.filter) =>
    getTranslation(language, "filter", key),
};

export const statusTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.status) =>
    getTranslation(language, "status", key),
};

// Updated to use common section for period-related translations
export const periodTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.common) =>
    getTranslation(language, "common", key),
};

export const commonTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.common) =>
    getTranslation(language, "common", key),
};

export const navigationTranslations = {
  get: (language: Language, key: keyof typeof koTranslations.navigation) =>
    getTranslation(language, "navigation", key),
};

// Example usage with React hook
export function useTranslations(language: Language) {
  return {
    dashboard: (key: keyof typeof koTranslations.dashboard) =>
      dashboardTranslations.get(language, key),
    sales: (key: keyof typeof koTranslations.sales) =>
      salesTranslations.get(language, key),
    withdrawal: (key: keyof typeof koTranslations.withdrawal) =>
      withdrawalTranslations.get(language, key),
    merchant: (key: keyof typeof koTranslations.merchant) =>
      merchantTranslations.get(language, key),
    agent: (key: keyof typeof koTranslations.agent) =>
      agentTranslations.get(language, key),
    member: (key: keyof typeof koTranslations.member) =>
      memberTranslations.get(language, key),
    settlement: (key: keyof typeof koTranslations.settlement) =>
      settlementTranslations.get(language, key),
    operation: (key: keyof typeof koTranslations.operation) =>
      operationTranslations.get(language, key),
    user: (key: keyof typeof koTranslations.user) =>
      userTranslations.get(language, key),
    table: (key: keyof typeof koTranslations.table) =>
      tableTranslations.get(language, key),
    form: (key: keyof typeof koTranslations.form) =>
      formTranslations.get(language, key),
    filter: (key: keyof typeof koTranslations.filter) =>
      filterTranslations.get(language, key),
    status: (key: keyof typeof koTranslations.status) =>
      statusTranslations.get(language, key),
    // Updated to use common section for period-related translations
    period: (key: keyof typeof koTranslations.common) =>
      commonTranslations.get(language, key),
    common: (key: keyof typeof koTranslations.common) =>
      commonTranslations.get(language, key),
    navigation: (key: keyof typeof koTranslations.navigation) =>
      navigationTranslations.get(language, key),
  };
}

// Simple translation function with fallback
export function t(
  language: Language,
  category: TranslationKey,
  key: string,
  fallback?: string,
): string {
  try {
    const categoryTranslations = translations[language][category] as Record<
      string,
      string
    >;
    return categoryTranslations[key] || fallback || key;
  } catch {
    return fallback || key;
  }
}
