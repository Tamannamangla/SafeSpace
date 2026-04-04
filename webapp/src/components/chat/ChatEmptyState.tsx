import { Heart } from "lucide-react";

const SUGGESTED_PROMPTS = [
  "I want to report an incident that happened to me",
  "I need legal guidance about something I experienced",
  "Someone hurt me and I don't know what to do next",
  "I have evidence of a crime and need help",
];

const CHILD_PROMPTS = [
  "I feel sad today 😢",
  "I had a bad day 😞",
  "I'm scared 😰",
  "Can you make me happy? 😊",
];

const TEEN_PROMPTS = [
  "Something bad happened to me and I need help",
  "Someone did something wrong to me",
  "I want to tell someone what happened",
  "I don't feel safe and need to talk about it",
];

interface ChatEmptyStateProps {
  onPromptClick: (prompt: string) => void;
  isChildMode?: boolean;
  isTeenMode?: boolean;
}

export function ChatEmptyState({ onPromptClick, isChildMode, isTeenMode }: ChatEmptyStateProps) {
  if (isTeenMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 mb-5">
          <span className="text-3xl">💪</span>
        </div>
        <h2 className="text-xl font-semibold text-white/90 mb-2">Hey, I'm Buddy — Your Safe Space</h2>
        <p className="text-sm text-cyan-200/50 mb-10 max-w-sm">
          I'm here to listen and help you share what happened. Take your time, you're safe here. 💙
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
          {TEEN_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onPromptClick(prompt)}
              className="text-left px-4 py-3.5 rounded-xl bg-white/[0.04] border border-cyan-500/15 text-sm text-cyan-100/60 hover:text-cyan-100/90 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all duration-150 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isChildMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
        <div className="text-7xl mb-4 animate-bounce" style={{ animationDuration: "2s" }}>🐻</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: "#e91e8c", fontFamily: "Comic Sans MS, Chalkboard SE, cursive", textShadow: "1px 1px 0 #ff69b4" }}>
          Hi there! I'm Buddy!
        </h2>
        <p className="text-lg font-bold mb-8 max-w-sm" style={{ color: "#7b1fa2", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>
          I'm your friend! You can tell me anything! 💜
        </p>
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {CHILD_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onPromptClick(prompt)}
              className="text-center px-4 py-4 rounded-2xl text-base font-black transition-all duration-150 cursor-pointer shadow-md active:scale-95"
              style={{
                background: "white",
                border: "3px solid #ff69b4",
                color: "#7b1fa2",
                fontFamily: "Comic Sans MS, Chalkboard SE, cursive",
                fontSize: "15px",
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="mt-6 flex gap-3 text-3xl">
          <span className="animate-bounce" style={{ animationDelay: "0s", animationDuration: "1.5s" }}>⭐</span>
          <span className="animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "1.5s" }}>🌈</span>
          <span className="animate-bounce" style={{ animationDelay: "0.6s", animationDuration: "1.5s" }}>🦋</span>
          <span className="animate-bounce" style={{ animationDelay: "0.9s", animationDuration: "1.5s" }}>🎈</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/20 mb-5">
        <Heart className="w-6 h-6 text-pink-400" />
      </div>
      <h2 className="text-xl font-semibold text-white/90 mb-2">Buddy — Your Support Companion</h2>
      <p className="text-sm text-white/40 mb-10 max-w-sm">
        I'm here to help you document and understand your situation. Everything you share is important.
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
