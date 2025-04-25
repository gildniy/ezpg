"use client";

import React from "react";
import { AuthAppConfig } from "../types";
import { ChangePasswordForm } from "../components/ChangePasswordForm";

interface ChangePasswordPageProps {
  config: AuthAppConfig;
}

export function ChangePasswordPage({ config }: ChangePasswordPageProps) {
  return <ChangePasswordForm config={config} />;
}
