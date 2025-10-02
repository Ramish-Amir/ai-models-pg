/**
 * Type definitions for the AI Model Playground application.
 *
 * This file contains all TypeScript interfaces and types used throughout
 * the application for type safety and better developer experience.
 */

export interface Model {
  id: string;
  name: string;
  provider: string;
  pricing?: {
    input: number;
    output: number;
  };
  // Model capabilities (requires backend changes)
  contextWindow?: number; // Maximum input length in tokens
  modelSize?: number; // Parameter count in billions
  trainingCutoff?: string; // Training data cutoff date
  capabilities?: string[]; // Special features like ["vision", "code", "math"]
}

export interface ModelResponse {
  id: string;
  modelId: string;
  provider: string;
  response: string | null;
  status: "pending" | "streaming" | "completed" | "error";
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  responseTimeMs?: number;
  errorMessage?: string;
  createdAt: string;
}

export interface ComparisonSession {
  sessionId: string;
  prompt: string;
  models: string[];
  status: "pending" | "in_progress" | "completed" | "failed";
  totalTokens?: number;
  totalCost?: number;
  averageResponseTime?: number;
  createdAt: string;
  responses?: ModelResponse[];
}

export interface CreateComparisonRequest {
  prompt: string;
  modelIds: string[];
}

export interface WebSocketMessage {
  sessionId: string;
  modelId?: string;
  chunk?: string;
  metrics?: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
    responseTimeMs: number;
  };
  error?: string;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface SessionHistoryItem {
  id: string;
  prompt: string;
  status: string;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  responseCount: number;
  createdAt: string;
}
