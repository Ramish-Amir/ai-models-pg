import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";

/**
 * JWT Authentication Guard for protecting routes.
 *
 * This guard ensures that only authenticated users can access protected endpoints.
 * It tries JWT authentication first, then falls back to simple Auth0 ID authentication.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard(["jwt", "simple-auth"]) {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determines if the route should be accessible without authentication.
   * Routes marked with @Public() decorator will bypass authentication.
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
