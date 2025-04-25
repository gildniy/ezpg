"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "../contexts/theme-context";

export const LoadingScreen: React.FC = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only run theme detection after component has mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't calculate theme until after mount to prevent hydration mismatch
  if (!mounted) {
    // Return a neutral loading screen that works with both themes
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            EZPG
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            인증 상태 확인 중...
          </p>
        </div>
      </div>
    );
  }

  // After mounting, we can safely determine theme
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <h2
          className={`text-xl font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}
        >
          EZPG
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          인증 상태 확인 중...
        </p>
      </div>
    </div>
  );
};
