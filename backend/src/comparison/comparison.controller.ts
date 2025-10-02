import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ValidationPipe,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ComparisonService } from "./comparison.service";
import { CreateComparisonDto } from "./dto/create-comparison.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

/**
 * REST API controller for comparison session management.
 *
 * This controller handles:
 * - Creating new comparison sessions
 * - Retrieving session history
 * - Getting session details and metrics
 * - Session status management
 */
@Controller("comparison")
@UseGuards(JwtAuthGuard)
export class ComparisonController {
  constructor(private readonly comparisonService: ComparisonService) {}

  /**
   * Creates a new comparison session with the specified prompt and models.
   * Returns session ID for WebSocket connection and real-time updates.
   */
  @Post()
  async createComparison(
    @Body(ValidationPipe) createComparisonDto: CreateComparisonDto,
    @Request() req
  ) {
    const user = await this.comparisonService.getUserFromRequest(req);
    return await this.comparisonService.createComparison(
      createComparisonDto,
      user.id
    );
  }

  /**
   * Retrieves a specific comparison session by ID.
   * Includes all model responses and performance metrics.
   */
  @Get(":sessionId")
  async getComparison(@Param("sessionId") sessionId: string, @Request() req) {
    const user = await this.comparisonService.getUserFromRequest(req);
    return await this.comparisonService.getComparison(sessionId, user.id);
  }

  /**
   * Retrieves comparison session history with pagination.
   * Useful for displaying past comparisons and analytics.
   */
  @Get()
  async getComparisonHistory(
    @Query("limit") limit: string = "20",
    @Query("offset") offset: string = "0",
    @Request() req
  ) {
    const user = await this.comparisonService.getUserFromRequest(req);
    const limitNum = parseInt(limit, 10) || 20;
    const offsetNum = parseInt(offset, 10) || 0;
    return await this.comparisonService.getComparisonHistory(
      user.id,
      limitNum,
      offsetNum
    );
  }

  /**
   * Gets available AI models for comparison.
   * Returns model metadata including pricing and capabilities.
   */
  @Get("models/available")
  async getAvailableModels() {
    return await this.comparisonService.getAvailableModels();
  }

  /**
   * Starts a comparison session with streaming.
   * This endpoint allows starting the comparison directly via REST API.
   */
  @Post(":sessionId/start")
  async startComparison(
    @Param("sessionId") sessionId: string,
    @Body() body: { modelIds: string[] },
    @Request() req
  ) {
    const { modelIds } = body;
    const user = await this.comparisonService.getUserFromRequest(req);

    // Start the comparison streaming
    await this.comparisonService.startComparisonStreaming(
      sessionId,
      user.id,
      modelIds,
      // Handle model chunk (no-op for REST API)
      (modelId, chunk) => {
        console.log(`Model ${modelId} chunk: ${chunk.substring(0, 50)}...`);
      },
      // Handle model completion
      (modelId, metrics) => {
        console.log(`Model ${modelId} completed with metrics:`, metrics);
      },
      // Handle model error
      (modelId, error) => {
        console.log(`Model ${modelId} error:`, error);
      }
    );

    return { message: "Comparison started successfully" };
  }
}
