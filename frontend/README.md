# AI Model Playground - Frontend

Next.js frontend application providing a modern, responsive interface for comparing AI models in real-time. Built with React, TypeScript, and Tailwind CSS.

## 🏗️ Architecture

### Framework & Tools

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Socket.IO**: Real-time WebSocket communication
- **React Markdown**: Rich text rendering
- **Framer Motion**: Smooth animations
- **Auth0**: Authentication and user management

### Core Features

- **Real-time Streaming**: Live AI model responses
- **Responsive Design**: Mobile-first approach
- **Type Safety**: Full TypeScript implementation
- **Performance**: Optimized rendering and state management
- **Accessibility**: WCAG compliant components
- **Authentication**: Secure user login with Auth0
- **User Management**: Profile management and session handling

## 📁 Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/          # Auth0 authentication routes
│   ├── login/             # Login page
│   ├── profile/           # User profile page
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── Header.tsx         # Application header
│   ├── ModelSelector.tsx  # Model selection interface
│   ├── PromptInput.tsx    # Prompt input component
│   ├── ModelComparison.tsx # Main comparison interface
│   ├── ModelResponseCard.tsx # Individual model response
│   ├── SessionMetrics.tsx # Performance metrics
│   ├── SessionHistory.tsx # Session history browser
│   ├── ProtectedRoute.tsx # Authentication wrapper
│   └── UserProvider.tsx   # User context provider
├── hooks/                 # Custom React hooks
│   ├── useApi.ts         # REST API integration
│   ├── useWebSocket.ts   # WebSocket management
│   └── useAuth.ts        # Authentication hook
├── lib/                   # Utility functions
│   └── utils.ts          # Helper functions and utilities
└── types/                 # TypeScript definitions
    └── index.ts          # Type definitions
```

## 🎨 UI Components

### Core Components

#### Header Component

- **Purpose**: Application navigation and status
- **Features**: Connection status, history toggle, settings
- **Props**: `onToggleHistory`, `isConnected`

#### ModelSelector Component

- **Purpose**: Multi-select AI model picker
- **Features**: Model information, pricing display, selection state
- **Props**: `models`, `selectedModels`, `onSelectionChange`

#### PromptInput Component

- **Purpose**: Text input for user prompts
- **Features**: Auto-resize, character count, keyboard shortcuts
- **Props**: `onSubmit`, `disabled`, `placeholder`

#### ModelComparison Component

- **Purpose**: Main comparison interface
- **Features**: Real-time streaming, session management, metrics
- **Props**: `session`, `onNewComparison`

#### ModelResponseCard Component

- **Purpose**: Individual model response display
- **Features**: Streaming animation, markdown rendering, copy functionality
- **Props**: `response`, `onChunk`, `onComplete`, `onError`

#### SessionMetrics Component

- **Purpose**: Performance and cost statistics
- **Features**: Token usage, cost calculation, response times
- **Props**: `metrics`

#### SessionHistory Component

- **Purpose**: Past comparison browser
- **Features**: Search, pagination, session details
- **Props**: `onBack`

#### ProtectedRoute Component

- **Purpose**: Authentication wrapper for protected pages
- **Features**: Login redirect, user context, route protection
- **Props**: `children`, `fallback`

#### UserProvider Component

- **Purpose**: User context and authentication state
- **Features**: User data, login/logout, session management
- **Context**: User information and authentication status

### Custom Hooks

#### useApi Hook

- **Purpose**: REST API integration
- **Features**: Error handling, loading states, type safety
- **Returns**: API methods, loading state, error state

#### useWebSocket Hook

- **Purpose**: Real-time WebSocket management
- **Features**: Connection handling, event management, reconnection
- **Returns**: Socket instance, connection state, event handlers

#### useAuth Hook

- **Purpose**: Authentication state management
- **Features**: Login/logout, user data, token handling
- **Returns**: User data, authentication status, auth methods

## 🎯 User Experience

### Real-time Features

- **Live Streaming**: Watch responses generate in real-time
- **Status Indicators**: Visual feedback for model states
- **Progress Tracking**: Response completion monitoring
- **Error Handling**: Graceful failure management

### Responsive Design

- **Mobile First**: Optimized for all screen sizes
- **Grid Layout**: Responsive model comparison grid
- **Touch Friendly**: Mobile-optimized interactions
- **Accessibility**: Screen reader support and keyboard navigation

### Performance Optimizations

- **Code Splitting**: Lazy loading of components
- **Memoization**: Optimized re-rendering
- **Debouncing**: Efficient user input handling
- **Caching**: API response caching

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Auth0 Configuration
AUTH0_SECRET=your_auth0_secret_here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your_auth0_domain_here
AUTH0_CLIENT_ID=your_auth0_client_id_here
AUTH0_CLIENT_SECRET=your_auth0_client_secret_here
AUTH0_AUDIENCE=your_auth0_audience_here
```

### Next.js Configuration

```javascript
// next.config.js
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    NEXT_PUBLIC_WS_URL:
      process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001",
  },
};
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          /* Custom color palette */
        },
        gray: {
          /* Gray scale variations */
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
      },
    },
  },
  plugins: [],
};
```

## 🎨 Styling & Design

### Design System

- **Color Palette**: Primary blue, neutral grays, status colors
- **Typography**: Inter font family with consistent sizing
- **Spacing**: 4px base unit with consistent spacing scale
- **Shadows**: Subtle elevation with consistent shadow system
- **Borders**: Rounded corners with consistent border radius

