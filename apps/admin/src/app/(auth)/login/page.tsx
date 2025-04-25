"use client";

import { AuthLayout, LoginPage, ADMIN_AUTH_CONFIG } from "@ezpg/auth";

export default function AdminLoginPage() {
  return (
    <AuthLayout config={ADMIN_AUTH_CONFIG}>
      <LoginPage config={ADMIN_AUTH_CONFIG} />
    </AuthLayout>
  );
}
