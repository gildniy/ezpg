"use client";

import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { getLocalStorageItem, setLocalStorageItem } from "../lib/local-storage";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "theme";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Initialize with "system" but this will be immediately updated in useEffect
  const [theme, setThemeState] = useState<Theme>("system");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load theme from localStorage on initial mount
  useEffect(() => {
    // Skip if not in browser
    if (typeof window === "undefined") return;

    // First try to get from localStorage
    const savedTheme = getLocalStorageItem(THEME_KEY) as Theme | null;

    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      // If we have a valid saved theme, use it
      setThemeState(savedTheme);
    } else {
      // If no saved theme, default to system and save it
      setThemeState("system");
      setLocalStorageItem(THEME_KEY, "system");
    }

    setInitialized(true);
  }, []);

  // Update dark mode status and apply classes whenever theme changes
  useEffect(() => {
    // Skip if not in browser or not initialized yet
    if (typeof window === "undefined" || !initialized) return;

    // Calculate if dark mode is active
    const isSystemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const isDark = theme === "dark" || (theme === "system" && isSystemDark);

    // Set dark mode class on document
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Update state
    setIsDarkMode(isDark);

    // Save to localStorage
    setLocalStorageItem(THEME_KEY, theme);
  }, [theme, initialized]);

  // Add listener for system preference changes
  useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const newIsDark = mediaQuery.matches;
      if (newIsDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      setIsDarkMode(newIsDark);
    };

    // Add listener using the appropriate method
    try {
      // Modern browsers
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } catch (e) {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  // Set theme function (direct)
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setLocalStorageItem(THEME_KEY, newTheme);
  };

  // Toggle theme function (cycles through options)
  const toggleTheme = () => {
    const newTheme: Theme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

    setThemeState(newTheme);
    setLocalStorageItem(THEME_KEY, newTheme);
  };

  return (
    <NextThemesProvider {...props}>
      <ThemeContext.Provider
        value={{ theme, toggleTheme, setTheme, isDarkMode }}
      >
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
