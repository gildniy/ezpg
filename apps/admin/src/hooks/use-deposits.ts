import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AdminDepositsApi,
  AdminDepositsFilterDto,
  AdminDepositsItemDto,
  AdminDepositsResponseDto,
  GetDepositsStatusEnum,
} from "@ezpg/api-client";
import { useToast } from "@ezpg/ui";
import apiClient from "@ezpg/api-client/src/apiClient";

const depositsApi = new AdminDepositsApi(undefined, undefined, apiClient);

export function useDeposits(
  filters: AdminDepositsFilterDto,
  options?: { silent?: boolean },
) {
  const { toast } = useToast();
  const silent = options?.silent ?? true; // Silent by default

  return useQuery<AdminDepositsResponseDto>({
    queryKey: ["deposits", filters],
    queryFn: async () => {
      const {
        endDate,
        merchantId,
        groupId,
        adminId,
        status,
        searchField,
        searchValue,
        pageSize,
        page,
      } = filters;

      try {
        // Convert status to proper enum if it exists
        const statusEnum = status
          ? (status as unknown as GetDepositsStatusEnum)
          : undefined;

        const response = await depositsApi.getDeposits(
          endDate,
          merchantId,
          groupId,
          adminId,
          statusEnum,
          searchField,
          searchValue,
          pageSize,
          page,
        );

        // Show notification when data is fetched (unless silent)
        if (!silent) {
          toast({
            title: "입금 데이터 업데이트",
            description: `데이터가 ${new Date().toLocaleTimeString()}에 새로고침되었습니다`,
            variant: "default",
          });
        }

        return response.data;
      } catch (error) {
        // Show error notification
        toast({
          title: "업데이트 실패",
          description: "입금 데이터를 새로고침할 수 없습니다",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: true,
  });
}

export function useDepositDetails(id: number, options?: { silent?: boolean }) {
  const { toast } = useToast();
  const silent = options?.silent ?? true; // Silent by default

  return useQuery<AdminDepositsItemDto>({
    queryKey: ["deposit", id],
    queryFn: async () => {
      try {
        const response = await depositsApi.getDeposit(id.toString());

        // Show notification when data is fetched (unless silent)
        if (!silent) {
          toast({
            title: "입금 상세정보 업데이트",
            description: `데이터가 ${new Date().toLocaleTimeString()}에 새로고침되었습니다`,
            variant: "default",
          });
        }

        return response.data;
      } catch (error) {
        // Show error notification
        toast({
          title: "업데이트 실패",
          description: "입금 상세정보를 불러올 수 없습니다",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!id,
  });
}

export function useExportDeposits() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (filters: AdminDepositsFilterDto) => {
      try {
        const response = await depositsApi.exportDeposits(filters);

        // Validate download URL
        if (!response.data?.url) {
          throw new Error("No download URL in response");
        }

        // Use base URL to create full download URL
        const baseUrl = window.location.origin;
        const downloadUrl = `${baseUrl}${response.data.url}`;

        console.log("Attempting to download from:", downloadUrl);

        // Open the URL in a new window/tab - this will trigger the browser's download
        window.open(downloadUrl, "_blank");

        // Show success notification
        toast({
          title: "다운로드 시작",
          description: "입금 데이터 다운로드가 시작되었습니다",
          variant: "default",
        });

        return response.data;
      } catch (error) {
        console.error("Download error:", error);
        // Show error notification
        toast({
          title: "다운로드 실패",
          description:
            "입금 데이터를 다운로드할 수 없습니다. 다시 시도해주세요.",
          variant: "destructive",
        });
        throw error;
      }
    },
  });
}
