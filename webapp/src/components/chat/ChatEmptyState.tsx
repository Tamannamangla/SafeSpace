import { Heart } from "lucide-react";

const SUGGESTED_PROMPTS = [
  "Hey Buddy, I'm feeling a bit low today",
  "Can you cheer me up with something nice?",
  "I need someone to talk to right now",
  "Tell me something that'll make me smile",
];

interface ChatEmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

export function ChatEmptyState({ onPromptClick }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/20 mb-5">
        <Heart className="w-6 h-6 text-pink-400" />
      </div>
      <h2 className="text-xl font-semibold text-white/90 mb-2">Hey there, friend!</h2>
      <p className="text-sm text-white/40 mb-10 max-w-sm">
        I'm Buddy — your caring companion. Talk to me about anything. I'm always here to listen.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPromptClick(prompt)}
            className="text-left px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/60 hover:text-white/90 hover:bg-white/[0.07] hover:border-pink-500/20 transition-all duration-150 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
