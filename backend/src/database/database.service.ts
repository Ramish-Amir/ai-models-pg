import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ComparisonSession } from "./entities/comparison-session.entity";
import { ModelResponse } from "./entities/model-response.entity";

/**
 * Database service providing CRUD operations for comparison sessions and model responses.
 *
 * This service handles:
 * - Session creation and management
 * - Model response storage and retrieval
 * - Performance metrics calculation
 * - Data validation and error handling
 */
@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(ComparisonSession)
    private readonly sessionRepository: Repository<ComparisonSession>,
    @InjectRepository(ModelResponse)
    private readonly responseRepository: Repository<ModelResponse>
  ) {}

  /**
   * Creates a new comparison session with the given prompt and user.
   * Initializes the session in 'pending' status.
   */
  async createSession(
    prompt: string,
    userId: string
  ): Promise<ComparisonSession> {
    const session = this.sessionRepository.create({
      prompt,
      userId,
      status: "pending",
    });
    return await this.sessionRepository.save(session);
  }

  /**
   * Updates the status of a comparison session.
   * Used to track session progress (pending → in_progress → completed).
   */
  async updateSessionStatus(
    sessionId: string,
    status: ComparisonSession["status"]
  ): Promise<void> {
    await this.sessionRepository.update(sessionId, { status });
  }

  /**
   * Retrieves a comparison session by ID with all associated responses.
   * Includes performance metrics and response details.
   */
  async getSession(
    sessionId: string,
    userId: string
  ): Promise<ComparisonSession> {
    return await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
      relations: ["responses"],
    });
  }

  /**
   * Retrieves all comparison sessions with pagination support.
   * Useful for displaying session history.
   */
  async getSessions(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ComparisonSession[]> {
    return await this.sessionRepository.find({
      where: { userId },
      relations: ["responses"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Creates a new model response record.
   * Initializes the response in 'pending' status.
   */
  async createModelResponse(
    sessionId: string,
    modelId: string,
    provider: string
  ): Promise<ModelResponse> {
    const response = this.responseRepository.create({
      sessionId,
      modelId,
      provider,
      response: "", // Initialize with empty string
      status: "pending",
    });
    return await this.responseRepository.save(response);
  }

  /**
   * Updates a model response with streaming content.
   * Used during real-time streaming to update the response text.
   */
  async updateModelResponse(
    responseId: string,
    updates: Partial<ModelResponse>
  ): Promise<void> {
    await this.responseRepository.update(responseId, updates);
  }

  /**
   * Updates the final metrics for a model response.
   * Calculates and stores token usage, cost, and response time.
   */
  async finalizeModelResponse(
    responseId: string,
    metrics: {
      inputTokens: number;
      outputTokens: number;
      cost: number;
      responseTimeMs: number;
    }
  ): Promise<void> {
    console.log(
      `Finalizing model response ${responseId} with metrics:`,
      metrics
    );
    await this.responseRepository.update(responseId, {
      ...metrics,
      status: "completed",
    });
    console.log(
      `Successfully updated model response ${responseId} in database`
    );
  }

  /**
   * Marks a model response as failed with error details.
   * Used when AI provider requests fail or timeout.
   */
  async markResponseAsError(
    responseId: string,
    errorMessage: string
  ): Promise<void> {
    await this.responseRepository.update(responseId, {
      status: "error",
      errorMessage,
    });
  }

  /**
   * Calculates and updates session-level metrics.
   * Aggregates data from all model responses in the session.
   */
  async updateSessionMetrics(sessionId: string): Promise<void> {
    const responses = await this.responseRepository.find({
      where: { sessionId, status: "completed" },
    });

    console.log(
      `Updating session metrics for ${sessionId}. Found ${responses.length} completed responses:`,
      responses.map((r) => ({
        modelId: r.modelId,
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        cost: r.cost,
        responseTimeMs: r.responseTimeMs,
      }))
    );

    const totalTokens = responses.reduce(
      (sum, r) => sum + (r.inputTokens || 0) + (r.outputTokens || 0),
      0
    );
    const totalCost = responses.reduce((sum, r) => sum + (r.cost || 0), 0);
    const averageResponseTime =
      responses.length > 0
        ? responses.reduce((sum, r) => sum + (r.responseTimeMs || 0), 0) /
          responses.length
        : 0;

    console.log(
      `Session metrics calculated: totalTokens=${totalTokens}, totalCost=${totalCost}, averageResponseTime=${averageResponseTime}`
    );

    await this.sessionRepository.update(sessionId, {
      totalTokens,
      totalCost,
      averageResponseTime,
    });

    console.log(
      `Successfully updated session ${sessionId} metrics in database`
    );
  }
}
