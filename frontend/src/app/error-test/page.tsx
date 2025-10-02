"use client";

import { useState } from "react";
import { ModelResponseCard } from "@/components/ModelResponseCard";
import { ModelResponse } from "@/types";

/**
 * Test page for demonstrating improved error handling.
 * This page shows how different error types are displayed with user-friendly messages.
 */
export default function ErrorTestPage() {
  const [selectedError, setSelectedError] = useState<string>("");

  const errorExamples = [
    {
      id: "quota",
      title: "API Quota Exceeded",
      message:
        "429 You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors. Troubleshooting URL: https://js.langchain.com/docs/troubleshooting/errors/MODEL_RATE_LIMIT/",
    },
    {
      id: "rate_limit",
      title: "Rate Limit Exceeded",
      message:
        "Rate limit exceeded. Too many requests in a short period of time.",
    },
    {
      id: "authentication",
      title: "Authentication Error",
      message: "401 Unauthorized. Invalid API key provided.",
    },
    {
      id: "network",
      title: "Network Error",
      message: "Network error: Connection timeout after 30 seconds.",
    },
    {
      id: "model",
      title: "Model Error",
      message: "Model 'gpt-4' is not available or has been deprecated.",
    },
    {
      id: "unknown",
      title: "Unknown Error",
      message: "An unexpected error occurred while processing your request.",
    },
  ];

  const mockResponse: ModelResponse = {
    id: "mock-response-id",
    modelId: "gpt-3.5-turbo",
    provider: "openai",
    response: "",
    status: "error",
    errorMessage: selectedError,
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Error Handling Test
          </h1>
          <p className="text-gray-600">
            This page demonstrates the improved error handling system. Select an
            error type to see how it's displayed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Error Type Selector */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Select Error Type
            </h2>
            <div className="space-y-2">
              {errorExamples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => setSelectedError(example.message)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedError === example.message
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {example.title}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {example.message.substring(0, 100)}...
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Error Display
            </h2>
            {selectedError ? (
              <ModelResponseCard
                response={mockResponse}
                onChunk={() => {}}
                onComplete={() => {}}
                onError={() => {}}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="text-gray-500">
                  Select an error type to see how it's displayed
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features List */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Improved Error Handling Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">
                User-Friendly Messages
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Clear, non-technical error descriptions</li>
                <li>• Contextual titles and explanations</li>
                <li>• Removes technical jargon and URLs</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Visual Improvements</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Color-coded error types</li>
                <li>• Appropriate icons for each error</li>
                <li>• Professional styling and layout</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Helpful Actions</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Contextual retry buttons</li>
                <li>• Actionable suggestions</li>
                <li>• Smart retry logic</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Error Categories</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Quota exceeded (billing issues)</li>
                <li>• Rate limits (temporary)</li>
                <li>• Authentication (API keys)</li>
                <li>• Network (connectivity)</li>
                <li>• Model (availability)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
