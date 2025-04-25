"use client";

import { useCallback, useState } from "react";
import { AdminUserManagementApi } from "@ezpg/api-client";
import {
  EnableTfaDto,
  UpdateMerchantStatusDto,
  UpdatePasswordDto,
  TfaSetupResponseDto,
  TfaResetResponseDto,
} from "@ezpg/api-client/src/generated/api";
import apiClient from "@ezpg/api-client/src/apiClient";

export interface User {
  userId: string;
  username: string;
  roleId: number;
  roleName: string;
  tfaEnabled: boolean;
  firstLogin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create users API instance using the apiClient
const usersApi = new AdminUserManagementApi(undefined, undefined, apiClient);

export interface UseUsersResult {
  isLoading: boolean;
  error: Error | null;
  resetTfa: (userId: string) => Promise<TfaResetResponseDto | null>;
  updateMerchantStatus: (
    merchantId: string,
    status: boolean,
  ) => Promise<User | null>;
  updatePassword: (userId: string, newPassword: string) => Promise<boolean>;
  generateTfaSetup: (userId: string) => Promise<TfaSetupResponseDto | null>;
  enableTfa: (userId: string, secret: string) => Promise<boolean>;
  disableTfa: (userId: string) => Promise<boolean>;
}

export function useUsers(): UseUsersResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Reset TFA for a user
  const resetTfa = useCallback(
    async (userId: string): Promise<TfaResetResponseDto | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await usersApi.resetTfa(userId);
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [], // No dependencies needed as usersApi is constant
  );

  // Update merchant status
  const updateMerchantStatus = useCallback(
    async (merchantId: string, status: boolean): Promise<User | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const updateMerchantStatusDto: UpdateMerchantStatusDto = {
          isActive: status,
        };

        const response = await usersApi.updateMerchantStatus(
          merchantId,
          updateMerchantStatusDto,
        );
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [], // No dependencies needed as usersApi is constant
  );

  // Update user password
  const updatePassword = useCallback(
    async (userId: string, newPassword: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatePasswordDto: UpdatePasswordDto = {
          newPassword,
        };

        await usersApi.updatePassword(userId, updatePasswordDto);
        setIsLoading(false);
        return true;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return false;
      }
    },
    [], // No dependencies needed as usersApi is constant
  );

  // Generate TFA setup
  const generateTfaSetup = useCallback(
    async (userId: string): Promise<TfaSetupResponseDto | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await usersApi.generateTfaSetup(userId);
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [], // No dependencies needed as usersApi is constant
  );

  // Enable TFA
  const enableTfa = useCallback(
    async (userId: string, secret: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const enableTfaDto: EnableTfaDto = {
          secret,
        };

        await usersApi.enableTfa(userId, enableTfaDto);
        setIsLoading(false);
        return true;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return false;
      }
    },
    [], // No dependencies needed as usersApi is constant
  );

  // Disable TFA
  const disableTfa = useCallback(
    async (userId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await usersApi.disableTfa(userId);
        setIsLoading(false);
        return true;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return false;
      }
    },
    [], // No dependencies needed as usersApi is constant
  );

  return {
    isLoading,
    error,
    resetTfa,
    updateMerchantStatus,
    updatePassword,
    generateTfaSetup,
    enableTfa,
    disableTfa,
  };
}
