"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Hash,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { SessionHistoryItem } from "@/types";
// Removed unused imports
import { formatError, canRetryError } from "@/utils/errorHandling";

interface SessionHistoryProps {
  onBack: () => void;
  onLoadSession: (sessionId: string) => void;
}

/**
 * Session history component displaying past comparison sessions.
 *
 * This component provides:
 * - List of previous comparison sessions
 * - Session details and metrics
 * - Search and filtering capabilities
 * - Pagination for large histories
 * - Quick access to session details
 */
export function SessionHistory({ onBack, onLoadSession }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const { getSessionHistory } = useApi();
  const itemsPerPage = 10;

  // Load session history on component mount
  useEffect(() => {
    loadSessionHistory();
  }, []);

  /**
   * Loads session history from the API.
   * Handles initial load and load more functionality.
   */
  const loadSessionHistory = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setSessions([]); // Clear existing sessions for fresh load
      }
      setError(null);

      const offset = isLoadMore ? sessions.length : 0;
      const data = await getSessionHistory(itemsPerPage, offset);

      if (isLoadMore) {
        setSessions((prev) => [...prev, ...data]);
      } else {
        setSessions(data);
      }

      // Check if there are more sessions to load
      setHasMore(data.length === itemsPerPage);
    } catch (err) {
      setError("Failed to load session history");
      console.error("Error loading session history:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /**
   * Loads more sessions when "Load More" button is clicked.
   */
  const handleLoadMore = () => {
    loadSessionHistory(true);
  };

  /**
   * Filters sessions based on search term.
   * Searches through prompts and session IDs.
   */
  const filteredSessions = sessions.filter(
    (session) =>
      session.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Formats a date string for display.
   * Shows relative time for recent sessions.
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Comparison</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Session History
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search sessions by prompt or session ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="text-sm font-medium text-gray-600">
            {filteredSessions.length} session
            {filteredSessions.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-3">
          {loading ? (
            /* Loading State */
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                <span className="ml-3 text-sm font-medium text-gray-600">
                  Loading sessions...
                </span>
              </div>
            </div>
          ) : error ? (
            /* Enhanced Error State */
            <EnhancedErrorDisplay error={error} onRetry={loadSessionHistory} />
          ) : filteredSessions.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Sessions Found
                </h3>
                <p className="text-sm text-gray-500">
                  {searchTerm
                    ? "No sessions match your search criteria."
                    : "Start a new comparison to see your session history here."}
                </p>
              </div>
            </div>
          ) : (
            /* Sessions List */
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
                onClick={() => onLoadSession(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Prompt */}
                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                      {session.prompt}
                    </h3>

                    {/* Session Info Row */}
                    <div className="flex items-center space-x-6 mb-3">
                      {/* Session ID */}
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono text-gray-600">
                          {session.id.slice(0, 8)}...
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center space-x-2">
                        {session.status === "completed" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : session.status === "failed" ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Loader className="w-4 h-4 text-yellow-500 animate-spin" />
                        )}
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {session.status}
                        </span>
                      </div>

                      {/* Response Count */}
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {session.responseCount} response
                          {session.responseCount !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(session.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* View Button */}
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadSession(session.id);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {!loading && !error && filteredSessions.length > 0 && hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed mx-auto transition-all duration-200"
            >
              {loadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  <span>Loading more sessions...</span>
                </>
              ) : (
                <>
                  <span>Load More Sessions</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Enhanced error display component for session history errors.
 */
function EnhancedErrorDisplay({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  const errorInfo = formatError(error);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getErrorIcon = () => {
    switch (errorInfo.type) {
      case "quota":
        return <AlertTriangle className="w-12 h-12 text-orange-400" />;
      case "rate_limit":
        return <Clock className="w-12 h-12 text-yellow-400" />;
      case "authentication":
        return <AlertTriangle className="w-12 h-12 text-red-400" />;
      case "network":
        return <RefreshCw className="w-12 h-12 text-blue-400" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-red-400" />;
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
      default:
        return "border-red-200 bg-red-50";
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-8 ${getErrorColor()}`}
    >
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3">{getErrorIcon()}</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
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
              onClick={onRetry}
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
