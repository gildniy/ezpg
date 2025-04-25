"use client";

import { AuthLayout, VerifyTfaPage, ADMIN_AUTH_CONFIG } from "@ezpg/auth";

export default function AdminVerifyTfaPage() {
  return (
    <AuthLayout config={ADMIN_AUTH_CONFIG}>
      <VerifyTfaPage config={ADMIN_AUTH_CONFIG} />
    </AuthLayout>
  );
}
