import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Public } from "./public.decorator";

/**
 * Authentication controller for user management endpoints.
 *
 * This controller provides:
 * - User profile endpoints
 * - User session management
 * - Authentication status checking
 */
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Public endpoint to create or update user from Auth0.
   * This endpoint is called by the frontend after successful Auth0 authentication.
   */
  @Public()
  @Post("user")
  async createOrUpdateUser(
    @Body()
    userData: {
      auth0Id: string;
      email: string;
      name?: string;
      picture?: string;
      locale?: string;
    }
  ) {
    return await this.authService.createOrUpdateUser(userData);
  }

  /**
   * Get current user profile.
   * Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Request() req) {
    const user = await this.authService.findUserByAuth0Id(req.user.auth0Id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  /**
   * Update user profile.
   * Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Post("profile")
  async updateProfile(
    @Request() req,
    @Body()
    profileData: {
      name?: string;
      picture?: string;
      locale?: string;
    }
  ) {
    const user = await this.authService.findUserByAuth0Id(req.user.auth0Id);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user profile
    user.name = profileData.name || user.name;
    user.picture = profileData.picture || user.picture;
    user.locale = profileData.locale || user.locale;

    return await this.authService.createOrUpdateUser({
      auth0Id: user.auth0Id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      locale: user.locale,
    });
  }

  /**
   * Check authentication status.
   * Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Get("status")
  async getAuthStatus(@Request() req) {
    return {
      authenticated: true,
      user: req.user,
    };
  }
}
