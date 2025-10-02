"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Download, Share2 } from "lucide-react";
import { ComparisonSession, ModelResponse, WebSocketMessage } from "@/types";
import { ModelResponseCard } from "./ModelResponseCard";
import { SessionMetrics } from "./SessionMetrics";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import { Socket } from "socket.io-client";

interface ModelComparisonProps {
  session: ComparisonSession;
  onNewComparison: () => void;
  socket: Socket | null;
  isConnected: boolean;
}

/**
 * Model comparison component displaying real-time AI model responses.
 *
 * This component provides:
 * - Real-time streaming of model responses
 * - Side-by-side comparison layout
 * - Performance metrics and statistics
 * - Export and sharing functionality
 * - Session management controls
 */
export function ModelComparison({
  session,
  onNewComparison,
  socket,
  isConnected,
}: ModelComparisonProps) {
  const [responses, setResponses] = useState<Map<string, ModelResponse>>(
    new Map()
  );
  const [sessionMetrics, setSessionMetrics] = useState({
    totalTokens: 0,
    totalCost: 0,
    averageResponseTime: 0,
  });
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);

  // Socket and connection status are now passed as props

  /**
   * Sets up event listeners for real-time comparison updates.
   * Handles model responses, completion, and error events.
   */
  const setupComparisonListeners = (
    onModelChunk: (data: WebSocketMessage) => void,
    onModelComplete: (data: WebSocketMessage) => void,
    onModelError: (data: WebSocketMessage) => void,
    onComparisonComplete: (data: WebSocketMessage) => void,
    onComparisonError: (data: WebSocketMessage) => void
  ) => {
    if (!socket) {
      return;
    }

    // Remove any existing listeners first to avoid duplicates
    socket.off("model_chunk");
    socket.off("model_complete");
    socket.off("model_error");
    socket.off("comparison_complete");
    socket.off("comparison_error");

    // Model response streaming
    socket.on("model_chunk", onModelChunk);
    socket.on("model_complete", onModelComplete);
    socket.on("model_error", onModelError);
    socket.on("comparison_complete", onComparisonComplete);
    socket.on("comparison_error", onComparisonError);

    // Return cleanup function
    return () => {
      if (socket) {
        socket.off("model_chunk");
        socket.off("model_complete");
        socket.off("model_error");
        socket.off("comparison_complete");
        socket.off("comparison_error");
      }
    };
  };

  // Initialize responses for each model
  useEffect(() => {
    const initialResponses = new Map();
    // Safety check for session.models
    if (session.models && Array.isArray(session.models)) {
      session.models.forEach((modelId) => {
        initialResponses.set(modelId, {
          id: `temp-${modelId}`,
          modelId,
          provider: modelId.includes("gpt")
            ? "openai"
            : modelId.includes("gemini")
            ? "google"
            : modelId.includes("claude")
            ? "anthropic"
            : "unknown",
          response: "",
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      });
      setResponses(initialResponses);
    } else {
      // If session.models is not available, try to extract model IDs from responses
      if (session.responses && Array.isArray(session.responses)) {
        const modelIds = Array.from(
          new Set(session.responses.map((r) => r.modelId))
        );
        modelIds.forEach((modelId) => {
          initialResponses.set(modelId, {
            id: `temp-${modelId}`,
            modelId,
            provider: modelId.includes("gpt")
              ? "openai"
              : modelId.includes("gemini")
              ? "google"
              : modelId.includes("claude")
              ? "anthropic"
              : "unknown",
            response: "",
            status: "pending",
            createdAt: new Date().toISOString(),
          });
        });
        setResponses(initialResponses);
      }
    }

    // If we have existing responses from the loaded session, populate them
    if (session.responses && Array.isArray(session.responses)) {
      const existingResponses = new Map();
      session.responses.forEach((response) => {
        existingResponses.set(response.modelId, response);
      });
      setResponses(existingResponses);
    }
  }, [session.models, session.responses]);

  // Set up WebSocket listeners for real-time updates
  useEffect(() => {
    if (!socket) {
      return;
    }

    // Use socket.connected instead of isConnected state to avoid timing issues
    if (!socket.connected) {
      return;
    }

    // // Debug: Listen to all WebSocket events
    // const handleAnyEvent = (data: any) => {
    //   console.log("Received ANY WebSocket event:", data);
    // };

    // socket.onAny(handleAnyEvent);

    const handleModelChunk = (data: WebSocketMessage) => {
      if (data.sessionId === session.sessionId && data.modelId && data.chunk) {
        setResponses((prev) => {
          const newResponses = new Map(prev);
          const current = newResponses.get(data.modelId!);
          if (current) {
            newResponses.set(data.modelId!, {
              ...current,
              response: (current.response || "") + data.chunk!,
              status: "streaming",
            });
          }
          return newResponses;
        });
      }
    };

    const handleModelComplete = (data: WebSocketMessage) => {
      if (data.sessionId === session.sessionId && data.modelId) {
        setResponses((prev) => {
          const newResponses = new Map(prev);
          const current = newResponses.get(data.modelId!);
          if (current) {
            newResponses.set(data.modelId!, {
              ...current,
              status: "completed",
              inputTokens: data.metrics?.inputTokens,
              outputTokens: data.metrics?.outputTokens,
              cost: data.metrics?.cost,
              responseTimeMs: data.metrics?.responseTimeMs,
            });
          }
          return newResponses;
        });
      }
    };

    const handleModelError = (data: WebSocketMessage) => {
      if (data.sessionId === session.sessionId && data.modelId) {
        setResponses((prev) => {
          const newResponses = new Map(prev);
          const current = newResponses.get(data.modelId!);
          if (current) {
            newResponses.set(data.modelId!, {
              ...current,
              status: "error",
              errorMessage:
                data.error || "An error occurred while processing the request",
            });
          }
          return newResponses;
        });
      }
    };

    const handleComparisonComplete = (data: WebSocketMessage) => {
      if (data.sessionId === session.sessionId) {
        handleSessionComplete(data);
      }
    };

    // Use the setupComparisonListeners function from the hook
    const cleanup = setupComparisonListeners(
      handleModelChunk,
      handleModelComplete,
      handleModelError,
      handleComparisonComplete,
      handleComparisonComplete // Using same handler for comparison error
    );

    // Cleanup function
    return () => {
      // socket.offAny(handleAnyEvent);
      if (cleanup) {
        cleanup();
      }
    };
  }, [socket, socket?.connected, session.sessionId]);

  /**
   * Updates a model response with new content or status.
   * Handles both streaming updates and final completion.
   */
  const updateModelResponse = (
    modelId: string,
    updates: Partial<ModelResponse>
  ) => {
    setResponses((prev) => {
      const newResponses = new Map(prev);
      const current = newResponses.get(modelId);
      if (current) {
        newResponses.set(modelId, { ...current, ...updates });
      }
      return newResponses;
    });
  };

  /**
   * Handles session completion.
   * Updates final session status and metrics.
   */
  const handleSessionComplete = (data: WebSocketMessage) => {
    // Calculate final session metrics from all completed responses
    const responseArray = Array.from(responses.values());
    const completedResponses = responseArray.filter(
      (r) => r.status === "completed"
    );

    // Calculate totals
    const totalInputTokens = completedResponses.reduce(
      (sum, r) => sum + (r.inputTokens || 0),
      0
    );
    const totalOutputTokens = completedResponses.reduce(
      (sum, r) => sum + (r.outputTokens || 0),
      0
    );
    const totalTokens = totalInputTokens + totalOutputTokens;
    const totalCost = completedResponses.reduce(
      (sum, r) => sum + (r.cost || 0),
      0
    );

    // Calculate average response time
    const responseTimes = completedResponses
      .map((r) => r.responseTimeMs)
      .filter((time) => time !== undefined) as number[];
    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0;

    // Update session metrics
    setSessionMetrics({
      totalTokens,
      totalCost,
      averageResponseTime,
    });

    // Mark session as completed
    setIsSessionCompleted(true);
  };

  const responseArray = Array.from(responses.values());
  const completedCount = responseArray.filter(
    (r) => r.status === "completed"
  ).length;
  const errorCount = responseArray.filter((r) => r.status === "error").length;

  // Calculate dynamic width based on number of cards
  const getCardWidth = () => {
    const cardCount = responseArray.length;
    if (cardCount === 0) return "w-full";
    if (cardCount === 1) return "w-full";
    if (cardCount === 2) return "w-1/2";
    if (cardCount === 3) return "w-1/3";
    if (cardCount === 4) return "w-1/4";
    // For 5+ cards, use minimum width of 30% (w-[30%])
    return "w-[30%]";
  };

  // Determine if we need horizontal scrolling
  const needsHorizontalScroll = responseArray.length > 3;

  return (
    <div className="h-full flex flex-col">
      {/* Model Responses - Dynamic width with conditional scrolling */}
      <div className="flex-1 overflow-hidden p-6">
        <div
          className={`h-full flex space-x-6 ${
            needsHorizontalScroll ? "overflow-x-auto scrollbar-hide" : ""
          }`}
        >
          {responseArray.map((response) => (
            <div
              key={response.modelId}
              className={`${
                needsHorizontalScroll ? "flex-shrink-0" : "flex-1"
              } ${getCardWidth()} h-full`}
            >
              <ModelResponseCard
                response={response}
                onChunk={() => {}}
                onComplete={() => {}}
                onError={() => {}}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
