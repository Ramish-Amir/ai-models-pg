import {
  handleAuth,
  handleLogin,
  handleLogout,
  handleCallback,
} from "@auth0/nextjs-auth0";

/**
 * Auth0 API route handler for authentication flows.
 *
 * This handler provides:
 * - Login/logout functionality
 * - User profile management
 * - Session management
 * - Callback handling
 */
export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      prompt: "login",
    },
  }),
  logout: handleLogout({
    returnTo: process.env.AUTH0_BASE_URL,
  }),
  callback: handleCallback({
    afterCallback: async (req: any, res: any, session: any) => {
      // The user data is in the res object (Auth0 session)
      if (!res?.user) {
        return session;
      }

      // Create or update user in backend after successful authentication
      try {
        const userData = {
          auth0Id: res.user.sub,
          email: res.user.email,
          name: res.user.name,
          picture: res.user.picture,
          locale: res.user.locale || "en",
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          }
        );

        if (!response.ok) {
          console.error("Failed to create user:", await response.text());
        }
      } catch (error) {
        console.error("Error creating user:", error);
      }

      // Store user ID in session for frontend access
      if (res.user.sub) {
        // This will be available in the frontend
        session.userId = res.user.sub;
      }

      return session;
    },
  }),
});
