"use client";

import React from "react";
import { AuthAppConfig } from "../types";
import { TfaForm } from "../components/TfaForm";

interface VerifyTfaPageProps {
  config: AuthAppConfig;
}

export function VerifyTfaPage({ config }: VerifyTfaPageProps) {
  return <TfaForm config={config} />;
}
