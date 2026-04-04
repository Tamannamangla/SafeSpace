import { Sparkles } from "lucide-react";

const SUGGESTED_PROMPTS = [
  "Explain quantum computing in simple terms",
  "Write a short poem about the ocean",
  "What are the best practices for React?",
  "Help me plan a 7-day trip to Japan",
];

interface ChatEmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

export function ChatEmptyState({ onPromptClick }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 mb-5">
        <Sparkles className="w-6 h-6 text-violet-400" />
      </div>
      <h2 className="text-xl font-semibold text-white/90 mb-2">How can I help you?</h2>
      <p className="text-sm text-white/40 mb-10 max-w-sm">
        Ask me anything — I'm here to help with writing, coding, analysis, and more.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPromptClick(prompt)}
            className="text-left px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/60 hover:text-white/90 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all duration-150 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
