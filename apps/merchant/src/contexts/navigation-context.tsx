"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";

// MerchantGroup 타입 정의
export type MerchantGroup = "all" | "reseller" | "shinhan" | "jeju";

// 그룹 이름 매핑 수정 - "테라시스"를 "재판매(테라시스)"로 변경
export const groupNames: Record<MerchantGroup, string> = {
  all: "전체보기",
  reseller: "재판매(테라시스)",
  shinhan: "신협은행",
  jeju: "제주은행",
};

type NavigationContextType = {
  activePage: string;
  navigateTo: (page: string) => void;
  selectedGroup: MerchantGroup;
  setSelectedGroup: (group: MerchantGroup) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedGroup, setSelectedGroup] = useState<MerchantGroup>("all");

  const navigateTo = (page: string) => {
    setActivePage(page);
  };

  return (
    <NavigationContext.Provider
      value={{ activePage, navigateTo, selectedGroup, setSelectedGroup }}
    >
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

export const useNavigationContext = useNavigation;
