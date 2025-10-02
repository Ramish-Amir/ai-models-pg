import { Module } from "@nestjs/common";
import { ComparisonController } from "./comparison.controller";
import { ComparisonService } from "./comparison.service";
import { ComparisonGateway } from "./comparison.gateway";
import { DatabaseModule } from "../database/database.module";
import { AiProviderModule } from "../ai-provider/ai-provider.module";
import { AuthModule } from "../auth/auth.module";

/**
 * Comparison module handling AI model comparison sessions.
 *
 * This module provides:
 * - REST API endpoints for session management
 * - WebSocket gateway for real-time streaming
 * - Session state management
 * - Performance metrics tracking
 * - Error handling and recovery
 */
@Module({
  imports: [DatabaseModule, AiProviderModule, AuthModule],
  controllers: [ComparisonController],
  providers: [ComparisonService, ComparisonGateway],
  exports: [ComparisonService],
})
export class ComparisonModule {}
