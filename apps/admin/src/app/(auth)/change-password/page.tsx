"use client";

import { AuthLayout, ChangePasswordPage, ADMIN_AUTH_CONFIG } from "@ezpg/auth";

export default function AdminChangePasswordPage() {
  return (
    <AuthLayout config={ADMIN_AUTH_CONFIG}>
      <ChangePasswordPage config={ADMIN_AUTH_CONFIG} />
    </AuthLayout>
  );
}
