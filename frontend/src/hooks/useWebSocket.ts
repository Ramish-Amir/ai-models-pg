import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { WebSocketMessage } from "@/types";

/**
 * Custom hook for managing WebSocket connections and real-time updates.
 *
 * This hook provides:
 * - WebSocket connection management
 * - Real-time event handling
 * - Connection status monitoring
 * - Automatic reconnection
 * - Event cleanup and memory management
 */
export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const connectionCallbacks = useRef<(() => void)[]>([]);

  useEffect(() => {
    // Initialize WebSocket connection
    const initializeSocket = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
      const newSocket = io(`${wsUrl}/comparison`, {
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      // Connection event handlers
      newSocket.on("connect", () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Trigger any pending connection callbacks
        connectionCallbacks.current.forEach((callback) => {
          try {
            callback();
          } catch (error) {
            console.error("Error in connection callback:", error);
          }
        });
      });

      newSocket.on("disconnect", (reason) => {
        setIsConnected(false);

        // Attempt reconnection for certain disconnect reasons
        if (reason === "io server disconnect") {
          // Server initiated disconnect, don't reconnect
          return;
        }

        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            10000
          );
          reconnectAttempts.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            newSocket.connect();
          }, delay);
        } else {
          setError("Failed to reconnect after multiple attempts");
        }
      });

      newSocket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        setError(error.message);
        setIsConnected(false);
      });

      newSocket.on("error", (error) => {
        console.error("WebSocket error:", error);
        setError(error.message || "WebSocket error occurred");
      });

      setSocket(newSocket);
    };

    initializeSocket();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      // Clear all connection callbacks to prevent memory leaks
      connectionCallbacks.current = [];
    };
  }, []);

  /**
   * Sends a message to join a comparison session.
   * Enables real-time updates for that specific session.
   */
  const joinSession = (sessionId: string) => {
    if (socket && isConnected) {
      socket.emit("join_session", { sessionId });
    }
  };

  /**
   * Sends a message to leave a comparison session.
   * Stops receiving updates for that session.
   */
  const leaveSession = (sessionId: string) => {
    if (socket && isConnected) {
      socket.emit("leave_session", { sessionId });
    }
  };

  /**
   * Starts a comparison session with real-time streaming.
   * Initiates AI model responses and coordinates streaming.
   */
  const startComparison = (sessionId: string, modelIds: string[]) => {
    if (socket && isConnected) {
      socket.emit("start_comparison", { sessionId, modelIds });
    }
  };

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

    const setupListeners = () => {
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
    };

    // If socket is already connected, set up listeners immediately
    if (socket.connected) {
      setupListeners();
    } else {
      // If not connected, register a callback to set up listeners when connection is established
      connectionCallbacks.current.push(setupListeners);
    }

    // Return cleanup function
    return () => {
      if (socket) {
        socket.off("model_chunk");
        socket.off("model_complete");
        socket.off("model_error");
        socket.off("comparison_complete");
        socket.off("comparison_error");
      }
      // Remove this callback from the list
      const index = connectionCallbacks.current.indexOf(setupListeners);
      if (index > -1) {
        connectionCallbacks.current.splice(index, 1);
      }
    };
  };

  /**
   * Manually reconnects the WebSocket if disconnected.
   * Useful for user-initiated reconnection attempts.
   */
  const reconnect = () => {
    if (socket) {
      socket.connect();
      setError(null);
    }
  };

  return {
    socket,
    isConnected,
    error,
    joinSession,
    leaveSession,
    startComparison,
    setupComparisonListeners,
    reconnect,
  };
}