### Component Styling

- **Utility Classes**: Tailwind CSS utility-first approach
- **Custom Components**: Reusable styled components
- **Responsive Design**: Mobile-first responsive breakpoints
- **Dark Mode**: Ready for dark mode implementation
- **Accessibility**: High contrast and focus indicators

### Animation & Transitions

- **Smooth Transitions**: CSS transitions for state changes
- **Loading States**: Skeleton screens and loading indicators
- **Micro-interactions**: Hover effects and button states
- **Streaming Animation**: Real-time response indicators

## 🔐 Authentication

### Auth0 Integration

The frontend uses Auth0 for secure user authentication with a seamless login experience:

#### Authentication Flow

1. **Login**: User clicks login button, redirected to Auth0 Universal Login
2. **Callback**: Auth0 redirects back with authorization code
3. **Token Exchange**: Frontend exchanges code for access token
4. **Session Storage**: Token stored securely in HTTP-only cookies
5. **API Requests**: Token automatically included in API requests
6. **Logout**: User logout clears session and redirects to Auth0

#### Protected Routes

- **Main Application**: `/` - Requires authentication
- **Profile Page**: `/profile` - User profile management
- **API Routes**: All comparison endpoints require authentication

#### User Management

- **User Context**: Global user state management
- **Profile Data**: User information and preferences
- **Session Persistence**: Automatic token refresh
- **Secure Storage**: HTTP-only cookies for token storage

#### Security Features

- **Token Validation**: Automatic token validation on page load
- **Route Protection**: Automatic redirect to login for unauthenticated users
- **Secure Cookies**: HTTP-only cookies prevent XSS attacks
- **Token Refresh**: Automatic token refresh before expiration

## 🔌 API Integration

### REST API Integration

```typescript
// Authentication endpoints
GET /api/auth/login       // Initiate Auth0 login
GET /api/auth/logout      // Logout and clear session
GET /api/auth/me          // Get current user

// Comparison endpoints (protected)
POST /comparison          // Create comparison session
GET /comparison/:id       // Get session details
GET /comparison           // Get session history
GET /comparison/models/available // Get available models
```

### WebSocket Integration

```typescript
// WebSocket events
join_session: { sessionId: string }
leave_session: { sessionId: string }
start_comparison: { sessionId: string, modelIds: string[] }

// Server events
model_chunk: { sessionId: string, modelId: string, chunk: string }
model_complete: { sessionId: string, modelId: string, metrics: object }
model_error: { sessionId: string, modelId: string, error: string }
comparison_complete: { sessionId: string }
```

## 🧪 Testing & Quality

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Type Checking**: Compile-time type validation

### Testing Strategy

- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user workflow testing
- **Accessibility Tests**: Screen reader and keyboard navigation

### Performance Monitoring

- **Bundle Analysis**: Webpack bundle analyzer
- **Lighthouse**: Performance and accessibility audits
- **Core Web Vitals**: LCP, FID, CLS monitoring
- **Real User Monitoring**: User experience tracking

## 🚀 Deployment

### Build Process

```bash
npm run build    # Production build
npm run start    # Production server
npm run dev      # Development server
```

### Deployment Options

- **Vercel**: Recommended for Next.js applications
- **Netlify**: Static site deployment
- **AWS**: Full-stack deployment
- **Docker**: Containerized deployment

### Environment Configuration

- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live application deployment

## 🔧 Development

### Development Workflow

1. **Feature Development**: Create feature branches
2. **Component Development**: Build reusable components
3. **API Integration**: Connect to backend services
4. **Testing**: Write and run tests
5. **Code Review**: Peer review process
6. **Deployment**: Automated deployment pipeline

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Consistent code style
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages
- **Documentation**: Inline code documentation

### Performance Best Practices

- **Code Splitting**: Lazy load components
- **Memoization**: Optimize re-renders
- **Bundle Optimization**: Minimize bundle size
- **Image Optimization**: Next.js image optimization
- **Caching**: Strategic caching strategies

## 🎯 User Experience Features

### Real-time Interaction

- **Live Updates**: Real-time response streaming
- **Status Feedback**: Visual status indicators
- **Progress Tracking**: Response completion monitoring
- **Error Recovery**: Graceful error handling

### Accessibility

- **Screen Reader**: Full screen reader support
- **Keyboard Navigation**: Complete keyboard accessibility
- **High Contrast**: Accessible color schemes
- **Focus Management**: Proper focus handling

### Mobile Experience

- **Touch Optimized**: Mobile-friendly interactions
- **Responsive Layout**: Adaptive grid system
- **Performance**: Optimized for mobile devices
- **Offline Support**: Progressive web app features

## 🔮 Future Enhancements

### Planned Features

- **Dark Mode**: Theme switching capability
- **User Authentication**: User accounts and personalization
- **Advanced Analytics**: Detailed usage analytics
- **Export Options**: PDF and JSON export
- **Collaboration**: Shared comparison sessions
- **Model Fine-tuning**: Custom model training

### Technical Improvements

- **Performance**: Further optimization
- **Testing**: Comprehensive test coverage
- **Documentation**: Enhanced documentation
- **Monitoring**: Advanced monitoring and analytics
- **Security**: Enhanced security measures
