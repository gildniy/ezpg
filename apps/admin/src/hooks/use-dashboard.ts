"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminDashboardActivityDto,
  AdminDashboardAnnouncementDto,
  AdminDashboardApi,
  AdminDashboardMerchantPerformanceDto,
  AdminDashboardRecentTransactionDto,
  AdminDashboardRecentTransactionsDto,
  AdminDashboardSummaryStatsDto,
  GetSummaryStatsPeriodEnum,
  AdminDashboardTimezoneStatsDto,
  AdminDashboardTransactionTrendsDto,
} from "@ezpg/api-client";
import apiClient from "@ezpg/api-client/src/apiClient";

// Create dashboard API instance using the apiClient
const dashboardApi = new AdminDashboardApi(undefined, undefined, apiClient);

// Define the options interface
interface RefreshOptions {
  period?: GetSummaryStatsPeriodEnum;
  endDate?: string;
  viewAsAdminId?: string; // Changed to string to match API type
  silent?: boolean; // Flag to control notifications
}

// Define return type for the hook
interface UseDashboardReturn {
  summaryStats: AdminDashboardSummaryStatsDto | null;
  transactionTrends: AdminDashboardTransactionTrendsDto | null;
  timeZoneStats: AdminDashboardTimezoneStatsDto | null;
  merchantPerformance: AdminDashboardMerchantPerformanceDto | null;
  recentTransactions: AdminDashboardRecentTransactionDto[] | null;
  activities: AdminDashboardActivityDto[] | null;
  announcements: AdminDashboardAnnouncementDto[] | null;
  loading: boolean;
  error: Error | null;
  refreshData: (options?: RefreshOptions) => Promise<void>;
  lastRefreshed: Date | null;
  setPeriod: (period: GetSummaryStatsPeriodEnum) => void;
  setEndDate: (endDate: string) => void;
  currentOptions: RefreshOptions;
}

