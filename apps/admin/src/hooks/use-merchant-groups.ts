"use client";

import { useCallback, useState } from "react";
import {
  AdminMerchantGroupsApi,
  AdminMerchantGroupsCreateDto,
  AdminMerchantGroupsResponseDto,
} from "@ezpg/api-client";
import apiClient from "@ezpg/api-client/src/apiClient";

const merchantGroupsApi = new AdminMerchantGroupsApi(
  undefined,
  undefined,
  apiClient,
);

export interface UseMerchantGroupsResult {
  isLoading: boolean;
  error: Error | null;
  createMerchantGroup: (
    data: AdminMerchantGroupsCreateDto,
  ) => Promise<AdminMerchantGroupsResponseDto | null>;
  getAllMerchantGroups: (
    page?: number,
    limit?: number,
    search?: string,
    includeDeleted?: boolean,
    onlyDeleted?: boolean,
    viewAsAdminId?: string,
  ) => Promise<{
    data: AdminMerchantGroupsResponseDto[];
    meta: { totalPages: number; total: number };
  } | null>;
  getMerchantGroup: (
    id: number,
  ) => Promise<AdminMerchantGroupsResponseDto | null>;
  deleteMerchantGroup: (id: number) => Promise<boolean>;
}

export function useMerchantGroups(): UseMerchantGroupsResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createMerchantGroup = useCallback(
    async (
      data: AdminMerchantGroupsCreateDto,
    ): Promise<AdminMerchantGroupsResponseDto | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await merchantGroupsApi.create(data);
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [],
  );

  const getAllMerchantGroups = useCallback(
    async (
      page?: number,
      limit?: number,
      search?: string,
      includeDeleted?: boolean,
      onlyDeleted?: boolean,
      viewAsAdminId?: string,
    ): Promise<{
      data: AdminMerchantGroupsResponseDto[];
      meta: { totalPages: number; total: number };
    } | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await merchantGroupsApi.findAll(
          page,
          limit,
          undefined, // skip - generated client has skip, but service uses page/limit
          search,
          includeDeleted,
          onlyDeleted,
          viewAsAdminId,
        );
        setIsLoading(false);

        if (response && response.data && Array.isArray(response.data)) {
          // Since the client's findAll directly returns Array<AdminMerchantGroupsResponseDto>
          // we construct a minimal meta object here.
          // True pagination info (total items, total pages) from server is lost with current client typings.
          const items = response.data;
          const totalItems = items.length; // This is only the count of items on the current page.
          return {
            data: items,
            meta: {
              // This totalPages is an estimation based on current page items & limit.
              // Real totalPages should come from the server.
              totalPages: limit ? Math.ceil(totalItems / limit) : 1,
              total: totalItems, // This is also not the grand total from the DB.
            },
          };
        }
        return null; // Or handle as an error if response.data is not as expected
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [],
  );

  const getMerchantGroup = useCallback(
    async (id: number): Promise<AdminMerchantGroupsResponseDto | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await merchantGroupsApi.findOne(id);
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [],
  );

  const deleteMerchantGroup = useCallback(
    async (id: number): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await merchantGroupsApi.remove(id);
        setIsLoading(false);
        return true;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return false;
      }
    },
    [],
  );

  return {
    isLoading,
    error,
    createMerchantGroup,
    getAllMerchantGroups,
    getMerchantGroup,
    deleteMerchantGroup,
  };
}
