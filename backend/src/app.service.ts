/**
 * Root application service providing basic application information and health checks.
 * 
 * This service handles:
 * - Application health status
 * - API version and feature information
 * - Basic application metadata
 */
export class AppService {
  /**
   * Returns the current health status of the application.
   * Includes timestamp and basic system information.
   */
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'AI Model Playground Backend',
      version: '1.0.0',
    };
  }

  /**
   * Returns detailed API information including supported features and endpoints.
   * Useful for frontend integration and API documentation.
   */
  getApiInfo() {
    return {
      name: 'AI Model Playground API',
      version: '1.0.0',
      description: 'Backend API for comparing multiple AI models in real-time',
      features: [
        'Real-time AI model comparison',
        'WebSocket streaming support',
        'Multiple AI provider integration',
        'Session management',
        'Response caching',
        'Performance metrics tracking',
      ],
      supportedProviders: [
        'OpenAI (GPT-3.5, GPT-4)',
        'Anthropic (Claude)',
      ],
      endpoints: {
        health: '/',
        apiInfo: '/api/info',
        comparison: '/comparison',
        websocket: '/ws',
      },
    };
  }
}
