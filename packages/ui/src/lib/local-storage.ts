/**
 * Utility for safely interacting with localStorage
 * Handles SSR and potential localStorage access errors
 */

/**
 * Safely get an item from localStorage
 * @param key The key to get
 * @returns The value or null if not found/error
 */
export const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

/**
 * Safely set an item in localStorage
 * @param key The key to set
 * @param value The value to set
 * @returns True if successful, false otherwise
 */
export const setLocalStorageItem = (key: string, value: string): boolean => {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
    return false;
  }
};

/**
 * Safely remove an item from localStorage
 * @param key The key to remove
 * @returns True if successful, false otherwise
 */
export const removeLocalStorageItem = (key: string): boolean => {
  if (typeof window === "undefined") return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
};

/**
 * Check if localStorage is available
 * @returns True if localStorage is available, false otherwise
 */
export const isLocalStorageAvailable = (): boolean => {
  if (typeof window === "undefined") return false;

  try {
    const testKey = "__test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};
