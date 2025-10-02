"use client";

import { UserProvider as Auth0UserProvider } from "@auth0/nextjs-auth0/client";

/**
 * UserProvider component that wraps the app with Auth0 user context.
 *
 * This component provides:
 * - User authentication state
 * - User profile information
 * - Authentication methods
 * - Session management
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  return <Auth0UserProvider>{children}</Auth0UserProvider>;
}
