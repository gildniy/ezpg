import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosInstance,
} from "axios";

// --- Configuration ---

// It's generally better to configure the base URL via environment variables
// in each app (admin, merchant) rather than relying solely on window.location here.
// This allows for different backend URLs during development or testing.

// Function to get base URL - PRIORITIZE Environment Variables
const getApiBaseUrl = (): string => {
  // 1. Check for specific environment variables set in the Next.js app
  //    (e.g., NEXT_PUBLIC_API_URL defined in .env.local or .env of the app)
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envApiUrl) {
    // console.log(`Using API Base URL from env var: ${envApiUrl}`);
    return envApiUrl;
  }

  // 2. Fallback: Infer from window.location (less reliable, primarily for local dev)
  //    Only run this logic in the browser context
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol; // http: or https:

    // Local development on standard ports
    if (
      (hostname === "localhost" || hostname === "127.0.0.1") &&
      process.env.NODE_ENV === "development"
    ) {
      // Assume backend runs on 8080 for local dev
      console.warn(
        `Inferring API Base URL for local dev: http://localhost:8080`,
      );
      return "http://localhost:8080";
    }

    // Attempt to infer production URL based on subdomain (adjust logic as needed)
    if (hostname.includes("admin.") || hostname.includes("merchant.")) {
      const baseDomain = hostname.split(".").slice(1).join("."); // e.g., example.com
      const inferredUrl = `${protocol}//api.${baseDomain}`; // e.g., https://api.example.com
      console.warn(`Inferring API Base URL from hostname: ${inferredUrl}`);
      return inferredUrl;
    }
  }

  // 3. Absolute Fallback (should not be reached if env vars are set)
  console.error(
    "API Base URL could not be determined. Falling back to default. Please set NEXT_PUBLIC_API_URL environment variable.",
  );
  return "http://localhost:8080";
};

const API_BASE_URL = getApiBaseUrl();

// --- Helper Functions ---

// --- Axios Instance ---
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // IMPORTANT: Send cookies with requests
  // timeout: 10000,
});

// --- Request Interceptor (Add CSRF Header) ---

// Store the fetched token to avoid refetching for rapid subsequent requests within a short time
let csrfTokenCache: { token: string | null; timestamp: number } = {
  token: null,
  timestamp: 0,
};
const CSRF_TOKEN_CACHE_DURATION = 1000 * 60 * 5; // Cache token for 5 minutes

// Exported function to clear the cache
export const clearCsrfTokenCache = () => {
  console.log("Clearing CSRF token cache.");
  csrfTokenCache = { token: null, timestamp: 0 };
};

interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
}

let failedQueue: QueueItem[] = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toUpperCase();
    const stateChangingMethods = ["POST", "PUT", "DELETE", "PATCH"];

    if (method && stateChangingMethods.includes(method)) {
      let tokenToSend: string | null = null;
      const now = Date.now();

      if (
        csrfTokenCache.token &&
        now - csrfTokenCache.timestamp < CSRF_TOKEN_CACHE_DURATION
      ) {
        console.log("Using cached CSRF token.");
        tokenToSend = csrfTokenCache.token;
      } else {
        console.log("Fetching new CSRF token...");
        try {
          const response = await apiClient.get("/auth/csrf-token");
          if (response.data && response.data.csrfToken) {
            tokenToSend = response.data.csrfToken;
            csrfTokenCache = { token: tokenToSend, timestamp: now };
            console.log("New CSRF token fetched and cached.");
          } else {
            console.warn("CSRF token endpoint did not return a token.");
          }
        } catch (error: unknown) {
          console.error("Failed to fetch CSRF token:", error);
          return Promise.reject(
            new Error("Failed to obtain CSRF token before request."),
          );
        }
      }

      if (tokenToSend) {
        config.headers["X-CSRF-Token"] = tokenToSend;
        console.log("CSRF token added to header for", method, config.url);
      } else {
        console.warn(
          `Proceeding with ${method} request to ${config.url} without CSRF token.`,
        );
      }
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

// --- Response Interceptor (Refresh Logic Adjusted) ---
let isRefreshing = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    if (!originalRequest) {
      console.error(
        "[API Response Error] Original request config not found",
        error,
      );
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise<unknown>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        console.log("Interceptor: Attempting token refresh via cookie...");

        // --- Add CSRF Token Logic for Refresh ---
        let csrfTokenForRefresh: string | null = null;
        const now = Date.now();
        // Check cache first (use the same cache as the request interceptor)
        if (
          csrfTokenCache.token &&
          now - csrfTokenCache.timestamp < CSRF_TOKEN_CACHE_DURATION
        ) {
          csrfTokenForRefresh = csrfTokenCache.token;
        } else {
          // Fetch new CSRF token if cache is invalid/missing
          try {
            const csrfResponse = await apiClient.get("/auth/csrf-token"); // Use apiClient to ensure cookies are sent
            if (csrfResponse.data && csrfResponse.data.csrfToken) {
              csrfTokenForRefresh = csrfResponse.data.csrfToken;
              csrfTokenCache = { token: csrfTokenForRefresh, timestamp: now }; // Update cache
              console.log("Fetched new CSRF token for refresh call.");
            } else {
              console.warn(
                "Refresh Interceptor: CSRF token endpoint did not return a token.",
              );
            }
          } catch (csrfError) {
            console.error(
              "Refresh Interceptor: Failed to fetch CSRF token:",
              csrfError,
            );
            // Can't proceed with refresh safely without CSRF
            throw new Error("Failed to obtain CSRF token for refresh request.");
          }
        }

        if (!csrfTokenForRefresh) {
          throw new Error("Missing CSRF token for refresh request.");
        }
        // ------------------------------------------

        // This call relies on the browser sending the refresh token cookie.
        // Use a separate axios instance or configure this one carefully if needed.
        // Ensure this specific call also sends credentials.
        await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`, // Ensure full path with version
          {},
          {
            withCredentials: true, // Ensure cookies are sent for this specific call too
            headers: {
              "X-CSRF-Token": csrfTokenForRefresh, // <-- Add CSRF header
            },
          },
        );

        console.log(
          "Interceptor: Token refresh successful (new cookie set by backend).",
        );

        processQueue(null);
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        console.error(
          "Interceptor: Token refresh failed:",
          refreshError instanceof Error
            ? refreshError.message
            : "Unknown error",
        );
        const errorToProcess =
          refreshError instanceof Error
            ? new AxiosError(
                refreshError.message,
                "REFRESH_FAILED",
                undefined,
                undefined,
                undefined,
              )
            : new AxiosError(
                "Unknown error",
                "REFRESH_FAILED",
                undefined,
                undefined,
                undefined,
              );
        processQueue(errorToProcess);
        isRefreshing = false;
        if (typeof window !== "undefined") {
          console.error("Refresh failed, authentication required.");
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      interface ErrorResponse {
        code?: string;
        message?: string;
      }

      const responseData = error.response?.data as ErrorResponse;
      if (responseData?.code === "PASSWORD_CHANGE_REQUIRED") {
        console.log("Interceptor: Password change required, redirecting...");
        if (typeof window !== "undefined")
          window.location.href = "/change-password";
        return new Promise(() => {});
      }
      console.error("Interceptor: Forbidden access (403).");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
