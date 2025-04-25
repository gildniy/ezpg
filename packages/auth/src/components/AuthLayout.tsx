"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthStatus, useAuth } from "@ezpg/hooks";
import { LoadingScreen, useTheme, useLanguage } from "@ezpg/ui";
import { AuthAppConfig } from "../types";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface AuthLayoutProps {
  children: React.ReactNode;
  config: AuthAppConfig;
}

export function AuthLayout({ children, config }: AuthLayoutProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const { status, isLoading } = useAuth();
  const router = useRouter();

  // Effect to check auth status
  useEffect(() => {
    // Only run after validation completes
    if (!isLoading && mounted) {
      const currentPath = window.location.pathname;

      // Check if this path allows the current auth status
      const isLoginPath = currentPath === "/login";
      const isVerifyTfaPath = currentPath === "/verify-tfa";
      const isChangePasswordPath = currentPath === "/change-password";

      // Authenticated users shouldn't be on login page
      if (status === AuthStatus.Authenticated) {
        router.push(config.redirects.afterLogin);
        return;
      }

      // Users requiring 2FA should only be on the 2FA page
      if (status === AuthStatus.NeedsTfa && !isVerifyTfaPath) {
        router.push("/verify-tfa");
        return;
      }

      // Users requiring password change should only be on password change page
      if (status === AuthStatus.NeedsPasswordChange && !isChangePasswordPath) {
        router.push("/change-password");
        return;
      }

      // Unauthenticated users should stay on login page
      if (
        status === AuthStatus.Unauthenticated &&
        !isLoginPath &&
        !isVerifyTfaPath &&
        !isChangePasswordPath
      ) {
        router.push("/login");
        return;
      }
    }
  }, [status, isLoading, router, mounted, config.redirects.afterLogin]);

  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading screen while validating token or not mounted
  if (!mounted || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ease-in-out ${
        isDarkMode ? "dark bg-[#111827] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b transition-colors duration-300 ease-in-out ${
          isDarkMode ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              {config.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt={config.appName}
                  className="h-8"
                />
              ) : (
                <span
                  className="text-2xl font-bold"
                  style={{ color: config.brandColor || "#3B82F6" }}
                >
                  {config.appName}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Language Switcher - Only show if enabled */}
            {config.features.languageSwitcher && (
              <LanguageSwitcher
                currentLanguage={language}
                onLanguageChange={(lang: string) =>
                  setLanguage(lang as "en" | "ko")
                }
              />
            )}

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className={`p-2 transition-colors duration-300 ease-in-out ${
                isDarkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              } bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer
        className={`border-t transition-colors duration-300 ease-in-out ${
          isDarkMode ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div
              className={`text-center text-sm transition-colors duration-300 ease-in-out ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              } md:text-left`}
            >
              {t(
                "auth.common.footer.copyright",
                `© ${new Date().getFullYear()} ${config.appName}. All rights reserved.`,
              )
                .replace("{year}", new Date().getFullYear().toString())
                .replace("{appName}", config.appName)}
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className={`text-sm transition-colors duration-300 ease-in-out ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("auth.common.footer.terms", "이용약관")}
              </a>
              <a
                href="#"
                className={`text-sm transition-colors duration-300 ease-in-out ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("auth.common.footer.privacy", "개인정보처리방침")}
              </a>
              <a
                href="#"
                className={`text-sm transition-colors duration-300 ease-in-out ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("auth.common.footer.support", "고객지원")}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
