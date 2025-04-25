"use client";

import {
  AuthLayout,
  ChangePasswordPage,
  MERCHANT_AUTH_CONFIG,
} from "@ezpg/auth";

export default function MerchantChangePasswordPage() {
  return (
    <AuthLayout config={MERCHANT_AUTH_CONFIG}>
      <ChangePasswordPage config={MERCHANT_AUTH_CONFIG} />
    </AuthLayout>
  );
}
