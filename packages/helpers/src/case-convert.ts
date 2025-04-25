/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
/**
 * Utility functions for converting object keys between camelCase and snake_case
 *
 * These functions help maintain consistent casing conventions between
 * the API (camelCase) and the database (snake_case)
 */

// Use async functions with dynamic imports to handle ESM modules
export async function toCamel<T = Record<string, unknown>>(
  obj: Record<string, unknown> | Array<Record<string, unknown>>,
): Promise<T> {
  const camelcaseKeys = (await import("camelcase-keys")).default;
  return camelcaseKeys(obj, { deep: true }) as T;
}

export async function toSnake<T = Record<string, unknown>>(
  obj: Record<string, unknown> | Array<Record<string, unknown>>,
): Promise<T> {
  const snakecaseKeys = (await import("snakecase-keys")).default;
  return snakecaseKeys(obj, { deep: true }) as T;
}

// Synchronous versions using require - these will work only if we downgrade the packages
// They are kept for backward compatibility during the transition
export function toCamelSync<T = Record<string, unknown>>(
  obj: Record<string, unknown> | Array<Record<string, unknown>>,
): T {
  try {
    // @ts-ignore - Using any to bypass type checking for dynamic require
    const camelcaseKeys = require("camelcase-keys");
    return camelcaseKeys(obj, { deep: true }) as T;
  } catch (error) {
    // Fallback to basic conversion if package can't be loaded
    return convertKeysToCamel(obj) as T;
  }
}

export function toSnakeSync<T = Record<string, unknown>>(
  obj: Record<string, unknown> | Array<Record<string, unknown>>,
): T {
  try {
    // @ts-ignore - Using any to bypass type checking for dynamic require
    const snakecaseKeys = require("snakecase-keys");
    return snakecaseKeys(obj, { deep: true }) as T;
  } catch (error) {
    // Fallback to basic conversion if package can't be loaded
    return convertKeysToSnake(obj) as T;
  }
}

// Basic implementation for fallback
function convertKeysToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamel(item));
  } else if (obj !== null && typeof obj === "object") {
    const result: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) =>
        char.toUpperCase(),
      );
      result[camelKey] = convertKeysToCamel(obj[key]);
    });
    return result;
  }
  return obj;
}

function convertKeysToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToSnake(item));
  } else if (obj !== null && typeof obj === "object") {
    const result: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      result[snakeKey] = convertKeysToSnake(obj[key]);
    });
    return result;
  }
  return obj;
}
