import { Heart, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatBubbleProps {
  message: Message;
  isLatest: boolean;
  isLoading: boolean;
  isChildMode?: boolean;
  isTeenMode?: boolean;
}

export function ChatBubble({ message, isLatest, isLoading, isChildMode, isTeenMode }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const senderLabel = isUser ? "Victim" : "Buddy";
  const timeString = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isTeenMode) {
    return (
      <div className={`flex items-end gap-3 animate-message-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base ${
          isUser ? "bg-cyan-500/20 border border-cyan-500/30" : "bg-teal-500/15 border border-teal-500/25"
        }`}>
          {isUser ? "😎" : "💪"}
        </div>

        <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
          <span className="text-[11px] text-cyan-200/30 px-1">{senderLabel}</span>

          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? "bg-gradient-to-br from-cyan-600 to-teal-600 text-white rounded-br-sm shadow-lg shadow-cyan-900/30"
              : "bg-white/[0.06] border border-cyan-500/10 text-white/85 rounded-bl-sm"
          }`}>
            {message.content !== "" ? (
              message.content
            ) : (
              !isUser && isLatest && isLoading ? <TeenTypingIndicator /> : null
            )}
          </div>

          <span className="text-[10px] text-cyan-200/20 px-1">{timeString}</span>
        </div>
      </div>
    );
  }

  if (isChildMode) {
    return (
      <div className={`flex items-end gap-3 animate-message-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-2xl"
          style={{ background: isUser ? "#e1bee7" : "#fff9c4", border: `3px solid ${isUser ? "#ce93d8" : "#fdd835"}` }}>
          {isUser ? "😊" : "🐻"}
        </div>

        {/* Bubble + meta */}
        <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
          <span className="text-xs font-black px-1" style={{ color: isUser ? "#7b1fa2" : "#f57f17", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>
            {senderLabel}
          </span>

          <div className="px-4 py-3 rounded-3xl text-base leading-relaxed whitespace-pre-wrap break-words shadow-md"
            style={{
              background: isUser
                ? "linear-gradient(135deg, #ce93d8, #ba68c8)"
                : "white",
              color: isUser ? "white" : "#333",
              fontFamily: "Comic Sans MS, Chalkboard SE, cursive",
              fontWeight: 600,
              fontSize: "16px",
              border: isUser ? "none" : "3px solid #fff176",
              borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
            }}>
            {message.content !== "" ? (
              message.content
            ) : (
              !isUser && isLatest && isLoading ? <ChildTypingIndicator /> : null
            )}
          </div>

          <span className="text-xs font-bold px-1" style={{ color: "#999", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>{timeString}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-end gap-3 animate-message-in ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-violet-500/20 border border-violet-500/30"
            : "bg-pink-500/10 border border-pink-500/20"
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-violet-400" />
        ) : (
          <Heart className="w-3.5 h-3.5 text-pink-400" />
        )}
      </div>

      {/* Bubble + meta */}
      <div className={`flex flex-col gap-1 max-w-[75%] md:max-w-[65%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Sender label */}
        <span className="text-[11px] text-white/30 px-1">{senderLabel}</span>

        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? "bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-br-sm shadow-lg shadow-violet-900/30"
              : "bg-[#141414] border border-white/[0.08] text-white/85 rounded-bl-sm"
          }`}
        >
          {message.content !== "" ? (
            message.content
          ) : (
            !isUser && isLatest && isLoading ? <TypingIndicator /> : null
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-white/20 px-1">{timeString}</span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <span className="flex items-center gap-1 h-4">
      <span className="w-1.5 h-1.5 rounded-full bg-white/40 block animate-typing-dot" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-white/40 block animate-typing-dot" style={{ animationDelay: "200ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-white/40 block animate-typing-dot" style={{ animationDelay: "400ms" }} />
    </span>
  );
}

function ChildTypingIndicator() {
  return (
    <span className="flex items-center gap-2 h-6">
      <span className="w-3 h-3 rounded-full block animate-typing-dot" style={{ animationDelay: "0ms", background: "#ff69b4" }} />
      <span className="w-3 h-3 rounded-full block animate-typing-dot" style={{ animationDelay: "200ms", background: "#fdd835" }} />
      <span className="w-3 h-3 rounded-full block animate-typing-dot" style={{ animationDelay: "400ms", background: "#4fc3f7" }} />
    </span>
  );
}

function TeenTypingIndicator() {
  return (
    <span className="flex items-center gap-1.5 h-5">
      <span className="w-2 h-2 rounded-full bg-cyan-400/50 block animate-typing-dot" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 rounded-full bg-teal-400/50 block animate-typing-dot" style={{ animationDelay: "200ms" }} />
      <span className="w-2 h-2 rounded-full bg-blue-400/50 block animate-typing-dot" style={{ animationDelay: "400ms" }} />
    </span>
  );
}
