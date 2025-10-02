# AI Model Playground - Backend

NestJS backend application providing REST API and WebSocket services for the AI Model Playground. This backend handles AI model integration, real-time streaming, session management, and data persistence.

## 🏗️ Architecture

### Core Modules
- **AppModule**: Root application module with global configuration
- **ComparisonModule**: Session management and WebSocket handling
- **AiProviderModule**: AI model integrations (OpenAI, Anthropic)
- **DatabaseModule**: Data persistence and entity management
- **AuthModule**: Auth0 authentication and JWT validation

### Key Components
- **REST Controllers**: HTTP API endpoints for session management
- **WebSocket Gateway**: Real-time streaming and event handling
- **AI Provider Services**: Model-specific integration and streaming
- **Database Services**: CRUD operations and metrics calculation
- **Entity Models**: TypeORM entities for data persistence
- **Auth Guards**: JWT token validation and route protection
- **Auth Services**: Auth0 integration and user management

## 📁 Directory Structure

```
src/
├── app/                    # Main application
│   ├── app.controller.ts   # Health check and API info
│   ├── app.service.ts      # Application services
│   ├── app.module.ts       # Root module configuration
│   └── main.ts            # Application entry point
├── comparison/             # Comparison session management
│   ├── comparison.controller.ts    # REST API endpoints
│   ├── comparison.service.ts       # Session business logic
│   ├── comparison.gateway.ts       # WebSocket gateway
│   ├── comparison.module.ts       # Module configuration
│   └── dto/               # Data transfer objects
├── ai-provider/           # AI model integrations
│   ├── ai-provider.service.ts     # Unified provider interface
│   ├── ai-provider.module.ts      # Provider module
│   └── providers/         # Provider-specific implementations
│       ├── openai.service.ts      # OpenAI integration
│       └── anthropic.service.ts   # Anthropic integration
├── auth/                  # Authentication module
│   ├── auth.controller.ts         # Auth endpoints
│   ├── auth.service.ts           # Auth business logic
│   ├── auth.module.ts            # Auth module configuration
│   ├── jwt.strategy.ts           # JWT validation strategy
│   ├── jwt-auth.guard.ts         # JWT authentication guard
│   └── public.decorator.ts       # Public route decorator
└── database/              # Data persistence layer
    ├── database.service.ts        # Database operations
    ├── database.module.ts         # Database configuration
    └── entities/          # TypeORM entities
        ├── comparison-session.entity.ts
        ├── model-response.entity.ts
        └── user.entity.ts         # User entity for authentication
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_PATH=./database.sqlite

# AI Provider API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_AUDIENCE=your-api-identifier
JWT_SECRET=your-jwt-secret-here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Dependencies
- **@nestjs/core**: Core NestJS framework
- **@nestjs/websockets**: WebSocket support
- **@nestjs/typeorm**: Database integration
- **@nestjs/jwt**: JWT token handling
- **@nestjs/passport**: Authentication strategies
- **passport-jwt**: JWT strategy for Passport
- **typeorm**: ORM for database operations
- **sqlite3**: SQLite database driver
- **openai**: OpenAI API client
- **@anthropic-ai/sdk**: Anthropic API client
- **socket.io**: WebSocket communication

## 🚀 API Endpoints

### Authentication (Public)
```typescript
GET /auth/login
// Redirect to Auth0 login page
Response: Redirect to Auth0 Universal Login

GET /auth/logout
// Logout and clear session
Response: Redirect to frontend

GET /auth/me
// Get current user information
Response: { user: UserProfile }
```

### Comparison Management (Protected)
```typescript
POST /comparison
// Create new comparison session (requires authentication)
Body: { prompt: string, modelIds?: string[] }
Response: { sessionId: string, prompt: string, models: string[], status: string }

GET /comparison/:sessionId
// Get session details with responses (requires authentication)
Response: { id: string, prompt: string, responses: ModelResponse[], metrics: object }

GET /comparison
// Get session history with pagination (requires authentication)
Query: { limit?: number, offset?: number }
Response: SessionHistoryItem[]

GET /comparison/models/available
// Get available AI models (requires authentication)
Response: Model[]
```

### Health & Information (Public)
```typescript
GET /
// Application health check
Response: { status: string, timestamp: string, service: string, version: string }

GET /api/info
// API information and capabilities
Response: { name: string, version: string, features: string[], endpoints: object }
```

## 🔌 WebSocket Events

### Client → Server Events
```typescript
join_session: { sessionId: string }
// Join a comparison session for real-time updates

leave_session: { sessionId: string }
// Leave a comparison session

start_comparison: { sessionId: string, modelIds: string[] }
// Start AI model comparison with streaming
```

### Server → Client Events
```typescript
model_chunk: { sessionId: string, modelId: string, chunk: string, timestamp: string }
// Real-time response chunk from AI model

model_complete: { sessionId: string, modelId: string, metrics: object, timestamp: string }
// Model response completed with final metrics

model_error: { sessionId: string, modelId: string, error: string, timestamp: string }
// Model response error

