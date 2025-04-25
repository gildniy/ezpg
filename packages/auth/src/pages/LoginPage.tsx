"use client";

import React from "react";
import { AuthAppConfig } from "../types";
import { LoginForm } from "../components/LoginForm";

interface LoginPageProps {
  config: AuthAppConfig;
}

export function LoginPage({ config }: LoginPageProps) {
  return <LoginForm config={config} />;
}
