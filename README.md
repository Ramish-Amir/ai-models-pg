# AI Model Playground

A comprehensive web application for comparing multiple AI models side-by-side in real-time. This project allows users to submit a single prompt and instantly see responses from different AI models, complete with performance metrics, cost analysis, and streaming capabilities.

## 🚀 Features

### Core Functionality

- **Real-time AI Model Comparison**: Compare responses from multiple AI models simultaneously with live streaming
- **Multi-Provider Support**: OpenAI (GPT-3.5, GPT-4), Anthropic (Claude Sonnet 4, Claude 3.5 Haiku), Google (Gemini 2.5 Flash Lite, Gemini 2.0 Flash)
- **LangChain AI Layer**: Unified provider abstraction for easy model addition
- **Performance Metrics**: Track response times, token usage, and costs in real-time
- **Session Management**: Save and review past comparisons with user authentication
- **Advanced AI Elements**: Rich rendering for code blocks, citations, reasoning, and interactive elements

### User Experience

- **Clean, Modern UI**: Responsive design with Tailwind CSS and mobile optimization
- **Real-time Updates**: WebSocket integration with status indicators and error handling
- **Authentication**: Auth0 integration with protected routes and user management

## 🔐 Authentication

### Auth0 Integration

This application uses **Auth0** for secure user authentication and authorization. Auth0 provides a robust, scalable authentication solution with enterprise-grade security features.

#### Features

- **Social Login**: Support for Google, GitHub, and other social providers
- **Universal Login**: Auth0's hosted login page with customizable branding
- **JWT Tokens**: Secure token-based authentication
- **User Management**: Built-in user registration, profile management, and password reset

#### Authentication Flow

1. **Login**: Users are redirected to Auth0's Universal Login page
2. **Authorization**: Auth0 handles the authentication process
3. **Token Exchange**: Upon successful login, Auth0 returns JWT tokens
4. **API Access**: Frontend uses tokens to authenticate with the backend API
5. **Session Management**: Tokens are stored securely and refreshed automatically

#### Configuration

The application requires the following Auth0 configuration:

**Backend Environment Variables:**

```env
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_AUDIENCE=your-api-identifier
JWT_SECRET=your-jwt-secret-here
```

**Frontend Environment Variables:**

```env
AUTH0_SECRET=your_auth0_secret_here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your_auth0_domain_here
AUTH0_CLIENT_ID=your_auth0_client_id_here
AUTH0_CLIENT_SECRET=your_auth0_client_secret_here
AUTH0_AUDIENCE=your_auth0_audience_here
```

#### Protected Routes

- **User Profile**: `/profile` - View and edit user information
- **API Endpoints**: All comparison endpoints require authentication
- **Session Management**: User-specific comparison sessions

#### Security Features

- **Token Validation**: All API requests validate JWT tokens
- **CORS Protection**: Configured for secure cross-origin requests
- **Rate Limiting**: Auth0 provides built-in rate limiting and abuse protection
- **Session Security**: Secure token storage and automatic refresh

## 🏗️ Architecture

### Backend (NestJS)

- **Framework**: NestJS with TypeScript and modular architecture
- **Database**: SQLite with TypeORM for session and user management
- **AI Integration**: LangChain-based unified provider layer with streaming support
- **Authentication**: Auth0 JWT token validation with CORS protection
- **Real-time**: Socket.IO for live updates and WebSocket communication

### Frontend (Next.js)

- **Framework**: Next.js 14 with App Router and TypeScript
- **UI**: Tailwind CSS with responsive design and custom components
- **State Management**: React hooks, context, and real-time Socket.IO integration
- **Authentication**: Auth0 integration with protected routes and user profiles
- **AI Elements**: Advanced rendering for code, citations, reasoning, and interactive elements

## 📁 Project Structure

