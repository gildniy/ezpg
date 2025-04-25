/**
 * Utility functions for creating API client instances
 */

import { Configuration } from "./generated/configuration";

export interface ApiClientConfig {
  /**
   * The base URL for the API
   */
  baseUrl?: string;

  /**
   * JWT token for authenticated requests
   */
  accessToken?: string;

  /**
   * Additional headers to include in requests
   */
  headers?: Record<string, string>;
}

/**
 * Creates a configuration instance for API clients
 */
export function createApiConfiguration(
  config: ApiClientConfig = {},
): Configuration {
  const {
    baseUrl = typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000",
    accessToken,
    headers = {},
  } = config;

  return new Configuration({
    basePath: baseUrl,
    accessToken,
    baseOptions: {
      headers: headers,
    },
  });
}

/**
 * Creates an instance of an API client with the given configuration
 */
export function createApiClient<T>(
  ApiClass: new (configuration: Configuration) => T,
  config: ApiClientConfig = {},
): T {
  const configuration = createApiConfiguration(config);
  return new ApiClass(configuration);
}
