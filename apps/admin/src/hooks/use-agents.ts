"use client";

import { useCallback, useState } from "react";
import { AdminAgentsApi } from "@ezpg/api-client";
import {
  FindAllStatusEnum,
  CreateAgentDto,
  UpdateAgentDto,
  AgentResponseDto,
} from "@ezpg/api-client/src/generated/api";
import apiClient from "@ezpg/api-client/src/apiClient";

interface AgentQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: FindAllStatusEnum;
  merchantId?: string;
}

// Create agents API instance using the apiClient
const agentsApi = new AdminAgentsApi(undefined, undefined, apiClient);

export interface UseAgentsResult {
  agents: AgentResponseDto[];
  isLoading: boolean;
  error: Error | null;
  totalAgents: number;
  totalPages: number;
  fetchAgents: (query: AgentQueryDto) => Promise<void>;
  fetchAgentById: (agentId: string) => Promise<AgentResponseDto | null>;
  createAgent: (
    agentData: Partial<AgentResponseDto>,
  ) => Promise<AgentResponseDto | null>;
  updateAgent: (
    agentId: string,
    agentData: Partial<AgentResponseDto>,
  ) => Promise<AgentResponseDto | null>;
  deleteAgent: (agentId: string) => Promise<boolean>;
  recoverAgent: (agentId: string) => Promise<boolean>;
  permanentDeleteAgent: (agentId: string) => Promise<boolean>;
  fetchDeleted: (query: AgentQueryDto) => Promise<void>;
}

export function useAgents(): UseAgentsResult {
  const [agents, setAgents] = useState<AgentResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalAgents, setTotalAgents] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Fetch active agents with filtering and pagination
  const fetchAgents = useCallback(
    async (query: AgentQueryDto): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        if (agentsApi) {
          const response = await agentsApi.findAll(
            query.page || 1,
            query.limit || 10,
            undefined, // skip
            query.search,
            query.status as FindAllStatusEnum,
            query.merchantId,
          );
          if (
            Array.isArray(response.data.data) &&
            response.data.data.length > 0 &&
            typeof response.data.data[0] === "object" &&
            !Array.isArray(response.data.data[0])
          ) {
            setAgents(response.data.data as unknown as AgentResponseDto[]);
          } else {
            setAgents([]);
          }
          setTotalAgents(response.data.meta.total);
          setTotalPages(
            response.data.meta.totalPages || response.data.totalPages,
          );
          setIsLoading(false);
        } else {
          throw new Error("API client not initialized");
        }
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    },
    [agentsApi],
  );

  // Find deleted agents
  const fetchDeleted = useCallback(
    async (query: AgentQueryDto): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        if (agentsApi) {
          const response = await agentsApi.findDeleted(
            query.page || 1,
            query.limit || 10,
            undefined, // skip
            query.search,
            query.status as FindAllStatusEnum,
            query.merchantId,
          );
          if (
            Array.isArray(response.data.data) &&
            response.data.data.length > 0 &&
            typeof response.data.data[0] === "object" &&
            !Array.isArray(response.data.data[0])
          ) {
            setAgents(response.data.data as unknown as AgentResponseDto[]);
          } else {
            setAgents([]);
          }
          setTotalAgents(response.data.meta.total);
          setTotalPages(
            response.data.meta.totalPages || response.data.totalPages,
          );
          setIsLoading(false);
        } else {
          throw new Error("API client not initialized");
        }
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    },
    [agentsApi],
  );

  // Create a new agent
  const createAgent = useCallback(
    async (
      agentData: Partial<AgentResponseDto>,
    ): Promise<AgentResponseDto | null> => {
      setIsLoading(true);
      setError(null);

      try {
        if (agentsApi) {
          // Map from Agent interface to CreateAgentDto
          const createAgentDto = {
            agentUsername: agentData.agentId || "",
            agentName: agentData.agentName || "",
            merchantId: agentData.merchantId || "",
            balance: agentData.balance
              ? parseFloat(agentData.balance.replace(/,/g, ""))
              : 0,
            bankName: agentData.withdrawalBankName || "",
            accountNumber: agentData.withdrawalAccountNumber,
            accountHolder: agentData.withdrawalAccountHolder,
            otpEnabled: agentData.otpEnabled || false,
            isActive: agentData.status === "active",
          };

          const response = await agentsApi.create(
            createAgentDto as CreateAgentDto,
          );

          setIsLoading(false);
          return response.data;
        } else {
          throw new Error("API client not initialized");
        }
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [agentsApi],
  );

  // Update an existing agent
  const updateAgent = useCallback(
    async (
      agentId: string,
      agentData: Partial<AgentResponseDto>,
    ): Promise<AgentResponseDto | null> => {
      setIsLoading(true);
      setError(null);

      try {
        if (agentsApi) {
          // Map from Agent interface to UpdateAgentDto
          const updateAgentDto = {
            agentName: agentData.agentName,
            bankName: agentData.withdrawalBankName,
            accountNumber: agentData.withdrawalAccountNumber,
            accountHolder: agentData.withdrawalAccountHolder,
            otpEnabled: agentData.otpEnabled,
          };

          // Type assertion to match what the API actually expects
          const response = await agentsApi.update(
            agentId,
            updateAgentDto as UpdateAgentDto,
          );
          setIsLoading(false);
          return response.data;
        } else {
          throw new Error("API client not initialized");
        }
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [agentsApi],
  );

  // Delete an agent (soft delete)
  const deleteAgent = useCallback(
    async (agentId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        if (agentsApi) {
          // Type assertion to match what the API actually expects
          await agentsApi.remove(agentId);
          setIsLoading(false);
          return true;
        } else {
          throw new Error("API client not initialized");
        }
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return false;
      }
    },
    [agentsApi],
  );

  // Recover a deleted agent
  const recoverAgent = useCallback(
    async (agentId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        if (agentsApi) {
          // Type assertion to match what the API actually expects
          await agentsApi.restore(agentId);
          setIsLoading(false);
          return true;
        } else {
          throw new Error("API client not initialized");
        }
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return false;
      }
    },
    [agentsApi],
  );

  // Permanent delete an agent (actually another soft delete level)
  const permanentDeleteAgent = useCallback(
    async (agentId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        if (agentsApi) {
          // Type assertion to match what the API actually expects
          await agentsApi.permanentDelete(agentId);
          setIsLoading(false);
          return true;
        } else {
          throw new Error("API client not initialized");
        }
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return false;
      }
    },
    [agentsApi],
  );

  // Fetch a single agent by ID
  const fetchAgentById = useCallback(
    async (agentId: string): Promise<AgentResponseDto | null> => {
      setIsLoading(true);
      setError(null);

      try {
        if (agentsApi) {
          // Type assertion to match what the API actually expects
          const response = await agentsApi.findOne(agentId);

          setIsLoading(false);
          return response.data;
        } else {
          throw new Error("API client not initialized");
        }
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        return null;
      }
    },
    [agentsApi],
  );

  return {
    agents,
    isLoading: !agentsApi || isLoading,
    error,
    totalAgents,
    totalPages,
    fetchAgents,
    fetchAgentById,
    createAgent,
    updateAgent,
    deleteAgent,
    recoverAgent,
    permanentDeleteAgent,
    fetchDeleted,
  };
}
