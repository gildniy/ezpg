"use client";

import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, Toaster, LanguageProvider } from "@ezpg/ui";
import { AuthProvider, ApiProvider } from "../contexts";
import { AuthAppConfig } from "../types";

interface AuthProvidersProps {
  children: ReactNode;
  config: AuthAppConfig;
  queryClient?: QueryClient;
}

// Create a default query client
const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Disable automatic refetching on window focus
      retry: 1, // Only retry failed queries once
    },
  },
});

export function AuthProviders({
  children,
  config,
  queryClient = defaultQueryClient,
}: AuthProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider>
        <LanguageProvider>
          <ThemeProvider attribute="class">
            <AuthProvider config={config}>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </ApiProvider>
    </QueryClientProvider>
  );
}
