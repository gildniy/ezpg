"use client";

import React, { useEffect, useState } from "react";

import {
  BarChart,
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  LineChart,
  Menu,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  User,
  Users,
} from "lucide-react";
import { Button } from "@ezpg/ui";
import { useTheme } from "@ezpg/ui";
import { useLanguage } from "@ezpg/hooks";
import { useAuth, useMediaQuery } from "@ezpg/hooks";
import {
  NavigationProvider,
  useNavigation,
} from "@/contexts/navigation-context";

function DashboardApp() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  const { activePage, navigateTo } = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { logout, user: authUser } = useAuth();

  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const menuItems = [
    {
      name: t("dashboard"),
      icon: <BarChart className="h-4 w-4" />,
      path: "dashboard",
      onClick: () => navigateTo("dashboard"),
    },
    {
      name: t("salesManagement"),
      icon: <LineChart className="h-4 w-4" />,
      path: "deposits",
      onClick: () => navigateTo("deposits"),
    },
    {
      name: t("withdrawalManagement"),
      icon: <CreditCard className="h-4 w-4" />,
      path: "withdrawals",
      onClick: () => navigateTo("withdrawals"),
    },
    {
      name: t("virtualAccountInfo"),
      icon: <CreditCard className="h-4 w-4" />,
      path: "virtual-accounts",
      onClick: () => navigateTo("virtual-accounts"),
    },
    {
      name: t("inquiries"),
      icon: <MessageSquare className="h-4 w-4" />,
      path: "inquiries",
      onClick: () => navigateTo("inquiries"),
    },
    {
      name: t("notices"),
      icon: <FileText className="h-4 w-4" />,
      path: "notices",
      onClick: () => navigateTo("notices"),
    },
    {
      name: t("myPage"),
      path: "operations/my-page",
      onClick: () => navigateTo("operations-my-page"),
    },
  ];

  const Overlay = () => (
    <div
      className={`fixed inset-0 bg-black/50 z-20 md:hidden ${sidebarOpen ? "block" : "hidden"}`}
      onClick={() => setSidebarOpen(false)}
    />
  );

  const renderContent = () => {
    switch (activePage) {
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div
      className={`flex min-h-screen relative ${theme === "dark" ? "dark" : ""}`}
    >
      <Overlay />

      <div
        className={`${
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0 md:w-0"
        } fixed md:relative z-30 h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-all duration-300 overflow-hidden flex flex-col border-r border-gray-200 dark:border-gray-700`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-xl text-blue-500 dark:text-blue-400">
            EZPG
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 dark:text-gray-400 md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="bg-purple-600 dark:bg-purple-700 p-4 text-white">
          <div className="text-sm">{t("welcomeMessage")}</div>
          <div className="text-sm font-bold">{t("admin")}</div>
          <div className="text-xs mt-1">{t("admin")}</div>
        </div>

        <div className="overflow-y-auto flex-1 pt-3">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              <div
                className={`px-4 py-3 text-sm flex items-center justify-between cursor-pointer ${
                  activePage === item.path
                    ? "bg-blue-500 text-white dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-800"
                    : "hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                }`}
                onClick={item.onClick}
              >
                <div className="flex items-center gap-2">
                  {item.icon && (
                    <span
                      className={`${activePage === item.path ? "text-white" : ""}`}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span>{item.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-auto p-4 bg-red-500 dark:bg-red-600 text-white text-center cursor-pointer hover:bg-red-600 dark:hover:bg-red-700 transition-colors w-full border-none"
        >
          <div className="text-sm font-medium">{t("logout")}</div>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="mr-2 text-gray-500 dark:text-gray-400"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-lg font-medium truncate">{t("systemName")}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
            <button
              onClick={toggleTheme}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t("admin")}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-auto">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="p-2 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <p>{t("copyright")}</p>
        </footer>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <NavigationProvider>
      <DashboardApp />
    </NavigationProvider>
  );
}
