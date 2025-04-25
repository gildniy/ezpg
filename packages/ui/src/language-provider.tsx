"use client";

import type React from "react";
import { LanguageProvider as Provider } from "./contexts/language-context";

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  return <Provider>{children}</Provider>;
}
