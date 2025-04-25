"use client";

import { useCallback, useState } from "react";
import {
  AdminMerchantsApi,
  CreateMerchantDto,
  MerchantDetailResponseDto,
  SortOrderEnum,
  UpdateMerchantDto,
  UpdateMerchantBalanceDto,
} from "@ezpg/api-client";
import apiClient from "@ezpg/api-client/src/apiClient";

const merchantsApi = new AdminMerchantsApi(undefined, undefined, apiClient);

export interface UseMerchantsResult {
  merchants: MerchantDetailResponseDto[];
  totalPages: number;
  totalMerchants: number;
  isLoading: boolean;
  error: Error | null;
  fetchAll: (
    page?: number,
    limit?: number,
    search?: string,
    sortBy?: string,
    sortOrder?: SortOrderEnum,
    isActive?: boolean,
    groupId?: number,
    viewAsAdminId?: string,
  ) => Promise<void>;
  fetchDeleted: (
    page?: number,
    limit?: number,
    search?: string,
    sortBy?: string,
    sortOrder?: SortOrderEnum,
    isActive?: boolean,
    groupId?: number,
    viewAsAdminId?: string,
  ) => Promise<void>;
  createMerchant: (
    data: CreateMerchantDto,
  ) => Promise<MerchantDetailResponseDto | null>;
  updateMerchant: (
    merchantId: string,
    data: UpdateMerchantDto,
  ) => Promise<MerchantDetailResponseDto | null>;
  deleteMerchant: (merchantId: string) => Promise<boolean>;
  restoreMerchant: (
    merchantId: string,
  ) => Promise<MerchantDetailResponseDto | null>;
  getMerchant: (
    merchantId: string,
    viewAsAdminId?: string,
  ) => Promise<MerchantDetailResponseDto | null>;
  updateMerchantBalance: (
    merchantId: string,
    data: UpdateMerchantBalanceDto,
  ) => Promise<MerchantDetailResponseDto | null>;
}

export function useMerchants(): UseMerchantsResult {
  const [merchants, setMerchants] = useState<MerchantDetailResponseDto[]>([]);
  const [totalMerchants, setTotalMerchants] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all active merchants
  const fetchAll = useCallback(
    async (
      page: number = 1,
      limit: number = 10,
      search?: string,
      sortBy?: string,
      sortOrder: SortOrderEnum = SortOrderEnum.Desc,
      isActive?: boolean,
      groupId?: number,
      viewAsAdminId?: string,
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await merchantsApi.findAll(
          sortOrder,
          page,
          limit,
          search,
          sortBy,
          isActive,
          groupId,
          false, // includeDeleted
          viewAsAdminId,
        );

        if (response.data && response.data.data) {
          setMerchants(
            response.data.data as unknown as MerchantDetailResponseDto[],
          );
          setTotalMerchants(response.data.meta.total);
          setTotalPages(
            response.data.meta.totalPages ||
              Math.ceil(response.data.meta.total / limit),
          );
        } else {
          // Handle empty or unexpected response
          setMerchants([]);
          setTotalMerchants(0);
          setTotalPages(0);
        }
      } catch (err) {
        setError(err as Error);
        setMerchants([]);
        setTotalMerchants(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Fetch deleted merchants
  const fetchDeleted = useCallback(
    async (
      page: number = 1,
      limit: number = 10,
      search?: string,
      sortBy?: string,
      sortOrder: SortOrderEnum = SortOrderEnum.Desc,
      isActive?: boolean,
      groupId?: number,
      viewAsAdminId?: string,
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await merchantsApi.findDeleted(
          sortOrder,
          page,
          limit,
          search,
          sortBy,
          isActive,
          groupId,
          false, // includeDeleted (not needed for findDeleted)
          viewAsAdminId,
        );

        if (response.data && response.data.data) {
          setMerchants(
            response.data.data as unknown as MerchantDetailResponseDto[],
          );
          setTotalMerchants(response.data.meta.total);
          setTotalPages(
            response.data.meta.totalPages ||
              Math.ceil(response.data.meta.total / limit),
          );
        } else {
          // Handle empty or unexpected response
          setMerchants([]);
          setTotalMerchants(0);
          setTotalPages(0);
        }
      } catch (err) {
        setError(err as Error);
        setMerchants([]);
        setTotalMerchants(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Create a new merchant
  const createMerchant = useCallback(
    async (
      data: CreateMerchantDto,
    ): Promise<MerchantDetailResponseDto | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await merchantsApi.registerNewMerchant(data);
        setIsLoading(false);
        return response.data.merchant as unknown as MerchantDetailResponseDto;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [],
  );

  // Update merchant details
  const updateMerchant = useCallback(
    async (
      merchantId: string,
      data: UpdateMerchantDto,
    ): Promise<MerchantDetailResponseDto | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await merchantsApi.update(merchantId, data);
        setIsLoading(false);
        return response.data as unknown as MerchantDetailResponseDto;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [],
  );

  // Delete a merchant (soft delete)
  const deleteMerchant = useCallback(
    async (merchantId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await merchantsApi.remove(merchantId);
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

  // Get merchant details
  const getMerchant = useCallback(
    async (
      merchantId: string,
      viewAsAdminId?: string,
    ): Promise<MerchantDetailResponseDto | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await merchantsApi.findOne(merchantId, viewAsAdminId);
        setIsLoading(false);
        return response.data as unknown as MerchantDetailResponseDto;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [],
  );

  // Update merchant balance
  const updateMerchantBalance = useCallback(
    async (
      merchantId: string,
      data: UpdateMerchantBalanceDto,
    ): Promise<MerchantDetailResponseDto | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await merchantsApi.updateBalance(merchantId, data);
        setIsLoading(false);
        return response.data as unknown as MerchantDetailResponseDto;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [],
  );

  // Restore a merchant
  const restoreMerchant = useCallback(
    async (merchantId: string): Promise<MerchantDetailResponseDto | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await merchantsApi.restoreMerchant(merchantId);
        setIsLoading(false);
        return response.data as unknown as MerchantDetailResponseDto;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [],
  );

  return {
    merchants,
    totalPages,
    totalMerchants,
    isLoading,
    error,
    fetchAll,
    fetchDeleted,
    createMerchant,
    updateMerchant,
    deleteMerchant,
    restoreMerchant,
    getMerchant,
    updateMerchantBalance,
  };
}
