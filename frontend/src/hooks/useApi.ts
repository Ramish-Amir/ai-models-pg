import { useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getSession } from "@auth0/nextjs-auth0";
import {
  Model,
  ComparisonSession,
  CreateComparisonRequest,
  SessionHistoryItem,
  UserProfile,
} from "@/types";
import { getUserFriendlyErrorMessage } from "@/utils/errorHandling";

/**
 * Custom hook for managing API calls to the backend.
 *
 * This hook provides:
 * - Centralized API configuration
 * - Error handling and loading states
 * - Type-safe API calls
 * - Request/response interceptors
 */
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Configure axios with base URL and interceptors - memoized to prevent recreation
  const api = useMemo(() => {
    const axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      timeout: 30000, // 30 second timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor for loading states and auth headers
    axiosInstance.interceptors.request.use(
      async (config) => {
        setLoading(true);
        setError(null);

        // Add auth token if user is authenticated
        // Get user ID from Auth0 session
        let userId = null;

        // Try to get user ID from the session API (most reliable)
        try {
          const response = await fetch("/api/auth/me");
          if (response.ok) {
            const data = await response.json();
            if (data.userId) {
              userId = data.userId;
            } else if (data.user?.sub) {
              userId = data.user.sub;
            }
          }
        } catch (error) {
          // Session API error - continue to fallback
        }

        // If session API doesn't work, try user context as fallback
        if (!userId) {
          const actualUser = user?.user || user;
          if (actualUser && (actualUser as any)?.sub) {
            userId = (actualUser as any).sub;
          }
        }

        // If we still don't have a user ID, don't make the request
        if (!userId) {
          return Promise.reject(
            new Error("No user ID available for authentication")
          );
        }

        config.headers["X-Auth0-ID"] = userId;

        return config;
      },
      (error) => {
        setLoading(false);
        setError(error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    axiosInstance.interceptors.response.use(
      (response) => {
        setLoading(false);
        return response;
      },
      (error) => {
        setLoading(false);
        const rawErrorMessage =
          error.response?.data?.message || error.message || "An error occurred";
        const userFriendlyMessage =
          getUserFriendlyErrorMessage(rawErrorMessage);
        setError(userFriendlyMessage);
        return Promise.reject(error);
      }
    );

    return axiosInstance;
  }, []); // Empty dependency array - create once and reuse

  /**
   * Creates a new comparison session with the specified prompt and models.
   * Returns session metadata for WebSocket connection.
   */
  const createComparison = useCallback(
    async (data: CreateComparisonRequest): Promise<ComparisonSession> => {
      try {
        const response = await api.post("/comparison", data);
        return response.data;
      } catch (error) {
        console.error("Failed to create comparison:", error);
        throw error;
      }
    },
    [api]
  );

  /**
   * Retrieves a specific comparison session by ID.
   * Includes all model responses and performance metrics.
   */
  const getComparison = useCallback(
    async (sessionId: string): Promise<ComparisonSession> => {
      try {
        const response = await api.get(`/comparison/${sessionId}`);
        return response.data;
      } catch (error) {
        console.error("Failed to get comparison:", error);
        throw error;
      }
    },
    [api]
  );

  /**
   * Retrieves comparison session history with pagination.
   * Returns session summaries for history display.
   */
  const getSessionHistory = useCallback(
    async (
      limit: number = 20,
      offset: number = 0
    ): Promise<SessionHistoryItem[]> => {
      try {
        const response = await api.get(
          `/comparison?limit=${limit}&offset=${offset}`
        );
        return response.data;
      } catch (error) {
        console.error("Failed to get session history:", error);
        throw error;
      }
    },
    [api]
  );

  /**
   * Gets all available AI models for comparison.
   * Returns model metadata including pricing and capabilities.
   */
  const getAvailableModels = useCallback(async (): Promise<Model[]> => {
    try {
      const response = await api.get("/comparison/models/available");
      return response.data;
    } catch (error) {
      console.error("Failed to get available models:", error);
      throw error;
    }
  }, [api]);

  /**
   * Gets application health status.
   * Used for connection monitoring and debugging.
   */
  const getHealth = useCallback(async () => {
    try {
      const response = await api.get("/");
      return response.data;
    } catch (error) {
      console.error("Failed to get health status:", error);
      throw error;
    }
  }, [api]);

  /**
   * Gets user profile information from the backend.
   * Returns user data including profile details and account information.
   */
  const getUserProfile = useCallback(async (): Promise<UserProfile> => {
    try {
      const response = await api.get("/profile");
      return response.data;
    } catch (error) {
      console.error("Failed to get user profile:", error);
      throw error;
    }
  }, [api]);

  return {
    loading,
    error,
    createComparison,
    getComparison,
    getSessionHistory,
    getAvailableModels,
    getHealth,
    getUserProfile,
  };
}
