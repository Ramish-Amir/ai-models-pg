# AI Model Playground

A comprehensive web application for comparing multiple AI models side-by-side in real-time. This project allows users to submit a single prompt and instantly see responses from different AI models, complete with performance metrics, cost analysis, and streaming capabilities.

## 🚀 Features

### Core Functionality

- **Real-time AI Model Comparison**: Compare responses from multiple AI models simultaneously
- **Live Streaming**: Watch responses stream in real-time as they're generated
- **Multi-Provider Support**: Integration with OpenAI (GPT-3.5, GPT-4) and Anthropic (Claude)
- **Performance Metrics**: Track response times, token usage, and costs
- **Session Management**: Save and review past comparisons
- **WebSocket Integration**: Real-time updates without page refreshes

### User Experience

- **Clean, Modern UI**: Responsive design with Tailwind CSS
- **Markdown Rendering**: Rich text display with syntax highlighting
- **Status Indicators**: Visual feedback for model response states
- **Export & Sharing**: Save and share comparison results
- **Session History**: Browse and revisit past comparisons
- **Error Handling**: Graceful failure management and recovery

## 🔐 Authentication

### Auth0 Integration

This application uses **Auth0** for secure user authentication and authorization. Auth0 provides a robust, scalable authentication solution with enterprise-grade security features.

#### Features

- **Social Login**: Support for Google, GitHub, and other social providers
- **Universal Login**: Auth0's hosted login page with customizable branding
- **JWT Tokens**: Secure token-based authentication
- **User Management**: Built-in user registration, profile management, and password reset
- **Security**: Multi-factor authentication, brute force protection, and anomaly detection

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

- **Framework**: NestJS with TypeScript
- **Database**: SQLite with TypeORM
- **WebSockets**: Socket.IO for real-time communication
- **AI Integration**: OpenAI and Anthropic SDKs
- **Architecture**: Modular design with dependency injection

### Frontend (Next.js)

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **State Management**: React hooks and context
- **Real-time**: Socket.IO client integration
- **Markdown**: React Markdown with syntax highlighting

## 📁 Project Structure

```
ai-model-playground/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── app/            # Main application module
│   │   ├── comparison/     # Comparison session management
│   │   ├── ai-provider/    # AI model integrations
│   │   ├── database/       # Database entities and services
│   │   └── main.ts         # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
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

## 🔧 API Documentation

### REST Endpoints

#### Comparison Management (Protected - Requires Authentication)

- `POST /comparison` - Create new comparison session
- `GET /comparison/:sessionId` - Get session details
- `GET /comparison` - Get session history
- `GET /comparison/models/available` - Get available models

#### Authentication

- `GET /auth/login` - Initiate Auth0 login flow
- `GET /auth/logout` - Logout and clear session
- `GET /auth/me` - Get current user information

#### Health & Info (Public)

- `GET /` - Health check
- `GET /api/info` - API information

### WebSocket Events

#### Client → Server

- `join_session` - Join a comparison session
- `leave_session` - Leave a comparison session
- `start_comparison` - Start model comparison

#### Server → Client

- `model_chunk` - Real-time response chunk
- `model_complete` - Model response completed
- `model_error` - Model response error
- `comparison_complete` - All models completed
- `comparison_error` - Session error

## 🎨 UI Components

### Core Components

- **Header**: Navigation, connection status, settings
- **ModelSelector**: Multi-select model picker with pricing info
- **PromptInput**: Multi-line text input with validation
- **ModelComparison**: Main comparison interface
- **ModelResponseCard**: Individual model response display
- **SessionMetrics**: Performance and cost statistics
- **SessionHistory**: Past comparison browser

### Custom Hooks

- **useApi**: REST API integration with error handling
- **useWebSocket**: Real-time WebSocket management

## 🔒 Security & Best Practices

### Security Features

- Input validation and sanitization
- Rate limiting and error handling
- CORS configuration
- Environment variable protection

### Performance Optimizations

- Database connection pooling
- Response caching
- WebSocket connection management
- Lazy loading and code splitting

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm run test          # Unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Coverage report
```

### Frontend Testing

```bash
cd frontend
npm run lint          # ESLint
npm run type-check    # TypeScript validation
```

## 📊 Monitoring & Analytics

### Metrics Tracked

- Response times per model
- Token usage (input/output)
- Cost calculations
- Error rates
- Session completion rates

### Database Schema

- **comparison_sessions**: Session metadata and metrics
- **model_responses**: Individual model responses and performance

## 🚀 Deployment

### Backend Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Docker, Vercel, AWS, etc.)

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code comments for implementation details

## 🔮 Future Enhancements

- Additional AI providers (Google, Cohere, etc.)
- User authentication and personalization
- Advanced analytics and insights
- Model fine-tuning capabilities
- Collaborative features
- API rate limiting and usage tracking
