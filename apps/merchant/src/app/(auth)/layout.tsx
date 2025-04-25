"use client";

import type React from "react";
import { AuthLayout, MERCHANT_AUTH_CONFIG } from "@ezpg/auth";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function MerchantAuthLayout({ children }: AuthLayoutProps) {
  return <AuthLayout config={MERCHANT_AUTH_CONFIG}>{children}</AuthLayout>;
}
