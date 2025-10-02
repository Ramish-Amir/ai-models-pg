import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiProviderService } from "./ai-provider.service";
import { LangChainService } from "./langchain.service";

/**
 * AI Provider module managing integration with multiple AI model providers.
 *
 * This module provides:
 * - Unified interface for different AI providers
 * - LangChain-based provider implementations
 * - Streaming support for real-time responses
 * - Error handling and rate limiting
 * - Cost calculation and token counting
 */
@Module({
  imports: [ConfigModule],
  providers: [AiProviderService, LangChainService],
  exports: [AiProviderService, LangChainService],
})
export class AiProviderModule {}
