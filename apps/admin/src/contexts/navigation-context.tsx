"use client";

import React from "react";
import { createContext, useContext, useState } from "react";

type NavigationContextType = {
  activePage: string;
  navigateTo: (page: string) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 빈 문자열("")에서 "dashboard"로 변경
  const [activePage, setActivePage] = useState("dashboard");

  const navigateTo = (page: string) => {
    setActivePage(page);
  };

  return (
    <NavigationContext.Provider value={{ activePage, navigateTo }}>
      {" "}
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
