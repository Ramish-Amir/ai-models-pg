"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Prompt input component for entering questions and prompts.
 *
 * This component provides:
 * - Multi-line text input with auto-resize
 * - Submit button with loading states
 * - Keyboard shortcuts (Ctrl+Enter to submit)
 * - Character count and validation
 * - Responsive design
 */
export function PromptInput({
  onSubmit,
  disabled = false,
  placeholder = "Enter your prompt here...",
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = async () => {
    if (!prompt.trim() || disabled || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(prompt.trim());
      setPrompt(""); // Clear input after successful submission
    } catch (error) {
      console.error("Failed to submit prompt:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isSubmitDisabled = !prompt.trim() || disabled || isSubmitting;

  return (
    <div className="w-full">
      <div className="flex items-center space-x-2">
        {/* Text Input */}
        <div className="w-full relative flex items-start justify-center">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSubmitting}
            maxLength={10000}
            className={cn(
              "w-full px-3 py-2 pr-10 border border-gray-300 rounded-md resize-none",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
              "transition-colors duration-200"
            )}
            rows={1}
            style={{ maxHeight: "100px" }}
          />

          {/* Character count indicator */}
          {/* {prompt.length > 8000 && (
            <div className="absolute bottom-1 right-10 text-xs text-amber-600">
              {10000 - prompt.length}
            </div>
          )} */}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-md font-medium transition-all duration-200",
            isSubmitDisabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          )}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
