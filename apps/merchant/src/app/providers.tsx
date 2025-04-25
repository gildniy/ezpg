"use client";

import { ReactNode } from "react";
import { AuthProviders, MERCHANT_AUTH_CONFIG } from "@ezpg/auth";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProviders config={MERCHANT_AUTH_CONFIG}>{children}</AuthProviders>
  );
}
