import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

/**
 * LangChain-based AI provider service providing unified access to multiple AI models.
 *
 * This service provides:
 * - Unified interface for different AI providers using LangChain
 * - Built-in streaming support with standardized chunk handling
 * - Automatic token counting and cost calculation
 * - Easy extensibility for new providers
 * - Built-in error handling and retry logic
 * - Provider abstraction with consistent API
 */
@Injectable()
export class LangChainService {
  private readonly logger = new Logger(LangChainService.name);
  private readonly models: Map<string, BaseChatModel> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeModels();
  }

  /**
   * Initializes all available AI models using LangChain providers.
   * Each model is configured with streaming support and proper API keys.
   */
  private initializeModels() {
    try {
      // OpenAI Models
      const openaiApiKey = this.configService.get<string>("OPENAI_API_KEY");
      if (openaiApiKey) {
        this.models.set(
          "gpt-3.5-turbo",
          new ChatOpenAI({
            modelName: "gpt-3.5-turbo",
            openAIApiKey: openaiApiKey,
            streaming: true,
            temperature: 0.7,
            maxTokens: 2000,
          })
        );

        this.models.set(
          "gpt-4",
          new ChatOpenAI({
            modelName: "gpt-4",
            openAIApiKey: openaiApiKey,
            streaming: true,
            temperature: 0.7,
            maxTokens: 2000,
          })
        );

        this.logger.log("OpenAI models initialized");
      } else {
        this.logger.warn("OpenAI API key not configured");
      }

      // Anthropic Models
      const anthropicApiKey =
        this.configService.get<string>("ANTHROPIC_API_KEY");
      if (anthropicApiKey) {
        this.models.set(
          "claude-sonnet-4-20250514",
          new ChatAnthropic({
            modelName: "claude-sonnet-4-20250514",
            anthropicApiKey: anthropicApiKey,
            streaming: true,
            temperature: 0.7,
            maxTokens: 2000,
          })
        );

        this.models.set(
          "claude-3-5-haiku-20241022",
          new ChatAnthropic({
            modelName: "claude-3-5-haiku-20241022",
            anthropicApiKey: anthropicApiKey,
            streaming: true,
            temperature: 0.7,
            maxTokens: 2000,
          })
        );

        this.logger.log("Anthropic models initialized");
      } else {
        this.logger.warn("Anthropic API key not configured");
      }

      // Google Gemini Models
      const googleApiKey = this.configService.get<string>("GOOGLE_API_KEY");
      if (googleApiKey) {
        this.models.set(
          "gemini-2.5-flash-lite",
          new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash-lite",
            apiKey: googleApiKey,
            streaming: true,
            temperature: 0.7,
            maxOutputTokens: 2000,
          })
        );

        this.models.set(
          "gemini-2.0-flash",
          new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash",
            apiKey: googleApiKey,
            streaming: true,
            temperature: 0.7,
            maxOutputTokens: 2000,
          })
        );

        this.logger.log("Google Gemini models initialized");
      } else {
        this.logger.warn("Google API key not configured");
      }

      this.logger.log(`Initialized ${this.models.size} AI models`);
    } catch (error) {
      this.logger.error("Error initializing models:", error);
    }
  }

  /**
   * Gets all available models with their metadata.
   * Returns model information including provider, pricing, and capabilities.
   */
  getAvailableModels() {
    const models = [];

    // OpenAI Models
    if (this.models.has("gpt-3.5-turbo")) {
      models.push({
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "openai",
        pricing: this.getPricing("gpt-3.5-turbo"),
      });
    }

    if (this.models.has("gpt-4")) {
      models.push({
        id: "gpt-4",
        name: "GPT-4",
        provider: "openai",
        pricing: this.getPricing("gpt-4"),
      });
    }

    // Anthropic Models
    if (this.models.has("claude-sonnet-4-20250514")) {
      models.push({
        id: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
        provider: "anthropic",
        pricing: this.getPricing("claude-sonnet-4-20250514"),
      });
    }

    if (this.models.has("claude-3-5-haiku-20241022")) {
      models.push({
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        provider: "anthropic",
        pricing: this.getPricing("claude-3-5-haiku-20241022"),
      });
    }

    // Google Gemini Models
    if (this.models.has("gemini-2.5-flash-lite")) {
      models.push({
        id: "gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash Lite",
        provider: "google",
        pricing: this.getPricing("gemini-2.5-flash-lite"),
      });
    }

    if (this.models.has("gemini-2.0-flash")) {
      models.push({
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        provider: "google",
        pricing: this.getPricing("gemini-2.0-flash"),
      });
    }

    return models;
  }

  /**
   * Streams a response from a specific AI model using LangChain.
   * Handles provider routing, streaming, and metrics collection.
   */
  async streamResponse(
    modelId: string,
    prompt: string,
    onChunk: (chunk: string) => void,
    onComplete: (metrics: any) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const model = this.models.get(modelId);
      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }

      this.logger.log(`Starting LangChain stream for model: ${modelId}`);
      const startTime = Date.now();
      let fullResponse = "";
      let inputTokens = 0;
      let outputTokens = 0;
      let cost = 0;
      let responseTime = 0;

      // Create the message for LangChain
      const message = new HumanMessage(prompt);

      // Get accurate input token count using LangChain's built-in method
      try {
        inputTokens = await model.getNumTokens(prompt);
        this.logger.log(
          `Input tokens for ${modelId}: ${inputTokens} (accurate)`
        );
      } catch (error) {
        // Fallback to estimation if getNumTokens fails
        this.logger.warn(
          `Failed to get accurate token count for ${modelId}, using estimation: ${error.message}`
        );
        inputTokens = this.estimateTokens(prompt);
        this.logger.log(
          `Input tokens for ${modelId}: ${inputTokens} (estimated)`
        );
      }

      // Stream the response using LangChain's built-in streaming
      const stream = await model.stream([message]);

      for await (const chunk of stream) {
        if (chunk.content) {
          const content = chunk.content.toString();
          fullResponse += content;
          onChunk(content);
        }
      }

      // Get response time and token counts
      responseTime = Date.now() - startTime;

      // Get accurate output token count using LangChain's built-in method
      try {
        outputTokens = await model.getNumTokens(fullResponse);
        this.logger.log(
          `Output tokens for ${modelId}: ${outputTokens} (accurate)`
        );
      } catch (error) {
        // Fallback to estimation if getNumTokens fails
        this.logger.warn(
          `Failed to get accurate token count for ${modelId}, using estimation: ${error.message}`
        );
        outputTokens = this.estimateTokens(fullResponse);
        this.logger.log(
          `Output tokens for ${modelId}: ${outputTokens} (estimated)`
        );
      }

      // Calculate cost
      cost = this.calculateCost(modelId, inputTokens, outputTokens);
      this.logger.log(
        `Cost calculation for ${modelId}: input=${inputTokens}, output=${outputTokens}, cost=$${cost.toFixed(6)}`
      );

      onComplete({
        inputTokens,
        outputTokens,
        cost,
        responseTimeMs: responseTime,
      });

      this.logger.log(
        `Completed stream for ${modelId}: ${outputTokens} tokens, $${cost.toFixed(6)} cost, ${responseTime}ms`
      );
    } catch (error) {
      this.logger.error(`Error streaming response for ${modelId}:`, error);
      onError(error.message);
    }
  }

  /**
   * Streams responses from multiple models simultaneously.
   * Coordinates parallel streaming using LangChain's unified interface.
   */
  async streamMultipleResponses(
    modelIds: string[],
    prompt: string,
    onModelChunk: (modelId: string, chunk: string) => void,
    onModelComplete: (modelId: string, metrics: any) => void,
    onModelError: (modelId: string, error: string) => void
  ): Promise<void> {
    const promises = modelIds.map((modelId) =>
      this.streamResponse(
        modelId,
        prompt,
        (chunk) => onModelChunk(modelId, chunk),
        (metrics) => onModelComplete(modelId, metrics),
        (error) => onModelError(modelId, error)
      )
    );

    await Promise.all(promises);
  }

  /**
   * Gets pricing information for a specific model.
   * Returns input and output token costs per 1K tokens.
   */
  getPricing(modelId: string) {
    const pricingMap = {
      "gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
      "gpt-4": { input: 0.03, output: 0.06 },
      "claude-sonnet-4-20250514": { input: 0.003, output: 0.015 },
      "claude-3-5-haiku-20241022": { input: 0.00025, output: 0.00125 },
      "gemini-2.5-flash-lite": { input: 0.0001, output: 0.0004 },
      "gemini-2.0-flash": { input: 0.0001, output: 0.0004 },
    };

    return pricingMap[modelId] || { input: 0, output: 0 };
  }

  /**
   * Calculates the cost for a model based on token usage.
   * Uses the model's pricing information to compute total cost.
   */
  private calculateCost(
    modelId: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const pricing = this.getPricing(modelId);
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    const totalCost = inputCost + outputCost;

    this.logger.log(
      `Cost breakdown for ${modelId}: inputCost=$${inputCost.toFixed(6)} (${inputTokens} tokens @ $${pricing.input}/1k), outputCost=$${outputCost.toFixed(6)} (${outputTokens} tokens @ $${pricing.output}/1k), total=$${totalCost.toFixed(6)}`
    );

    return totalCost;
  }

  /**
   * Gets the number of available models.
   * Useful for monitoring and debugging.
   */
  getModelCount(): number {
    return this.models.size;
  }

  /**
   * Estimates token count for a given text using a more accurate approximation.
   * This provides reliable token counting as a fallback when LangChain's getNumTokens method fails.
   */
  private estimateTokens(text: string): number {
    if (!text || text.length === 0) return 0;

    // More accurate token estimation based on research and testing:
    // - GPT models: ~4 characters per token on average
    // - Claude models: ~3.5 characters per token on average
    // - Account for spaces, punctuation, and special characters
    // - Use word-based estimation as it's more accurate than character-based

    const words = text.trim().split(/\s+/).length;
    const characters = text.length;

    // Word-based estimation is more accurate for most models
    // Factor of 1.3 accounts for subword tokenization and special tokens
    const wordBasedTokens = Math.ceil(words * 1.3);

    // Character-based estimation as fallback
    const charBasedTokens = Math.ceil(characters / 3.5);

    // Use the more conservative estimate
    const estimatedTokens = Math.max(wordBasedTokens, charBasedTokens);

    return Math.max(estimatedTokens, 1); // Ensure at least 1 token
  }
}
