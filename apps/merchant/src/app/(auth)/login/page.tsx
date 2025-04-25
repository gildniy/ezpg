"use client";

import { AuthLayout, LoginPage, MERCHANT_AUTH_CONFIG } from "@ezpg/auth";

export default function MerchantLoginPage() {
  return (
    <AuthLayout config={MERCHANT_AUTH_CONFIG}>
      <LoginPage config={MERCHANT_AUTH_CONFIG} />
    </AuthLayout>
  );
}
