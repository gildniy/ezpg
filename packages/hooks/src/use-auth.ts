"use client";

import {
  AuthenticationApi,
  LoginDto,
  VerifyTfaDto,
  FirstLoginChangePasswordDto,
} from "@ezpg/api-client";
import apiClient, { clearCsrfTokenCache } from "@ezpg/api-client/src/apiClient";
import { RoleName } from "@ezpg/database";
import { AxiosError } from "axios";
import { useState, useEffect, useCallback } from "react";

import { AuthStatus } from "./auth-status";

// --- Reusable Types ---

// Define a type for the user profile object returned by the API
interface AuthUserProfile {
  userId: string;
  username: string;
  role: RoleName; // Use RoleName enum
  tfaVerified: boolean; // Assuming this comes from JwtUser
  firstLogin: boolean;
  tfaEnabled: boolean;
  // Add other fields from Prisma User that are present in JwtUser/getProfile response
  // For example, if these are part of what getProfile returns:
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Note: Do not include sensitive fields like password_hash or tfa_secret
}

// ProfileResponse is now AuthUserProfile
type ProfileResponse = AuthUserProfile;

// Return type adjusted: no token exposed
export interface UseAuthReturn {
  user: AuthUserProfile | null;
  status: AuthStatus;
  login: (credentials: LoginDto) => Promise<void>;
  verifyTfa: (code: string) => Promise<void>;
  setPasswordFirstLogin: (
    passwordsDto: FirstLoginChangePasswordDto,
  ) => Promise<void>;
  logout: () => Promise<void>; // Logout might need to be async now
  isLoading: boolean;
}

// --- Hook Implementation ---

