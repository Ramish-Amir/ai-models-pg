/**
 * Error handling utilities for the AI Model Playground application.
 *
 * This module provides:
 * - Error message formatting and categorization
 * - User-friendly error messages
 * - Error type detection and handling
 * - Consistent error display across the application
 */

export interface ErrorInfo {
  title: string;
  message: string;
  type:
    | "quota"
    | "rate_limit"
    | "authentication"
    | "network"
    | "model"
    | "unknown";
  icon: string;
  suggestions: string[];
  canRetry: boolean;
}

/**
 * Categorizes and formats error messages for better user experience.
 */
export function formatError(errorMessage: string): ErrorInfo {
  const message = errorMessage.toLowerCase();

  // Quota exceeded errors
  if (
    message.includes("quota") ||
    message.includes("billing") ||
    message.includes("exceeded")
  ) {
    return {
      title: "API Quota Exceeded",
      message:
        "You have reached your API usage limit. Please check your billing details or upgrade your plan.",
      type: "quota",
      icon: "💳",
      suggestions: [
        "Check your API billing and usage limits",
        "Consider upgrading your plan if needed",
        "Wait for your quota to reset (usually monthly)",
        "Contact support if you believe this is an error",
      ],
      canRetry: false,
    };
  }

  // Rate limit errors
  if (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("429")
  ) {
    return {
      title: "Rate Limit Exceeded",
      message:
        "Too many requests have been made. Please wait a moment before trying again.",
      type: "rate_limit",
      icon: "⏱️",
      suggestions: [
        "Wait a few minutes before retrying",
        "Reduce the frequency of your requests",
        "Consider using fewer models simultaneously",
      ],
      canRetry: true,
    };
  }

  // Authentication errors
  if (
    message.includes("unauthorized") ||
    message.includes("401") ||
    message.includes("api key") ||
    message.includes("authentication")
  ) {
    return {
      title: "Authentication Error",
      message:
        "There was an issue with your API credentials. Please check your API key configuration.",
      type: "authentication",
      icon: "🔑",
      suggestions: [
        "Verify your API key is correct and active",
        "Check if your API key has the required permissions",
        "Ensure your API key hasn't expired",
        "Contact your administrator if using a shared key",
      ],
      canRetry: false,
    };
  }

  // Network errors
  if (
    message.includes("network") ||
    message.includes("connection") ||
    message.includes("timeout") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504")
  ) {
    return {
      title: "Connection Error",
      message:
        "Unable to connect to the AI service. Please check your internet connection and try again.",
      type: "network",
      icon: "🌐",
      suggestions: [
        "Check your internet connection",
        "Try again in a few moments",
        "Verify the service is operational",
        "Contact support if the issue persists",
      ],
      canRetry: true,
    };
  }

  // Model-specific errors
  if (
    message.includes("model") ||
    message.includes("not found") ||
    message.includes("invalid model")
  ) {
    return {
      title: "Model Error",
      message:
        "The requested AI model is not available or has encountered an issue.",
      type: "model",
      icon: "🤖",
      suggestions: [
        "Try using a different model",
        "Check if the model is currently available",
        "Wait a moment and try again",
        "Contact support if the issue persists",
      ],
      canRetry: true,
    };
  }

  // Default error handling
  return {
    title: "Something went wrong",
    message:
      "An unexpected error occurred. Please try again or contact support if the issue persists.",
    type: "unknown",
    icon: "⚠️",
    suggestions: [
      "Try again in a few moments",
      "Check if all services are operational",
      "Contact support if the issue persists",
      "Try using different models or prompts",
    ],
    canRetry: true,
  };
}

/**
 * Gets a user-friendly error message for display.
 */
export function getUserFriendlyErrorMessage(errorMessage: string): string {
  const errorInfo = formatError(errorMessage);
  return errorInfo.message;
}

/**
 * Determines if an error can be retried.
 */
export function canRetryError(errorMessage: string): boolean {
  const errorInfo = formatError(errorMessage);
  return errorInfo.canRetry;
}

/**
 * Gets error type for styling purposes.
 */
export function getErrorType(errorMessage: string): ErrorInfo["type"] {
  const errorInfo = formatError(errorMessage);
  return errorInfo.type;
}

/**
 * Gets error icon for display.
 */
export function getErrorIcon(errorMessage: string): string {
  const errorInfo = formatError(errorMessage);
  return errorInfo.icon;
}

/**
 * Gets error title for display.
 */
export function getErrorTitle(errorMessage: string): string {
  const errorInfo = formatError(errorMessage);
  return errorInfo.title;
}

/**
 * Gets error suggestions for user guidance.
 */
export function getErrorSuggestions(errorMessage: string): string[] {
  const errorInfo = formatError(errorMessage);
  return errorInfo.suggestions;
}
