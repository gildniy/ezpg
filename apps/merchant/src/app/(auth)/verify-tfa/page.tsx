"use client";

import { AuthLayout, VerifyTfaPage, MERCHANT_AUTH_CONFIG } from "@ezpg/auth";

export default function MerchantVerifyTfaPage() {
  return (
    <AuthLayout config={MERCHANT_AUTH_CONFIG}>
      <VerifyTfaPage config={MERCHANT_AUTH_CONFIG} />
    </AuthLayout>
  );
}
