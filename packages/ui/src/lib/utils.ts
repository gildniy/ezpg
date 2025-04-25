import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a timestamp to a human-readable "time ago" format
 * @param timestamp - Date string or Date object to convert
 * @param options - Optional configuration
 * @returns A string representing how long ago the time was (e.g., "2 minutes ago")
 */
export function timeAgo(
  timestamp: string | Date,
  options: { short?: boolean } = {},
) {
  const { short = false } = options;
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 10) {
    return short ? "just now" : "just now";
  } else if (seconds < 60) {
    return short ? `${seconds}s` : `${seconds} seconds ago`;
  } else if (minutes === 1) {
    return short ? "1m" : "1 minute ago";
  } else if (minutes < 60) {
    return short ? `${minutes}m` : `${minutes} minutes ago`;
  } else if (hours === 1) {
    return short ? "1h" : "1 hour ago";
  } else if (hours < 24) {
    return short ? `${hours}h` : `${hours} hours ago`;
  } else if (days === 1) {
    return short ? "1d" : "1 day ago";
  } else if (days < 30) {
    return short ? `${days}d` : `${days} days ago`;
  } else if (months === 1) {
    return short ? "1mo" : "1 month ago";
  } else if (months < 12) {
    return short ? `${months}mo` : `${months} months ago`;
  } else if (years === 1) {
    return short ? "1y" : "1 year ago";
  } else {
    return short ? `${years}y` : `${years} years ago`;
  }
}
