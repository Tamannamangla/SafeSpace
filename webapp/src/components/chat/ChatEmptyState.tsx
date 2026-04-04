import { Heart } from "lucide-react";

const SUGGESTED_PROMPTS = [
  "Hey Buddy, I'm feeling a bit low today",
  "Can you cheer me up with something nice?",
  "I need someone to talk to right now",
  "Tell me something that'll make me smile",
];

const CHILD_PROMPTS = [
  "I feel sad today 😢",
  "I had a bad day 😞",
  "I'm scared 😰",
  "Can you make me happy? 😊",
];

interface ChatEmptyStateProps {
  onPromptClick: (prompt: string) => void;
  isChildMode?: boolean;
}

export function ChatEmptyState({ onPromptClick, isChildMode }: ChatEmptyStateProps) {
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