comparison_complete: { sessionId: string, timestamp: string }
// All models completed comparison

comparison_error: { sessionId: string, error: string, timestamp: string }
// Session-level error
```

## 🗄️ Database Schema

### ComparisonSession Entity
```typescript
{
  id: string;                    // UUID primary key
  prompt: string;                 // User's input prompt
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalTokens: number;            // Aggregated token count
  totalCost: number;              // Aggregated cost
  averageResponseTime: number;    // Average response time
  createdAt: Date;                // Creation timestamp
  updatedAt: Date;                // Last update timestamp
  responses: ModelResponse[];     // Associated model responses
}
```

### ModelResponse Entity
```typescript
{
  id: string;                     // UUID primary key
  sessionId: string;              // Foreign key to session
  modelId: string;                // AI model identifier
  provider: string;               // Provider name (openai, anthropic)
  response: string;               // Complete response text
  status: 'pending' | 'streaming' | 'completed' | 'error';
  inputTokens: number;            // Input token count
  outputTokens: number;           // Output token count
  cost: number;                   // Response cost
  responseTimeMs: number;         // Response time in milliseconds
  errorMessage: string;           // Error details if failed
  createdAt: Date;                // Creation timestamp
}
```

## 🤖 AI Provider Integration

### OpenAI Service
- **Models**: GPT-3.5 Turbo, GPT-4
- **Streaming**: Real-time token streaming
- **Pricing**: Per-token cost calculation
- **Error Handling**: Rate limits, API failures

### Anthropic Service
- **Models**: Claude 3 Sonnet, Claude 3 Haiku
- **Streaming**: Real-time response streaming
- **Pricing**: Per-token cost calculation
- **Error Handling**: Rate limits, API failures

### Unified Provider Interface
```typescript
interface AiProviderService {
  getAvailableModels(): Model[];
  streamResponse(
    modelId: string,
    prompt: string,
    onChunk: (chunk: string) => void,
    onComplete: (metrics: any) => void,
    onError: (error: string) => void
  ): Promise<void>;
  getModelPricing(modelId: string): PricingInfo;
}
```

## 🔄 Real-time Streaming Flow

1. **Client Request**: User submits prompt and selects models
2. **Session Creation**: Backend creates comparison session
3. **WebSocket Connection**: Client joins session room
4. **Model Streaming**: Each AI model streams response in parallel
5. **Real-time Updates**: WebSocket events update client UI
6. **Metrics Calculation**: Token usage, costs, and timing tracked
7. **Session Completion**: Final metrics and status updates

## 🔐 Authentication & Security

### Auth0 Integration

The backend uses Auth0 for secure authentication with JWT token validation:

#### JWT Strategy
- **Token Validation**: All protected routes validate JWT tokens
- **User Extraction**: User information extracted from token payload
- **Route Protection**: Guards applied to sensitive endpoints
- **Public Routes**: Health checks and auth endpoints are public

#### Security Features
- **Token Validation**: JWT signature and expiration validation
- **CORS Protection**: Configured for secure cross-origin requests
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error responses without sensitive data

#### Authentication Flow
1. **Login**: Frontend redirects to Auth0 Universal Login
2. **Token Exchange**: Auth0 returns JWT access token
3. **API Requests**: Frontend includes token in Authorization header
4. **Token Validation**: Backend validates token with Auth0
5. **User Context**: User information available in request context

### Protected Routes
- All comparison endpoints require authentication
- User-specific session management
- Secure WebSocket connections with user context

## 🛡️ Error Handling

### API Error Responses
```typescript
{
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
}
```

### WebSocket Error Events
```typescript
{
  sessionId: string;
  modelId?: string;
  error: string;
  timestamp: string;
}
```

### Error Types
- **Validation Errors**: Input validation failures
- **API Errors**: AI provider API failures
- **Network Errors**: Connection timeouts and failures
- **Database Errors**: Data persistence failures
- **WebSocket Errors**: Real-time communication failures

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

### Test Structure
- **Unit Tests**: Individual service and controller testing
- **Integration Tests**: API endpoint and database testing
- **E2E Tests**: Full application workflow testing

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
- Set production environment variables
- Configure database connection
- Set up AI provider API keys
- Configure CORS origins

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
```

## 📊 Monitoring & Logging

### Application Logs
- Request/response logging
- Error tracking and reporting
- Performance metrics
- WebSocket connection monitoring

### Health Checks
- Database connectivity
- AI provider API status
- Memory and CPU usage
- Active session monitoring

## 🔧 Development

### Code Structure
- **Modular Architecture**: Feature-based module organization
- **Dependency Injection**: NestJS IoC container
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error management
- **Documentation**: Inline code documentation

### Best Practices
- **SOLID Principles**: Single responsibility, open/closed, etc.
- **Clean Architecture**: Separation of concerns
- **Error Boundaries**: Graceful error handling
- **Performance**: Efficient database queries and caching
- **Security**: Input validation and sanitization
