import { Bot, User, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import type { ChatMessage } from "../../../../backend/src/types";

interface ChatBubbleProps {
  message: ChatMessage;
  isLatest: boolean;
  isStreaming: boolean;
}

export function ChatBubble({ message, isLatest, isStreaming }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const { isSpeaking, isSupported: ttsSupported, speak, stop } = useSpeechSynthesis();

  const showSpeaker =
    !isUser && ttsSupported && message.content.length > 0 && !(isLatest && isStreaming);

  function handleSpeakerToggle() {
    if (isSpeaking) {
      stop();
    } else {
      speak(message.content);
    }
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
            : "bg-blue-500/10 border border-blue-500/20"
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-violet-400" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-blue-400" />
        )}
      </div>

      {/* Bubble */}
      <div className={`relative group max-w-[75%] md:max-w-[65%] ${isUser ? "" : ""}`}>
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
            !isUser && isLatest ? <TypingIndicator /> : null
          )}
        </div>

        {showSpeaker ? (
          <Button
            onClick={handleSpeakerToggle}
            size="icon"
            variant="ghost"
            className={`absolute -bottom-1 left-10 w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
              isSpeaking
                ? "text-blue-400 bg-blue-500/15 hover:bg-blue-500/25 hover:text-blue-300 opacity-100"
                : "text-white/30 hover:text-white/60 hover:bg-white/[0.06]"
            }`}
          >
            {isSpeaking ? (
              <VolumeX className="w-3 h-3" />
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
          </Button>
        ) : null}
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
