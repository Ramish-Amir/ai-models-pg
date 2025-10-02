import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ComparisonModule } from "./comparison/comparison.module";
import { AiProviderModule } from "./ai-provider/ai-provider.module";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { ComparisonSession } from "./database/entities/comparison-session.entity";
import { ModelResponse } from "./database/entities/model-response.entity";
import { User } from "./database/entities/user.entity";
import { UserModule } from "./user/user.module";

/**
 * Root application module that orchestrates all feature modules.
 *
 * This module configures:
 * - Environment variable management
 * - Database connection and entities
 * - Caching for performance optimization
 * - Feature modules for comparison sessions and AI providers
 */
@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Database configuration with SQLite
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: process.env.DATABASE_PATH || "./database.sqlite",
      entities: [ComparisonSession, ModelResponse, User],
      synchronize: process.env.NODE_ENV !== "production", // Auto-create tables in development
      logging: process.env.NODE_ENV === "development",
    }),

    // Global caching configuration
    CacheModule.register({
      ttl: 300, // 5 minutes cache TTL
      max: 100, // Maximum 100 items in cache
    }),

    // Feature modules
    DatabaseModule,
    AuthModule,
    ComparisonModule,
    AiProviderModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
