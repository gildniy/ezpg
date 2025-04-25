"use client";

import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from "react";
import enMerchantTranslations from "../lib/i18n/locales/merchant/en.json";
import koMerchantTranslations from "../lib/i18n/locales/merchant/ko.json";
import enAuthTranslations from "../lib/i18n/locales/auth/en.json";
import koAuthTranslations from "../lib/i18n/locales/auth/ko.json";

// Add global declarations for browser objects
declare global {
  interface Navigator {
    language: string;
  }

  var navigator: Navigator;
  var window: Window & typeof globalThis;
}

type Language = "en" | "ko";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

// Merge translations with auth translations
const translations = {
  en: { ...enMerchantTranslations, ...enAuthTranslations },
  ko: { ...koMerchantTranslations, ...koAuthTranslations },
};

const defaultLanguage = "ko";

function detectSystemLanguage(): Language {
  if (typeof window === "undefined") return defaultLanguage;

  const userLang = navigator.language.split("-")[0]; // Get primary language code
  return userLang === "ko" ? "ko" : "en"; // Default to English for anything else
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return defaultLanguage;

  const storedLang = localStorage.getItem("language") as Language;
  if (storedLang && (storedLang === "en" || storedLang === "ko")) {
    return storedLang;
  }

  return detectSystemLanguage();
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage());

  // Save the language to localStorage when it changes
  useEffect(() => {
    if (language) {
      localStorage.setItem("language", language);
    }
  }, [language]);

  // Translation function with support for nested keys
  const t = (key: string, defaultText?: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // If key not found, return defaultText or key
        return defaultText || key;
      }
    }

    return typeof value === "string" ? value : defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
