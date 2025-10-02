import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { SimpleAuthStrategy } from "./simple-auth.strategy";
import { User } from "../database/entities/user.entity";

/**
 * Authentication module for Auth0 integration.
 *
 * This module provides:
 * - JWT token validation
 * - User management
 * - Authentication guards
 * - Auth0 integration
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("AUTH0_CLIENT_SECRET"),
        signOptions: {
          expiresIn: "24h",
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SimpleAuthStrategy],
  exports: [AuthService, JwtStrategy, SimpleAuthStrategy],
})
export class AuthModule {}
