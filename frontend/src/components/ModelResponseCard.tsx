"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Wifi,
  Key,
  DollarSign,
  Bot,
  TrendingUp,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ModelResponse, WebSocketMessage } from "@/types";
import {
  cn,
  formatCurrency,
  formatDuration,
  getStatusColor,
  getStatusIcon,
} from "@/lib/utils";
import { formatError, canRetryError } from "@/utils/errorHandling";
import { Loader } from "@/components/ai-elements/loader";

interface ModelResponseCardProps {
  response: ModelResponse;
  onChunk: (data: WebSocketMessage) => void;
  onComplete: (data: WebSocketMessage) => void;
  onError: (data: WebSocketMessage) => void;
}

/**
 * Individual model response card component.
 *
 * This component provides:
 * - Real-time streaming display
 * - Status indicators and progress
 * - Markdown rendering with syntax highlighting
 * - Copy to clipboard functionality
 * - Performance metrics display
 * - Error handling and display
 */
export function ModelResponseCard({
  response,
  onChunk,
  onComplete,
  onError,
}: ModelResponseCardProps) {
  const [copied, setCopied] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFooterOpen, setIsFooterOpen] = useState(false);

  // Handle streaming animation
  useEffect(() => {
    if (response.status === "streaming") {
      setIsStreaming(true);
    } else {
      setIsStreaming(false);
    }
  }, [response.status]);

  // Auto-open footer when metrics data is available
  useEffect(() => {
    const hasMetrics =
      response.inputTokens ||
      response.outputTokens ||
      response.cost ||
      response.responseTimeMs;
    if (hasMetrics) {
      setIsFooterOpen(true);
    }
  }, [
    response.inputTokens,
    response.outputTokens,
    response.cost,
    response.responseTimeMs,
  ]);

  /**
   * Copies the response text to clipboard.
   * Provides user feedback on successful copy.
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response.response || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  /**
   * Gets the appropriate status icon for the response status.
   */
  const getStatusIcon = () => {
    switch (response.status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "streaming":
        return <Zap className="w-4 h-4 animate-pulse" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "error":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  /**
   * Gets the appropriate status color for the response status.
   */
  const getStatusColor = () => {
    switch (response.status) {
      case "pending":
        return "text-gray-500";
      case "streaming":
        return "text-blue-500";
      case "completed":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative flex flex-col max-w-[100%] w-full min-w-[30%]">
      {/* Header - Absolute at top */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 bg-gradient-to-l from-gray-50 to-gray-300">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 capitalize">
                {response.modelId}
              </span>
            </div>

            {/* Status Tag */}
            <div
              className={cn(
                "inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                response.status === "completed"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : response.status === "streaming"
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : response.status === "error"
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : "bg-gray-100 text-gray-800 border border-gray-200"
              )}
            >
              {getStatusIcon()}
              <span className="capitalize">{response.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Response Content - Scrollable with padding for header and footer */}
      <div className="flex-1 overflow-y-auto pt-12 pb-[240px]">
        <div className="p-4">
          {response.status === "error" ? (
            /* Enhanced Error State */
            <ErrorDisplay
              errorMessage={
                response.errorMessage || "An unknown error occurred"
              }
            />
          ) : response.response && response.response.trim() ? (
            /* Response Content */
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="markdown-content"
                >
                  {response.response}
                </ReactMarkdown>
              </div>

              {/* Streaming Indicator */}
              {isStreaming && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Streaming...</span>
                </div>
              )}
            </div>
          ) : (
            /* Loading State with AI Elements Loader */
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-center">
                <Loader size={32} className="mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {response.status === "pending"
                    ? "Waiting to start..."
                    : "Processing..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Statistics Footer - Collapsible Design */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-t border-gray-200/60 backdrop-blur-sm transition-all duration-300 ${
          isFooterOpen ? "translate-y-0" : "translate-y-0"
        }`}
      >
        {/* Toggle Button */}
        <div className="flex items-center justify-center py-2">
          <button
            onClick={() => {
              console.log("Toggle clicked, current state:", isFooterOpen);
              setIsFooterOpen(!isFooterOpen);
            }}
            className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-600 hover:text-gray-800"
          >
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <span>Metrics</span>
            {isFooterOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Collapsible Content */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isFooterOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-3">
            {/* Performance Overview Bar */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Performance
                </span>
              </div>
              {response.responseTimeMs && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">
                    {formatDuration(response.responseTimeMs)}
                  </span>
                </div>
              )}
            </div>

            {/* Metrics Grid - Creative Layout */}
            <div className="grid grid-cols-2 gap-2">
              {/* Token Usage Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-600">
                      Tokens
                    </span>
                  </div>
                  <TrendingUp className="w-3 h-3 text-gray-400" />
                </div>
                <div className="space-y-1">
                  {response.inputTokens && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Input</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {response.inputTokens.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {response.outputTokens && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Output</span>
                      <span className="text-sm font-semibold text-green-600">
                        {response.outputTokens.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost & Efficiency Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-600">
                      Cost
                    </span>
                  </div>
                  <DollarSign className="w-3 h-3 text-gray-400" />
                </div>
                <div className="space-y-1">
                  {response.cost && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Total</span>
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(response.cost)}
                      </span>
                    </div>
                  )}
                  {response.inputTokens &&
                    response.outputTokens &&
                    response.cost && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Per 1K</span>
                        <span className="text-xs font-medium text-gray-600">
                          {formatCurrency(
                            (response.cost /
                              (response.inputTokens + response.outputTokens)) *
                              1000
                          )}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Efficiency Indicator */}
            {response.inputTokens &&
              response.outputTokens &&
              response.responseTimeMs && (
                <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-2 border border-blue-200/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700">
                        Efficiency
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">Speed:</span>
                        <span className="font-mono font-medium text-blue-600">
                          {Math.round(
                            (response.inputTokens + response.outputTokens) /
                              (response.responseTimeMs / 1000)
                          )}{" "}
                          tok/s
                        </span>
                      </div>
                      <div className="w-px h-3 bg-gray-300"></div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">Ratio:</span>
                        <span className="font-mono font-medium text-purple-600">
                          {response.outputTokens
                            ? (
                                response.outputTokens / response.inputTokens
                              ).toFixed(1)
                            : "0.0"}
                          x
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced error display component with user-friendly error messages.
 */
function ErrorDisplay({ errorMessage }: { errorMessage: string }) {
  const errorInfo = formatError(errorMessage);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getErrorIcon = () => {
    switch (errorInfo.type) {
      case "quota":
        return <DollarSign className="w-12 h-12 text-orange-400 mx-auto" />;
      case "rate_limit":
        return <Clock className="w-12 h-12 text-yellow-400 mx-auto" />;
      case "authentication":
        return <Key className="w-12 h-12 text-red-400 mx-auto" />;
      case "network":
        return <Wifi className="w-12 h-12 text-blue-400 mx-auto" />;
      case "model":
        return <Bot className="w-12 h-12 text-purple-400 mx-auto" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />;
    }
  };

  const getErrorColor = () => {
    switch (errorInfo.type) {
      case "quota":
        return "border-orange-200 bg-orange-50";
      case "rate_limit":
        return "border-yellow-200 bg-yellow-50";
      case "authentication":
        return "border-red-200 bg-red-50";
      case "network":
        return "border-blue-200 bg-blue-50";
      case "model":
        return "border-purple-200 bg-purple-50";
      default:
        return "border-red-200 bg-red-50";
    }
  };

  const handleRetry = () => {
    if (canRetryError(errorMessage)) {
      window.location.reload();
    }
  };

  return (
    <div className={`rounded-lg border p-6 ${getErrorColor()}`}>
      <div className="text-center">
        {getErrorIcon()}
        <h3 className="text-lg font-medium text-gray-900 mt-3 mb-2">
          {errorInfo.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{errorInfo.message}</p>

        {/* Suggestions */}
        {errorInfo.suggestions.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              {showSuggestions ? "Hide" : "Show"} suggestions
            </button>
            {showSuggestions && (
              <div className="mt-3 text-left">
                <ul className="text-xs text-gray-600 space-y-1">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-3">
          {errorInfo.canRetry && (
            <button
              onClick={handleRetry}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Page</span>
          </button>
        </div>
      </div>
    </div>
  );
}
