import { Injectable, Logger } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { AiProviderService } from "../ai-provider/ai-provider.service";
import { AuthService } from "../auth/auth.service";
import { CreateComparisonDto } from "./dto/create-comparison.dto";

/**
 * Comparison service managing AI model comparison sessions.
 *
 * This service handles:
 * - Session creation and initialization
 * - Model response coordination
 * - Performance metrics calculation
 * - Session state management
 * - Error handling and recovery
 */
@Injectable()
export class ComparisonService {
  private readonly logger = new Logger(ComparisonService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly aiProviderService: AiProviderService,
    private readonly authService: AuthService
  ) {}

  /**
   * Creates a new comparison session and initiates model responses.
   * Returns session metadata for frontend integration.
   */
  async createComparison(
    createComparisonDto: CreateComparisonDto,
    userId: string
  ) {
    const { prompt, modelIds } = createComparisonDto;

    // Create session in database with user context
    const session = await this.databaseService.createSession(prompt, userId);

    // Use default models if none specified
    const selectedModels = modelIds || [
      "gpt-3.5-turbo",
      "gpt-4",
      "claude-sonnet-4-20250514",
      "gemini-1.5-pro",
    ];

    this.logger.log(
      `Created comparison session ${session.id} with models: ${selectedModels.join(", ")}`
    );

    return {
      sessionId: session.id,
      prompt: session.prompt,
      models: selectedModels,
      status: session.status,
      createdAt: session.createdAt,
    };
  }

  /**
   * Retrieves a specific comparison session with all responses.
   * Includes performance metrics and model response details.
   */
  async getComparison(sessionId: string, userId: string) {
    const session = await this.databaseService.getSession(sessionId, userId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return {
      id: session.id,
      prompt: session.prompt,
      status: session.status,
      totalTokens: session.totalTokens,
      totalCost: session.totalCost,
      averageResponseTime: session.averageResponseTime,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      responses: session.responses.map((response) => ({
        id: response.id,
        modelId: response.modelId,
        provider: response.provider,
        response: response.response,
        status: response.status,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        cost: response.cost,
        responseTimeMs: response.responseTimeMs,
        errorMessage: response.errorMessage,
        createdAt: response.createdAt,
      })),
    };
  }

  /**
   * Retrieves comparison session history with pagination.
   * Returns session summaries for history display.
   */
  async getComparisonHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    const sessions = await this.databaseService.getSessions(
      userId,
      limit,
      offset
    );

    return sessions.map((session) => ({
      id: session.id,
      prompt:
        session.prompt.substring(0, 100) +
        (session.prompt.length > 100 ? "..." : ""),
      status: session.status,
      totalTokens: session.totalTokens,
      totalCost: session.totalCost,
      averageResponseTime: session.averageResponseTime,
      responseCount: session.responses.length,
      createdAt: session.createdAt,
    }));
  }

  /**
   * Gets all available AI models for comparison.
   * Returns model metadata including pricing and capabilities.
   */
  async getAvailableModels() {
    const models = this.aiProviderService.getAvailableModels();

    return models.map((model) => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      pricing: this.aiProviderService.getModelPricing(model.id),
    }));
  }

  /**
   * Starts streaming responses for a comparison session.
   * Coordinates multiple AI providers and manages session state.
   */
  async startComparisonStreaming(
    sessionId: string,
    userId: string,
    modelIds: string[],
    onModelChunk: (modelId: string, chunk: string) => void,
    onModelComplete: (modelId: string, metrics: any) => void,
    onModelError: (modelId: string, error: string) => void
  ) {
    try {
      // Update session status to in_progress
      await this.databaseService.updateSessionStatus(sessionId, "in_progress");

      // Create model response records
      const responsePromises = modelIds.map(async (modelId) => {
        const model = this.aiProviderService
          .getAvailableModels()
          .find((m) => m.id === modelId);
        return await this.databaseService.createModelResponse(
          sessionId,
          modelId,
          model.provider
        );
      });

      const responses = await Promise.all(responsePromises);
      const responseMap = new Map(responses.map((r) => [r.modelId, r]));

      // Start streaming from all models
      await this.aiProviderService.streamMultipleResponses(
        modelIds,
        (await this.databaseService.getSession(sessionId, userId)).prompt,
        (modelId, chunk) => {
          // Update response with streaming content
          const response = responseMap.get(modelId);
          if (response) {
            const updatedResponse = (response.response || "") + chunk;
            this.databaseService.updateModelResponse(response.id, {
              response: updatedResponse,
              status: "streaming",
            });
            // Update the response object in the map to reflect the new content
            response.response = updatedResponse;
          }
          onModelChunk(modelId, chunk);
        },
        async (modelId, metrics) => {
          // Finalize response with metrics
          console.log(`Received metrics for ${modelId}:`, metrics);
          const response = responseMap.get(modelId);
          if (response) {
            console.log(
              `Finalizing response ${response.id} with metrics:`,
              metrics
            );
            await this.databaseService.finalizeModelResponse(response.id, {
              inputTokens: metrics.inputTokens,
              outputTokens: metrics.outputTokens,
              cost: metrics.cost,
              responseTimeMs: metrics.responseTimeMs,
            });
          }
          onModelComplete(modelId, metrics);
        },
        async (modelId, error) => {
          // Mark response as failed
          const response = responseMap.get(modelId);
          if (response) {
            await this.databaseService.markResponseAsError(response.id, error);
          }
          onModelError(modelId, error);
        }
      );

      // Update session metrics and status
      await this.databaseService.updateSessionMetrics(sessionId);
      await this.databaseService.updateSessionStatus(sessionId, "completed");
    } catch (error) {
      this.logger.error(
        `Error in comparison streaming for session ${sessionId}:`,
        error
      );
      await this.databaseService.updateSessionStatus(sessionId, "failed");
      throw error;
    }
  }

  /**
   * Gets user from request object.
   * This method extracts user information from the authenticated request.
   */
  async getUserFromRequest(req: any) {
    const user = await this.authService.findUserByAuth0Id(req.user.auth0Id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}
