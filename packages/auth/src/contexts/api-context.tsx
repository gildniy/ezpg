"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { createApiClient } from "@ezpg/api-client";

// Define a type for the API client return
type ApiClientType = ReturnType<typeof createApiClient>;

// Create a properly typed context
interface ApiContextType {
  apiClient: ApiClientType | null;
  updateToken: (newToken: string | null) => void;
}

const ApiContext = createContext<ApiContextType | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const [apiClient, setApiClient] = useState<ApiClientType | null>(null);

  useEffect(() => {
    // Get token from storage on initial load
    const token = localStorage.getItem("token");

    // Create API client
    const client = createApiClient(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
      token || undefined,
    );

    setApiClient(client);
  }, []);

  // Function to update token
  const updateToken = (newToken: string | null) => {
    const client = createApiClient(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
      newToken || undefined,
    );

    setApiClient(client);

    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  };

  return (
    <ApiContext.Provider value={{ apiClient, updateToken }}>
      {children}
    </ApiContext.Provider>
  );
}

// Custom hook to use the API context
export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};
