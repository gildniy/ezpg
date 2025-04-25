"use client";

import React from "react";
import { useTheme } from "@ezpg/ui";

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
}: LanguageSwitcherProps) {
  const { isDarkMode } = useTheme();

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "ko" ? "en" : "ko";
    onLanguageChange(newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`px-3 py-1 text-sm font-medium transition-colors duration-300 ease-in-out ${
        isDarkMode
          ? "text-gray-400 hover:text-gray-200"
          : "text-gray-500 hover:text-gray-700"
      } bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent`}
      aria-label="Toggle language"
    >
      {currentLanguage === "ko" ? "한글 ↔ ENG" : "ENG ↔ 한글"}
    </button>
  );
}
