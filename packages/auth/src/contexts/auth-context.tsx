"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AuthStatus,
  useAuth as useSharedAuth,
  UseAuthReturn,
} from "@ezpg/hooks";
import { LoadingScreen } from "@ezpg/ui";
import { AuthAppConfig } from "../types";

interface AuthContextType extends UseAuthReturn {
  isValidatingToken: boolean;
  config: AuthAppConfig;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  config: AuthAppConfig;
}

export const AuthProvider = ({ children, config }: AuthProviderProps) => {
  const auth = useSharedAuth();
  const router = useRouter();
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  const isAuthKnown =
    auth.status !== AuthStatus.Unknown && auth.status !== AuthStatus.Loading;

  useEffect(() => {
    const validateAndRedirect = async () => {
      if (!isAuthKnown) return;

      try {
        setIsValidatingToken(true);

        if (auth.status === AuthStatus.Authenticated) {
          // Check role-based access if configured
          if (config.allowedRoles && auth.user?.role) {
            if (!config.allowedRoles.includes(auth.user.role)) {
              console.log(
                `[AuthProvider] User role '${auth.user.role}' not allowed for ${config.appName}`,
              );
              await auth.logout();
              router.push("/login");
              return;
            }
          }

          // Redirect to after-login page
          router.push(config.redirects.afterLogin);
        } else if (auth.status === AuthStatus.NeedsTfa) {
          router.push("/verify-tfa");
        } else if (auth.status === AuthStatus.NeedsPasswordChange) {
          router.push("/change-password");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error(
          `[AuthProvider ${config.appName}] Validation error:`,
          error,
        );
        router.push("/login");
      } finally {
        setIsInitialLoadComplete(true);
        setIsValidatingToken(false);
      }
    };

    validateAndRedirect();
  }, [auth, router, isAuthKnown, config]);

  if (isValidatingToken || !isInitialLoadComplete) {
    return <LoadingScreen />;
  }

  const enhancedAuth: AuthContextType = {
    ...auth,
    isValidatingToken,
    config,
    logout: async () => {
      await auth.logout();
      window.location.href = `${config.redirects.afterLogout}?_logout=true`;
    },
  };

  return (
    <AuthContext.Provider value={enhancedAuth}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
