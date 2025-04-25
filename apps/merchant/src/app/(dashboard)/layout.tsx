"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NavigationProvider } from "@/contexts/navigation-context";
import { useAuth } from "@ezpg/hooks";
import { AuthStatus } from "@ezpg/hooks";
import { LoadingScreen } from "@ezpg/ui";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { status, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run this check after token validation is complete
    if (!isLoading) {
      // If user is not authenticated, redirect to login
      if (status !== AuthStatus.Authenticated) {
        router.push("/login");
      }
    }
  }, [status, router, isLoading]);

  // While validating token or if not authenticated, show loading screen
  if (isLoading || status !== AuthStatus.Authenticated) {
    return <LoadingScreen />;
  }

  // If authenticated, render the dashboard content
  return <NavigationProvider>{children}</NavigationProvider>;
};

export default DashboardLayout;
