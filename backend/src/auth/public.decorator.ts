import { SetMetadata } from "@nestjs/common";

/**
 * Decorator to mark routes as public (no authentication required).
 *
 * Use this decorator on controllers or methods that should be accessible
 * without authentication, such as health checks or public API endpoints.
 */
export const Public = () => SetMetadata("isPublic", true);
