"use client";

import { ReactNode } from "react";
import { AuthProviders, ADMIN_AUTH_CONFIG } from "@ezpg/auth";

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProviders config={ADMIN_AUTH_CONFIG}>{children}</AuthProviders>;
}
