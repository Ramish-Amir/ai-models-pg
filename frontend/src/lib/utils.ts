import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility functions for the AI Model Playground application.
 *
 * This file contains helper functions for:
 * - CSS class name merging with Tailwind
 * - Data formatting and display
 * - Common utility operations
 * - Type-safe helper functions
 */

/**
 * Merges CSS class names with Tailwind CSS conflict resolution.
 * Uses clsx for conditional classes and tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency with appropriate precision.
 * Used for displaying AI model costs and pricing.
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(amount);
}

/**
 * Formats a number as a percentage with appropriate precision.
 * Used for displaying metrics and statistics.
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formats a duration in milliseconds to a human-readable string.
 * Used for displaying response times and performance metrics.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * Formats a large number with appropriate units (K, M, B).
 * Used for displaying token counts and other large numbers.
 */
export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  } else if (num < 1000000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else if (num < 1000000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
}

/**
 * Truncates text to a specified length with ellipsis.
 * Used for displaying truncated prompts and responses.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Generates a random ID for temporary use.
 * Used for generating unique identifiers before server assignment.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Debounces a function call to prevent excessive execution.
 * Used for search inputs and other user interactions.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Validates if a string is a valid URL.
 * Used for validating API endpoints and external links.
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Gets the appropriate status color for a model response status.
 * Used for consistent status indicator styling.
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "text-gray-500";
    case "streaming":
      return "text-blue-500";
    case "completed":
      return "text-green-500";
    case "error":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}

/**
 * Gets the appropriate status icon for a model response status.
 * Used for consistent status indicator icons.
 */
export function getStatusIcon(status: string): string {
  switch (status) {
    case "pending":
      return "⏳";
    case "streaming":
      return "⚡";
    case "completed":
      return "✅";
    case "error":
      return "❌";
    default:
      return "❓";
  }
}
