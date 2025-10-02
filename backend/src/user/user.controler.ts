import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { ComparisonService } from "src/comparison/comparison.service";

@Controller("profile")
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly comparisonService: ComparisonService) {}

  @Get()
  async getUserProfile(@Request() req) {
    return await this.comparisonService.getUserFromRequest(req);
  }
}