export function useDashboard(): UseDashboardReturn {
  const queryClient = useQueryClient();
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [currentOptions, setCurrentOptions] = useState<RefreshOptions>({
    period: GetSummaryStatsPeriodEnum.Daily,
    silent: true, // Don't show notification on initial load
  });

  // Query key factory functions to ensure consistency
  const getSummaryStatsKey = (options: RefreshOptions) => [
    "dashboard",
    "summaryStats",
    options.period,
    options.endDate,
    options.viewAsAdminId,
  ];

  const getTrendsKey = (options: RefreshOptions) => [
    "dashboard",
    "trends",
    options.period,
    options.endDate,
    options.viewAsAdminId,
  ];

  const getTimeZoneStatsKey = (options: RefreshOptions) => [
    "dashboard",
    "timeZone",
    options.period,
    options.endDate,
    options.viewAsAdminId,
  ];

  const getMerchantPerformanceKey = (options: RefreshOptions) => [
    "dashboard",
    "merchantPerformance",
    options.period,
    options.endDate,
    options.viewAsAdminId,
  ];

  const getRecentTransactionsKey = (options: RefreshOptions) => [
    "dashboard",
    "recentTransactions",
    options.viewAsAdminId,
  ];

  const getActivitiesKey = () => ["dashboard", "activities"];

  const getAnnouncementsKey = () => ["dashboard", "announcements"];

  // Individual queries for each data type
  const summaryStatsQuery = useQuery<AdminDashboardSummaryStatsDto>({
    queryKey: getSummaryStatsKey(currentOptions),
    queryFn: async () => {
      if (!dashboardApi) throw new Error("API client not initialized");
      // Use the typed API client method for getting summary stats
      const response = await dashboardApi.getSummaryStats(
        currentOptions.period!,
        currentOptions.endDate,
        currentOptions.viewAsAdminId,
      );
      return response.data;
    },
    enabled: !!dashboardApi, // Only run when API client is available
  });

  const transactionTrendsQuery = useQuery<AdminDashboardTransactionTrendsDto>({
    queryKey: getTrendsKey(currentOptions),
    queryFn: async () => {
      if (!dashboardApi) throw new Error("API client not initialized");
      // Use the typed API client method for getting transaction trends
      const response = await dashboardApi.getTransactionTrends(
        currentOptions.period!,
        currentOptions.endDate,
        currentOptions.viewAsAdminId,
      );
      return response.data;
    },
    enabled: !!dashboardApi,
  });

  const timeZoneStatsQuery = useQuery<AdminDashboardTimezoneStatsDto>({
    queryKey: getTimeZoneStatsKey(currentOptions),
    queryFn: async () => {
      if (!dashboardApi) throw new Error("API client not initialized");
      // Use the typed API client method for getting time zone stats
      const response = await dashboardApi.getTimeZoneStats(
        currentOptions.period!,
        currentOptions.endDate,
        currentOptions.viewAsAdminId,
      );
      return response.data;
    },
    enabled: !!dashboardApi,
  });

  const merchantPerformanceQuery =
    useQuery<AdminDashboardMerchantPerformanceDto>({
      queryKey: getMerchantPerformanceKey(currentOptions),
      queryFn: async () => {
        if (!dashboardApi) throw new Error("API client not initialized");
        // Use the typed API client method for getting merchant performance data
        const response = await dashboardApi.getMerchantPerformance(
          currentOptions.period!,
          currentOptions.endDate,
          currentOptions.viewAsAdminId,
        );
        return response.data;
      },
      enabled: !!dashboardApi,
    });

  const recentTransactionsQuery = useQuery<AdminDashboardRecentTransactionsDto>(
    {
      queryKey: getRecentTransactionsKey(currentOptions),
      queryFn: async () => {
        if (!dashboardApi) throw new Error("API client not initialized");
        // Use the typed API client method for getting recent transactions
        const response = await dashboardApi.getRecentTransactions(
          "10", // Need to pass as string according to API
          currentOptions.viewAsAdminId,
        );
        return response.data;
      },
      enabled: !!dashboardApi,
    },
  );

  const activitiesQuery = useQuery<AdminDashboardActivityDto[]>({
    queryKey: getActivitiesKey(),
    queryFn: async () => {
      if (!dashboardApi) throw new Error("API client not initialized");
      // Use the typed API client method for getting dashboard activity
      const response = await dashboardApi.getDashboardActivity(
        "10", // Need to pass as string according to API
      );
      return response.data;
    },
    enabled: !!dashboardApi,
  });

  const announcementsQuery = useQuery<AdminDashboardAnnouncementDto[]>({
    queryKey: getAnnouncementsKey(),
    queryFn: async () => {
      if (!dashboardApi) throw new Error("API client not initialized");
      // Use the typed API client method for getting announcements
      const response = await dashboardApi.getAnnouncements(
        "10", // Need to pass as string according to API
      );
      return response.data;
    },
    enabled: !!dashboardApi,
  });

  // Determine if any query is loading
  const loading =
    summaryStatsQuery.isLoading ||
    transactionTrendsQuery.isLoading ||
    timeZoneStatsQuery.isLoading ||
    merchantPerformanceQuery.isLoading ||
    recentTransactionsQuery.isLoading ||
    activitiesQuery.isLoading ||
    announcementsQuery.isLoading;

  // Determine if any query has an error
  const error =
    summaryStatsQuery.error ||
    transactionTrendsQuery.error ||
    timeZoneStatsQuery.error ||
    merchantPerformanceQuery.error ||
    recentTransactionsQuery.error ||
    activitiesQuery.error ||
    announcementsQuery.error;

  // Function to refresh all data
  const refreshData = useCallback(
    async (options?: RefreshOptions) => {
      try {
        if (!dashboardApi) {
          throw new Error("API client not initialized");
        }

        // Use provided options or current options
        const effectiveOptions = options || currentOptions;

        // Always keep silent to true regardless of what's provided
        const newOptions = {
          ...effectiveOptions,
          silent: true,
        };

        // Update current options if new ones provided
        if (options) {
          setCurrentOptions(newOptions);
        }

        // Invalidate all queries to trigger refetch
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getSummaryStatsKey(newOptions),
          }),
          queryClient.invalidateQueries({
            queryKey: getTrendsKey(newOptions),
          }),
          queryClient.invalidateQueries({
            queryKey: getTimeZoneStatsKey(newOptions),
          }),
          queryClient.invalidateQueries({
            queryKey: getMerchantPerformanceKey(newOptions),
          }),
          queryClient.invalidateQueries({
            queryKey: getRecentTransactionsKey(newOptions),
          }),
          queryClient.invalidateQueries({ queryKey: getActivitiesKey() }),
          queryClient.invalidateQueries({ queryKey: getAnnouncementsKey() }),
        ]);

        const currentTime = new Date();
        setLastRefreshed(currentTime);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        throw err;
      }
    },
    [currentOptions, queryClient, dashboardApi],
  );

  // Function to set period and refresh data
  const setPeriod = useCallback(
    (period: GetSummaryStatsPeriodEnum) => {
      setCurrentOptions((prev) => {
        const newOptions = { ...prev, period, silent: false };
        return newOptions;
      });
      refreshData({ ...currentOptions, period, silent: false });
    },
    [refreshData, currentOptions],
  );

  // Function to set end date and refresh data
  const setEndDate = useCallback(
    (endDate: string) => {
      setCurrentOptions((prev) => {
        const newOptions = { ...prev, endDate, silent: false };
        return newOptions;
      });
      refreshData({ ...currentOptions, endDate, silent: false });
    },
    [refreshData, currentOptions],
  );

  return {
    summaryStats: summaryStatsQuery.data ?? null,
    transactionTrends: transactionTrendsQuery.data ?? null,
    timeZoneStats: timeZoneStatsQuery.data ?? null,
    merchantPerformance: merchantPerformanceQuery.data ?? null,
    recentTransactions: recentTransactionsQuery.data?.transactions ?? null,
    activities: activitiesQuery.data ?? null,
    announcements: announcementsQuery.data ?? null,
    loading:
      !dashboardApi ||
      summaryStatsQuery.isLoading ||
      transactionTrendsQuery.isLoading ||
      timeZoneStatsQuery.isLoading ||
      merchantPerformanceQuery.isLoading ||
      recentTransactionsQuery.isLoading ||
      activitiesQuery.isLoading ||
      announcementsQuery.isLoading,
    error: error ? new Error(error.message) : null,
    refreshData,
    lastRefreshed,
    setPeriod,
    setEndDate,
    currentOptions,
  };
}
