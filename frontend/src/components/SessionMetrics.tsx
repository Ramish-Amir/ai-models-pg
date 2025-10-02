"use client";

import { TrendingUp, DollarSign, Clock, Zap } from "lucide-react";
import { formatCurrency, formatDuration, formatNumber } from "@/lib/utils";

interface SessionMetricsProps {
  metrics: {
    totalTokens: number;
    totalCost: number;
    averageResponseTime: number;
  };
}

/**
 * Session metrics component displaying performance and cost statistics.
 *
 * This component provides:
 * - Total token usage across all models
 * - Total cost calculation and display
 * - Average response time metrics
 * - Visual indicators and comparisons
 * - Responsive design for different screen sizes
 */
export function SessionMetrics({ metrics }: SessionMetricsProps) {
  const { totalTokens, totalCost, averageResponseTime } = metrics;

  const metricCards = [
    {
      icon: TrendingUp,
      label: "Total Tokens",
      value: formatNumber(totalTokens),
      description: "Across all models",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: DollarSign,
      label: "Total Cost",
      value: formatCurrency(totalCost),
      description: "Estimated cost",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Clock,
      label: "Avg Response Time",
      value: formatDuration(averageResponseTime),
      description: "Per model",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Zap,
      label: "Efficiency",
      value:
        totalTokens > 0
          ? `${((totalTokens / averageResponseTime) * 1000).toFixed(
              1
            )} tokens/sec`
          : "N/A",
      description: "Processing speed",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Session Metrics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg ${metric.bgColor} border border-gray-200`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-white ${metric.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {metric.label}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Insights */}
      {totalTokens > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Insights</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              • Average cost per token:{" "}
              {formatCurrency(totalCost / totalTokens)}
            </p>
            <p>
              • Tokens per second:{" "}
              {formatNumber(totalTokens / (averageResponseTime / 1000))}
            </p>
            <p>
              • Cost efficiency:{" "}
              {formatCurrency(totalCost / (totalTokens / 1000))} per 1K tokens
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
