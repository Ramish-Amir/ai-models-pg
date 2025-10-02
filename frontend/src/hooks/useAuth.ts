"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Custom hook for authentication management.
 *
 * This hook provides:
 * - User authentication state
 * - User profile information
 * - Authentication methods
 * - Route protection logic
 */
export function useAuth() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  /**
   * Redirects to login page if user is not authenticated.
   */
  const requireAuth = () => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  };

  /**
   * Redirects to home page if user is already authenticated.
   */
  const redirectIfAuthenticated = () => {
    if (!isLoading && user) {
      router.push("/");
    }
  };

  /**
   * Logs out the user and redirects to login page.
   */
  const logout = () => {
    window.location.href = "/api/auth/logout";
  };

  /**
   * Redirects to Auth0 login page.
   */
  const login = () => {
    window.location.href = "/api/auth/login";
  };

  return {
    user,
    error,
    isLoading,
    isAuthenticated: !!user,
    requireAuth,
    redirectIfAuthenticated,
    logout,
    login,
  };
}
