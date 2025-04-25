import { toCamelSync as toCamel } from "@ezpg/helpers";

/**
 * Standardizes API responses with proper case conversion and pagination structure
 *
 * @param data The data to include in the response
 * @param pagination Optional pagination information
 * @returns A standardized response object with camelCase properties
 */
export function standardizeResponse<
  T extends Record<string, unknown> | unknown,
>(
  data: T | T[],
  pagination?: {
    totals?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  },
) {
  const response: Record<string, unknown> = {
    data: Array.isArray(data)
      ? data.map((item) => toCamel(item as Record<string, unknown>))
      : toCamel(data as Record<string, unknown>),
    // Add items array for compatibility with OpenAPI
    items: Array.isArray(data)
      ? data.map((item) => toCamel(item as Record<string, unknown>))
      : toCamel(data as Record<string, unknown>),
  };

  if (pagination) {
    const { totals, page, limit, totalPages: tPages } = pagination;
    const calculatedTotalPages =
      tPages || (totals && limit ? Math.ceil(totals / limit) : undefined);

    response.meta = toCamel({
      totals,
      page,
      limit,
      totalPages: calculatedTotalPages,
    });

    // Add top-level fields for OpenAPI compatibility
    response.currentPage = page;
    response.totalPages = calculatedTotalPages;
  }

  return response;
}
