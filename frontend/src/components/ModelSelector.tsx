"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Info,
  Brain,
  DollarSign,
  Clock,
  Calendar,
  Database,
  Building2,
} from "lucide-react";
import { Model } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";

interface ModelSelectorProps {
  models: Model[];
  selectedModels: string[];
  onSelectionChange: (modelIds: string[]) => void;
  isCollapsed?: boolean;
}

/**
 * Model selector component for choosing AI models to compare.
 *
 * This component provides:
 * - Multi-select model selection
 * - Model information display (pricing, provider)
 * - Visual selection indicators
 * - Responsive design for different screen sizes
 */
export function ModelSelector({
  models,
  selectedModels,
  onSelectionChange,
  isCollapsed = false,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Mock data for testing - remove this when backend provides real data
  const modelsWithMockData = models.map((model) => ({
    ...model,
    // Add mock technical data for testing
    contextWindow:
      model.contextWindow ||
      (model.name.includes("GPT-4")
        ? 128
        : model.name.includes("Claude")
        ? 200
        : 32),
    modelSize:
      model.modelSize ||
      (model.name.includes("GPT-4")
        ? 175
        : model.name.includes("Claude")
        ? 100
        : 70),
    trainingCutoff:
      model.trainingCutoff ||
      (model.name.includes("GPT-4")
        ? "April 2024"
        : model.name.includes("Claude")
        ? "April 2024"
        : "October 2023"),
  }));

  /**
   * Gets the appropriate icon and styling for a provider.
   */
  const getProviderInfo = (provider: string) => {
    const providerLower = provider.toLowerCase();
    if (providerLower.includes("openai")) {
      return {
        icon: <Brain className="w-3 h-3" />,
        color: "text-green-700 bg-green-50 border-green-200",
        name: "OpenAI",
      };
    } else if (providerLower.includes("anthropic")) {
      return {
        icon: <Building2 className="w-3 h-3" />,
        color: "text-orange-700 bg-orange-50 border-orange-200",
        name: "Anthropic",
      };
    } else if (providerLower.includes("google")) {
      return {
        icon: <Brain className="w-3 h-3" />,
        color: "text-blue-700 bg-blue-50 border-blue-200",
        name: "Google",
      };
    } else {
      return {
        icon: <Building2 className="w-3 h-3" />,
        color: "text-gray-700 bg-gray-50 border-gray-200",
        name: provider,
      };
    }
  };

  const handleModelToggle = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      onSelectionChange(selectedModels.filter((id) => id !== modelId));
    } else {
      onSelectionChange([...selectedModels, modelId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedModels.length === models.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(models.map((m) => m.id));
    }
  };

  return (
    <div className="w-full">
      {/* Select All Button */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-xs text-gray-500">Choose AI models to compare</p>
        </div>
        <button
          onClick={handleSelectAll}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
        >
          {selectedModels.length === models.length
            ? "Deselect All"
            : "Select All"}
        </button>
      </div>

      {/* Horizontal scrollable model cards */}
      <div className="flex space-x-4 overflow-x-auto pb-3 scrollbar-hide">
        {modelsWithMockData.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          const providerInfo = getProviderInfo(model.provider);

          return (
            <div
              key={model.id}
              className={cn(
                "relative flex-shrink-0 w-80 p-3 border-2 rounded-lg cursor-pointer transition-colors duration-200",
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
              onClick={() => handleModelToggle(model.id)}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}

              {/* Model Header */}
              <div className="mb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base truncate mb-1">
                      {model.name}
                    </h3>
                    <div
                      className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border",
                        providerInfo.color
                      )}
                    >
                      <span>{providerInfo.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 rounded-md p-2">
                {/* Technical Specifications */}
                {(model.contextWindow ||
                  model.modelSize ||
                  model.trainingCutoff) && (
                  <div className="mb-1 space-y-0.5">
                    {model.contextWindow && (
                      <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md">
                        <div className="flex items-center space-x-1.5">
                          <Database className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700">
                            Context Window
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-900">
                          {model.contextWindow.toLocaleString()}K
                        </span>
                      </div>
                    )}
                    {model.modelSize && (
                      <div className="flex items-center justify-between py-1.5 px-2.5  rounded-md">
                        <div className="flex items-center space-x-1.5">
                          <Brain className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700">
                            Model Size
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-900">
                          {model.modelSize}B parameters
                        </span>
                      </div>
                    )}
                    {model.trainingCutoff && (
                      <div className="flex items-center justify-between py-1.5 px-2.5  rounded-md">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700">
                            Training Data
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-900">
                          {model.trainingCutoff}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing Information */}
                {model.pricing && (
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md">
                      <div className="flex items-center space-x-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">
                          Input Cost
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">
                        {formatCurrency(model.pricing.input)}/1K
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md">
                      <div className="flex items-center space-x-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">
                          Output Cost
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">
                        {formatCurrency(model.pricing.output)}/1K
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {models.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Brain className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No Models Available
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            There are no AI models available for comparison at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
