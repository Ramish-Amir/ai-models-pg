import { IsString, IsArray, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * Data Transfer Object for creating a new comparison session.
 * 
 * This DTO defines:
 * - Required prompt text with validation
 * - Optional model selection (defaults to all available)
 * - Input validation and sanitization
 * - Type safety for API requests
 */
export class CreateComparisonDto {
  @IsString()
  @MinLength(1, { message: 'Prompt cannot be empty' })
  @MaxLength(10000, { message: 'Prompt cannot exceed 10,000 characters' })
  prompt: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modelIds?: string[];
}
