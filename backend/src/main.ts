import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

/**
 * Main application entry point for the AI Model Playground backend.
 *
 * This file initializes the NestJS application with:
 * - CORS configuration for frontend communication
 * - Global validation pipes for request validation
 * - WebSocket support for real-time streaming
 * - Graceful shutdown handling
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  });

  // Global validation pipe for automatic request validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 AI Model Playground Backend running on port ${port}`);
  console.log(`📡 WebSocket server ready for real-time streaming`);
}

bootstrap().catch((error) => {
  console.error("❌ Failed to start application:", error);
  process.exit(1);
});