// Create auth API instance using the apiClient from @ezpg/api-client
const authApi = new AuthenticationApi(undefined, undefined, apiClient);

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.Unknown); // Start as unknown
  const [actionIsLoading, setActionIsLoading] = useState<boolean>(false);

  // Remove getAuthConfig helper

  // --- Check Authentication Status Function ---
  const checkAuthStatus = useCallback(async () => {
    setStatus(AuthStatus.Loading);
    try {
      // Use the typed API client method to get the user profile
      const response = await authApi.getProfile();
      const profile = response.data as unknown as ProfileResponse;
      setUser(profile);
      if (profile.firstLogin) {
        setStatus(AuthStatus.NeedsPasswordChange);
      } else {
        setStatus(AuthStatus.Authenticated);
      }
    } catch (error) {
      // Check if it's an AxiosError and specifically a 401 or 403
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          setStatus(AuthStatus.Unauthenticated);
        } else if (axiosError.response?.status === 403) {
          // Handle specific 403 cases if needed (e.g., password change required)
          const responseData = axiosError.response?.data as any;
          if (responseData?.code === "PASSWORD_CHANGE_REQUIRED") {
            setStatus(AuthStatus.NeedsPasswordChange);
          } else {
            // Generic 403 - treat as unauthenticated or specific error state
            console.error("Forbidden access during auth check:", error);
            setStatus(AuthStatus.Unauthenticated); // Or a specific error status
          }
        } else {
          // Other Axios errors (network, server error, etc.)
          console.error("Error checking auth status:", error);
          setStatus(AuthStatus.Unauthenticated); // Fallback to unauthenticated on errors
        }
      } else {
        // Non-Axios errors
        console.error("Unexpected error checking auth status:", error);
        setStatus(AuthStatus.Unauthenticated); // Fallback
      }
      setUser(null); // Clear user data on error
    }
  }, []);

  // --- Initialization Effect ---
  useEffect(() => {
    checkAuthStatus(); // Check status on initial load and allow redirects
  }, [checkAuthStatus]);

  // --- Action Functions (Simplified) ---
  const handleLogin = useCallback(
    async (credentials: LoginDto) => {
      setActionIsLoading(true);
      console.log("[useAuth] Login attempt with:", credentials.username);
      try {
        // Use the typed API client method for authentication
        const response = await authApi.login(credentials);

        // Safe access to response data
        const responseData = response.data as unknown;
        console.log("[useAuth] Login response data:", responseData);

        // Type guard to check if response is an object with our expected properties
        const isResponseObject = (
          obj: unknown,
        ): obj is { tfaRequired?: boolean; firstLogin?: boolean } => {
          return obj !== null && typeof obj === "object";
        };

        if (isResponseObject(responseData)) {
          const tfaRequired = responseData.tfaRequired === true;
          const firstLogin = responseData.firstLogin === true;

          console.log(
            `[useAuth] Parsed values - tfaRequired: ${tfaRequired}, firstLogin: ${firstLogin}`,
          );

          if (tfaRequired) {
            console.log(
              "[useAuth] TFA required, redirecting to TFA verification",
            );
            setStatus(AuthStatus.NeedsTfa);
            setUser(null);
          } else if (firstLogin) {
            console.log(
              "[useAuth] First login detected, redirecting to password change",
            );
            setStatus(AuthStatus.NeedsPasswordChange);
            setUser(null);
          } else {
            console.log("[useAuth] Normal login, fetching full profile");
            await checkAuthStatus();
          }
        } else {
          console.error("[useAuth] Unexpected response format");
          setStatus(AuthStatus.Unauthenticated);
          throw new Error("Unexpected response format from login");
        }
      } catch (error) {
        console.error("[useAuth] Login error:", error);
        if (error instanceof AxiosError) {
          console.error("[useAuth] Axios error details:", error.response?.data);
        }
        setStatus(AuthStatus.Unauthenticated);
        setUser(null);
        throw error;
      } finally {
        setActionIsLoading(false);
      }
    },
    [checkAuthStatus],
  );

  const handleVerifyTfa = useCallback(
    async (code: string) => {
      setActionIsLoading(true);
      try {
        const verifyDto: VerifyTfaDto = { tfaCode: code };
        // Use the typed API client method for TFA verification
        const response = await authApi.verifyTfa(verifyDto);
        // Check response for firstLogin flag if applicable
        const { firstLogin } = response.data as any; // Adjust as needed

        console.log(`[handleVerifyTfa] Response firstLogin: ${firstLogin}`);
        console.log(`[handleVerifyTfa] Current status: ${status}`);

        if (firstLogin) {
          console.log(
            "[handleVerifyTfa] Setting status to needs-password-change",
          );
          setStatus(AuthStatus.NeedsPasswordChange);
          setUser(null);
        } else {
          console.log("[handleVerifyTfa] Setting status to authenticated");
          setStatus(AuthStatus.Authenticated);
          // Successfully verified, cookie set, fetch profile
          await checkAuthStatus();
        }
      } catch (error) {
        console.error("TFA verification failed:", error);
        // Don't necessarily change status, let user retry?
        throw error;
      } finally {
        setActionIsLoading(false);
      }
    },
    [checkAuthStatus, status],
  );

  // --- UPDATED: Now specifically for FIRST LOGIN ---
  const handleSetPasswordFirstLogin = useCallback(
    async (passwordsDto: FirstLoginChangePasswordDto) => {
      setActionIsLoading(true);
      try {
        // Use the typed API client method for setting the first login password
        await authApi.setPasswordFirstLogin(passwordsDto);

        // Revert to calling checkAuthStatus after success
        console.log(
          "[handleSetPasswordFirstLogin] Success, calling checkAuthStatus...",
        );
        await checkAuthStatus(); // <-- Re-add this call
      } catch (error) {
        console.error("First login password set failed:", error);
        throw error; // Re-throw for the form to handle
      } finally {
        setActionIsLoading(false);
      }
    },
    // Add checkAuthStatus back as a dependency
    [checkAuthStatus],
  );

  const handleLogout = useCallback(async () => {
    setActionIsLoading(true);
    console.log("[useAuth] Logging out user");
    try {
      // First set the status to ensure UI updates immediately
      setStatus(AuthStatus.Unauthenticated);
      setUser(null);

      // Then call the API to invalidate the server-side session
      await authApi.logout();

      // Clear the CSRF token cache
      clearCsrfTokenCache();

      console.log("[useAuth] Logout successful");
    } catch (error) {
      console.error("[useAuth] Logout error:", error);
      // Even if the API call fails, we still want to clear client state
      setStatus(AuthStatus.Unauthenticated);
      setUser(null);

      // Clear the CSRF token cache if it exists, even on error
      clearCsrfTokenCache();
    } finally {
      setActionIsLoading(false);
    }
  }, []);

  return {
    user,
    status,
    login: handleLogin,
    verifyTfa: handleVerifyTfa,
    setPasswordFirstLogin: handleSetPasswordFirstLogin,
    logout: handleLogout,
    isLoading: actionIsLoading,
  };
};
