import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ComparisonSession } from "./comparison-session.entity";

/**
 * Entity representing a response from a specific AI model during a comparison session.
 *
 * Each model response contains:
 * - The AI model identifier and provider
 * - The complete response text
 * - Performance metrics (tokens, cost, response time)
 * - Status information (streaming, completed, error)
 */
@Entity("model_responses")
export class ModelResponse {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  modelId: string;

  @Column({ type: "varchar", length: 50 })
  provider: string;

  @Column({ type: "text", nullable: true })
  response: string | null;

  @Column({ type: "varchar", length: 50, default: "pending" })
  status: "pending" | "streaming" | "completed" | "error";

  @Column({ type: "integer", nullable: true })
  inputTokens: number;

  @Column({ type: "integer", nullable: true })
  outputTokens: number;

  @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
  cost: number;

  @Column({ type: "integer", nullable: true })
  responseTimeMs: number;

  @Column({ type: "text", nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ComparisonSession, (session) => session.responses, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sessionId" })
  session: ComparisonSession;

  @Column({ type: "uuid" })
  sessionId: string;
}
