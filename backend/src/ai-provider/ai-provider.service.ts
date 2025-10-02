import { Injectable, Logger } from "@nestjs/common";
import { LangChainService } from "./langchain.service";

/**
 * Unified AI provider service that manages multiple AI model providers.
 *
 * This service provides:
 * - Unified interface for different AI providers
 * - LangChain-based provider abstraction
 * - Provider selection and routing
 * - Streaming response coordination
 * - Error handling and fallback mechanisms
 * - Performance monitoring and metrics
 */
@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);

  constructor(private readonly langChainService: LangChainService) {}

  /**
   * Gets all available AI models for comparison.
   * Returns model metadata including provider and display names.
   * Uses LangChain service for unified model management.
   */
  getAvailableModels() {
    return this.langChainService.getAvailableModels();
  }

  /**
   * Streams a response from a specific AI model.
   * Handles provider routing and error management.
   * Uses LangChain for unified streaming across all providers.
   */
  async streamResponse(
    modelId: string,
    prompt: string,
    onChunk: (chunk: string) => void,
    onComplete: (metrics: any) => void,
    onError: (error: string) => void
  ): Promise<void> {
    return this.langChainService.streamResponse(
      modelId,
      prompt,
      onChunk,
      onComplete,
      onError
    );
  }

  /**
   * Streams responses from multiple models simultaneously.
   * Coordinates parallel streaming and manages session state.
   * Uses LangChain for optimized parallel processing.
   */
  async streamMultipleResponses(
    modelIds: string[],
    prompt: string,
    onModelChunk: (modelId: string, chunk: string) => void,
    onModelComplete: (modelId: string, metrics: any) => void,
    onModelError: (modelId: string, error: string) => void
  ): Promise<void> {
    return this.langChainService.streamMultipleResponses(
      modelIds,
      prompt,
      onModelChunk,
      onModelComplete,
      onModelError
    );
  }

  /**
   * Gets pricing information for a specific model.
   * Used for cost calculation and display.
   * Uses LangChain for unified pricing information.
   */
  getModelPricing(modelId: string) {
    return this.langChainService.getPricing(modelId);
  }
}
