import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

/**
 * Root application controller providing basic health check and API information.
 *
 * This controller handles:
 * - Health check endpoint for monitoring
 * - API version and status information
 * - Basic application metadata
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint to verify the application is running.
   * Returns basic application status and version information.
   */
  @Get()
  getHealth() {
    return this.appService.getHealth();
  }

  /**
   * API information endpoint providing version and feature details.
   * Useful for frontend integration and debugging.
   */
  @Get("api/info")
  getApiInfo() {
    return this.appService.getApiInfo();
  }
}