```
ai-model-playground/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── app/            # Main application module
│   │   ├── comparison/     # Comparison session management
│   │   ├── ai-provider/    # LangChain AI integrations
│   │   │   ├── langchain.service.ts    # Unified AI provider
│   │   │   └── ai-provider.service.ts  # Provider abstraction
│   │   ├── auth/           # Auth0 authentication
│   │   ├── database/       # Database entities and services
│   │   └── main.ts         # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   │   ├── api/auth/  # Auth0 API routes
│   │   │   ├── login/     # Login page
│   │   │   └── profile/   # User profile page
│   │   ├── components/    # React components
│   │   │   ├── ai-elements/    # Advanced AI response components
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── ModelComparison.tsx
│   │   │   ├── SessionHistory.tsx
│   │   │   └── UserProvider.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── types/          # TypeScript type definitions
│   ├── package.json
│   └── next.config.js
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- API keys for OpenAI and Anthropic
- Auth0 account and application setup

### Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your API keys and Auth0 configuration:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   DATABASE_PATH=./database.sqlite
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   AUTH0_DOMAIN=your-auth0-domain.auth0.com
   AUTH0_CLIENT_ID=your-auth0-client-id
   AUTH0_CLIENT_SECRET=your-auth0-client-secret
   AUTH0_AUDIENCE=your-api-identifier
   JWT_SECRET=your-jwt-secret-here
   ```

4. **Start the backend server**:
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:

   ```bash
   cp env.example .env.local
   ```

   Edit `.env.local` file with your API URL and Auth0 configuration:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_WS_URL=http://localhost:3001
   AUTH0_SECRET=your_auth0_secret_here
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_ISSUER_BASE_URL=https://your_auth0_domain_here
   AUTH0_CLIENT_ID=your_auth0_client_id_here
   AUTH0_CLIENT_SECRET=your_auth0_client_secret_here
   AUTH0_AUDIENCE=your_auth0_audience_here
   ```

4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```

### Auth0 Setup

1. **Create Auth0 Account**: Sign up at [auth0.com](https://auth0.com)

2. **Create Application**:

   - Go to Applications → Create Application
   - Choose "Regular Web Application"
   - Note down your Domain, Client ID, and Client Secret

3. **Configure Application Settings**:

   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback/auth0`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`

4. **Create API** (for backend authentication):

   - Go to Applications → APIs → Create API
   - Set Identifier (this becomes your `AUTH0_AUDIENCE`)
   - Note down the API Identifier

5. **Update Environment Variables**: Use the values from your Auth0 dashboard in the environment files above

## 🚀 Usage

1. **Open your browser** and navigate to `http://localhost:3000`
2. **Login with Auth0** - Click the login button to authenticate
3. **Select AI models** you want to compare
4. **Enter your prompt** in the text area
5. **Click "Compare Models"** to start the comparison
6. **Watch responses stream** in real-time across multiple columns
7. **Review metrics** including response times, token usage, and costs
8. **Access session history** to revisit past comparisons
9. **Manage your profile** at `/profile` to view user information

## 🤖 AI Provider Integration

### LangChain AI Layer

The application uses **LangChain** as a unified AI provider abstraction layer, supporting OpenAI, Anthropic, and Google Gemini models with:

- **Unified Interface**: Single API for all AI providers with automatic streaming
- **Token Counting**: Accurate token counting with fallback calculations
- **Cost Calculation**: Real-time cost tracking per model
- **Error Handling**: Comprehensive error handling for API failures, quota limits, and provider errors
- **Easy Extension**: Simple to add new providers and models

#### Adding New Models

```typescript
// Example: Adding a new model to LangChainService
this.models.set(
  "new-model-id",
  new ChatProvider({
    modelName: "new-model",
    apiKey: apiKey,
    streaming: true,
    temperature: 0.7,
    maxTokens: 2000,
  })
);
```

## 📊 Monitoring & Analytics

### Metrics Tracked

- Response times per model with performance comparison
- Token usage (input/output) with cost calculations
- Error rates and session completion rates
- User engagement metrics and model analytics

## ✅ Success Criteria Met

### Core Requirements ✅

- **One prompt → Multiple models**: Simultaneous responses from 3+ AI models with real-time streaming
- **Status indicators**: Clear visual feedback for model states (typing → streaming → complete → error)
- **Connection handling**: Graceful error handling for API failures and connection issues
- **Professional interface**: Clean, responsive design with modern UI components
- **Local setup**: Clear installation and setup instructions

### Enhanced Features ✅

- **Authentication**: Auth0 integration with secure user management and protected routes
- **LangChain Integration**: Unified AI provider layer supporting OpenAI, Anthropic, and Google Gemini
- **Advanced AI Elements**: Rich rendering for code, citations, reasoning, and interactive elements
- **Session History**: Persistent storage with user-specific comparison sessions
- **WebSocket Integration**: Real-time updates with mobile-responsive design
