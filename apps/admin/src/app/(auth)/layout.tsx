"use client";

import type React from "react";
import { AuthLayout, ADMIN_AUTH_CONFIG } from "@ezpg/auth";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AdminAuthLayout({ children }: AuthLayoutProps) {
  return <AuthLayout config={ADMIN_AUTH_CONFIG}>{children}</AuthLayout>;
}
