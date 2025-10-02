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
  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    "https://ai-models-pg.vercel.app",
    "https://ai-models-pg.vercel.app/",
    "http://localhost:3000",
    "http://localhost:3001",
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // For development, allow localhost with any port
      if (
        process.env.NODE_ENV === "development" &&
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
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
