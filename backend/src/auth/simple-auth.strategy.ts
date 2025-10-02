import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { AuthService } from "./auth.service";

/**
 * Simple authentication strategy that validates Auth0 IDs from headers.
 *
 * This strategy is used as a fallback when JWT tokens are not available,
 * allowing the frontend to authenticate using the user's Auth0 ID directly.
 */
@Injectable()
export class SimpleAuthStrategy extends PassportStrategy(
  Strategy,
  "simple-auth"
) {
  constructor(private authService: AuthService) {
    super();
  }

  /**
   * Validates the request using the X-Auth0-ID header.
   * This method is called when the JWT strategy fails or is not available.
   */
  async validate(req: any) {
    const auth0Id = req.headers["x-auth0-id"];

    if (!auth0Id) {
      return null;
    }

    // Find or create user by Auth0 ID
    let user = await this.authService.findUserByAuth0Id(auth0Id);

    if (!user) {
      // If user doesn't exist, we can't authenticate them
      // This should trigger a redirect to login
      return null;
    }

    return {
      auth0Id: user.auth0Id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      locale: user.locale,
      id: user.id,
    };
  }
}
