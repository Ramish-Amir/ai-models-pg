import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ComparisonSession } from "./entities/comparison-session.entity";
import { ModelResponse } from "./entities/model-response.entity";
import { User } from "./entities/user.entity";
import { DatabaseService } from "./database.service";

/**
 * Database module providing data access layer for the AI Model Playground.
 *
 * This module configures:
 * - TypeORM entities for database operations
 * - Database service for CRUD operations
 * - Repository pattern implementation
 * - Data validation and error handling
 */
@Module({
  imports: [TypeOrmModule.forFeature([ComparisonSession, ModelResponse, User])],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule],
})
export class DatabaseModule {}
