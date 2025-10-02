import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ModelResponse } from "./model-response.entity";
import { User } from "./user.entity";

/**
 * Entity representing a comparison session between multiple AI models.
 *
 * A comparison session contains:
 * - The user's prompt/question
 * - Session metadata (timestamps, status)
 * - Associated model responses
 * - Performance metrics
 */
@Entity("comparison_sessions")
export class ComparisonSession {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  prompt: string;

  @Column({ type: "varchar", length: 50, default: "pending" })
  status: "pending" | "in_progress" | "completed" | "failed";

  @Column({ type: "integer", default: 0 })
  totalTokens: number;

  @Column({ type: "decimal", precision: 10, scale: 4, default: 0 })
  totalCost: number;

  @Column({ type: "integer", default: 0 })
  averageResponseTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ModelResponse, (response) => response.session, {
    cascade: true,
  })
  responses: ModelResponse[];

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "uuid" })
  userId: string;
}
