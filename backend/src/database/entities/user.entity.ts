import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ComparisonSession } from "./comparison-session.entity";

/**
 * Entity representing a user in the AI Model Playground system.
 *
 * This entity stores:
 * - Auth0 user information
 * - User profile data
 * - Associated comparison sessions
 * - Account metadata
 */
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255, unique: true })
  auth0Id: string;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  name: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  picture: string;

  @Column({ type: "varchar", length: 10, default: "en" })
  locale: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ComparisonSession, (session) => session.user, {
    cascade: true,
  })
  sessions: ComparisonSession[];
}
