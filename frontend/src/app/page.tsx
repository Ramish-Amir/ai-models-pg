"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { PromptInput } from "@/components/PromptInput";
import { ModelComparison } from "@/components/ModelComparison";
import { ModelSelector } from "@/components/ModelSelector";
import { SessionHistory } from "@/components/SessionHistory";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useApi } from "@/hooks/useApi";
import { Model, ComparisonSession } from "@/types";

/**
 * Main page component for the AI Model Playground.
 *
 * This component orchestrates:
 * - Model selection and configuration
 * - Prompt input and submission
 * - Real-time comparison streaming
 * - Session history management
 * - WebSocket connection handling
 */
function HomePageContent() {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [currentSession, setCurrentSession] =
    useState<ComparisonSession | null>(null);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(true);

  const { socket, isConnected, startComparison } = useWebSocket();
  const {
    createComparison,
    getAvailableModels,
    getSessionHistory,
    getComparison,
  } = useApi();

  // Load available models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await getAvailableModels();
        setAvailableModels(models);
        // Select first 2 models by default
        setSelectedModels(models.slice(0, 2).map((m) => m.id));
      } catch (error) {
        console.error("Failed to load models:", error);
      }
    };

    loadModels();
  }, []); // Empty dependency array - only run once on mount

  /**
   * Handles prompt submission and starts a new comparison session.
   * Creates the session and initiates real-time streaming.
   */
  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim() || selectedModels.length === 0) {
      return;
    }

    try {
      const session = await createComparison({
        prompt,
        modelIds: selectedModels,
      });

      setCurrentSession(session);

      // Automatically close model selector when comparison starts
      setIsModelSelectorOpen(false);

      // Join the session room for real-time updates
      if (socket && isConnected) {
        socket.emit("join_session", { sessionId: session.sessionId });

        // Listen for session joined confirmation, then start comparison
        const handleSessionJoined = (data: { sessionId: string }) => {
          if (data.sessionId === session.sessionId) {
            socket.off("session_joined", handleSessionJoined);
            startComparison(session.sessionId, selectedModels);
          }
        };

        socket.on("session_joined", handleSessionJoined);
      }
    } catch (error) {
      console.error("Failed to create comparison:", error);
    }
  };

  /**
   * Handles starting a new comparison session.
   * Resets the current session and prepares for new input.
   */
  const handleNewComparison = () => {
    setCurrentSession(null);
    if (socket && isConnected) {
      // Leave current session if exists
      socket.emit("leave_session", { sessionId: currentSession?.sessionId });
    }
  };

  /**
   * Handles toggling session history view.
   * Resets session state when returning from history to prevent stale data.
   */
  const handleToggleHistory = () => {
    if (showHistory) {
      // Returning from history - reset session state to prevent stale data
      setCurrentSession(null);
    }
    setShowHistory(!showHistory);
  };

  /**
   * Loads a specific session from history and displays it on the main page.
   * Fetches the complete session data including all model responses.
   */
  const handleLoadSession = async (sessionId: string) => {
    try {
      const session = await getComparison(sessionId);
      setCurrentSession(session);
      setShowHistory(false); // Return to main view
      setIsModelSelectorOpen(false); // Close model selector to show the session
    } catch (error) {
      console.error("Failed to load session:", error);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Header onToggleHistory={handleToggleHistory} isConnected={isConnected} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {!showHistory ? (
          <>
            {/* Collapsible Model Selection */}
            <div className="bg-white border-b border-gray-200">
              {/* Model Selector Header - Always Visible */}
              <div className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-sm font-medium text-gray-900">
                    AI Models
                  </h2>
                  {selectedModels.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {selectedModels.length} selected
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isModelSelectorOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span>{isModelSelectorOpen ? "Hide" : "Show"} Models</span>
                </button>
              </div>

              {/* Collapsible Model Selector Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isModelSelectorOpen
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-4">
                  <ModelSelector
                    models={availableModels}
                    selectedModels={selectedModels}
                    onSelectionChange={setSelectedModels}
                    isCollapsed={!isModelSelectorOpen}
                  />
                </div>
              </div>
            </div>

            {/* Model Comparison - Takes up remaining space */}
            <div className="flex-1 overflow-hidden">
              {currentSession ? (
                <ModelComparison
                  session={currentSession}
                  onNewComparison={handleNewComparison}
                  socket={socket}
                  isConnected={isConnected}
                />
              ) : (
                <div className="flex items-center justify-center h-full px-6">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-10 h-10 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Ready to Compare AI Models
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Select models above and enter your prompt below to start
                      comparing responses in real-time
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Prompt Input at Bottom */}
            <div className="bg-white border-t border-gray-200 px-6 py-3 flex-shrink-0">
              <PromptInput
                onSubmit={handlePromptSubmit}
                disabled={selectedModels.length === 0 || !isConnected}
              />
            </div>
          </>
        ) : (
          <SessionHistory
            onBack={() => handleToggleHistory()}
            onLoadSession={handleLoadSession}
          />
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomePageContent />
    </ProtectedRoute>
  );
}
