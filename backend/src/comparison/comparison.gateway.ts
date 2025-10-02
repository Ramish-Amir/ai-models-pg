import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { ComparisonService } from "./comparison.service";

/**
 * WebSocket gateway for real-time AI model comparison streaming.
 *
 * This gateway handles:
 * - WebSocket connection management
 * - Real-time streaming of AI responses
 * - Session state synchronization
 * - Error handling and recovery
 * - Client connection lifecycle
 */
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
  namespace: "/comparison",
})
export class ComparisonGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ComparisonGateway.name);
  private readonly activeSessions = new Map<string, Set<string>>(); // sessionId -> clientIds

  constructor(private readonly comparisonService: ComparisonService) {}

  /**
   * Handles new WebSocket connections.
   * Logs connection and prepares for session management.
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Handles WebSocket disconnections.
   * Cleans up session mappings and resources.
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove client from all sessions
    for (const [sessionId, clients] of this.activeSessions.entries()) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  /**
   * Joins a client to a comparison session.
   * Enables real-time updates for that specific session.
   */
  @SubscribeMessage("join_session")
  async handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string }
  ) {
    const { sessionId } = data;

    try {
      console.log(`[WebSocket] Received join_session for session ${sessionId}`);
      // Join the session room
      await client.join(sessionId);

      // Track active session
      if (!this.activeSessions.has(sessionId)) {
        this.activeSessions.set(sessionId, new Set());
      }
      this.activeSessions.get(sessionId).add(client.id);

      this.logger.log(`Client ${client.id} joined session ${sessionId}`);

      // Send confirmation
      client.emit("session_joined", { sessionId });
    } catch (error) {
      this.logger.error(`Error joining session ${sessionId}:`, error);
      client.emit("error", { message: "Failed to join session" });
    }
  }

  /**
   * Leaves a comparison session.
   * Stops receiving updates for that session.
   */
  @SubscribeMessage("leave_session")
  async handleLeaveSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string }
  ) {
    const { sessionId } = data;

    await client.leave(sessionId);

    // Remove from active sessions
    const sessionClients = this.activeSessions.get(sessionId);
    if (sessionClients) {
      sessionClients.delete(client.id);
      if (sessionClients.size === 0) {
        this.activeSessions.delete(sessionId);
      }
    }

    this.logger.log(`Client ${client.id} left session ${sessionId}`);
    client.emit("session_left", { sessionId });
  }

  /**
   * Starts a comparison session with real-time streaming.
   * Coordinates multiple AI models and streams responses.
   */
  @SubscribeMessage("start_comparison")
  async handleStartComparison(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { sessionId: string; modelIds: string[]; userId: string }
  ) {
    const { sessionId, modelIds, userId } = data;

    try {
      console.log(
        `[WebSocket] Received start_comparison for session ${sessionId} with models: ${modelIds.join(", ")}`
      );
      this.logger.log(
        `Starting comparison for session ${sessionId} with models: ${modelIds.join(", ")}`
      );

      // Start streaming comparison
      await this.comparisonService.startComparisonStreaming(
        sessionId,
        userId,
        modelIds,
        // Handle model chunk
        (modelId, chunk) => {
          console.log(
            `[WebSocket] Emitting model_chunk for ${modelId}: ${chunk.substring(0, 50)}...`
          );
          // Check room membership safely
          try {
            const roomSize =
              this.server.sockets.adapter.rooms?.get(sessionId)?.size || 0;
            console.log(
              `[WebSocket] Room ${sessionId} has ${roomSize} clients`
            );
          } catch (error) {
            console.log(
              `[WebSocket] Could not check room membership for ${sessionId}`
            );
          }
          this.server.to(sessionId).emit("model_chunk", {
            sessionId,
            modelId,
            chunk,
            timestamp: new Date().toISOString(),
          });
        },
        // Handle model completion
        (modelId, metrics) => {
          console.log(`[WebSocket] Emitting model_complete for ${modelId}`);
          this.server.to(sessionId).emit("model_complete", {
            sessionId,
            modelId,
            metrics,
            timestamp: new Date().toISOString(),
          });
        },
        // Handle model error
        (modelId, error) => {
          console.log(
            `[WebSocket] Emitting model_error for ${modelId}: ${error}`
          );
          this.server.to(sessionId).emit("model_error", {
            sessionId,
            modelId,
            error,
            timestamp: new Date().toISOString(),
          });
        }
      );

      // Notify session completion
      this.server.to(sessionId).emit("comparison_complete", {
        sessionId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(
        `Error starting comparison for session ${sessionId}:`,
        error
      );
      client.emit("comparison_error", {
        sessionId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Broadcasts a message to all clients in a specific session.
   * Used for session-wide notifications and updates.
   */
  private broadcastToSession(sessionId: string, event: string, data: any) {
    this.server.to(sessionId).emit(event, {
      sessionId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}
