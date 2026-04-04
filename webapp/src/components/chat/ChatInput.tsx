import { useRef, useEffect, useCallback, KeyboardEvent, ChangeEvent } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isChildMode?: boolean;
}

export function ChatInput({ value, onChange, onSend, isLoading, isChildMode }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onTranscript = useCallback(
    (text: string) => {
      onChange(text);
    },
    [onChange]
  );

  const { isListening, isSupported: micSupported, start, stop } =
    useSpeechRecognition(onTranscript);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        if (isListening) stop();
        onSend();
      }
    }
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
  }

  function handleMicToggle() {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }

  function handleSend() {
    if (isListening) stop();
    onSend();
  }

  const canSend = !isLoading && value.trim().length > 0;

  if (isChildMode) {
    return (
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-3"
        style={{ background: "linear-gradient(to top, #fff9c4, #fff9c4ee, transparent)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 rounded-2xl px-4 py-3 shadow-lg"
            style={{ background: "white", border: "3px solid #ff69b4" }}>
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "I'm listening... 👂" : "Tell me how you feel... 💬"}
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none bg-transparent border-0 p-0 text-base placeholder:text-pink-300 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[28px] max-h-[100px] overflow-y-auto leading-7 disabled:opacity-50"
              style={{ fontFamily: "Comic Sans MS, Chalkboard SE, cursive", fontWeight: 600, color: "#333", fontSize: "16px" }}
            />

            {micSupported ? (
              <button
                onClick={handleMicToggle}
                disabled={isLoading}
                className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: isListening ? "#ef5350" : "#e1bee7",
                  color: isListening ? "white" : "#7b1fa2",
                  border: `2px solid ${isListening ? "#c62828" : "#ce93d8"}`,
                }}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            ) : null}

            <button
              onClick={handleSend}
              disabled={!canSend}
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{
                background: canSend ? "linear-gradient(135deg, #ff69b4, #e91e8c)" : "#eee",
                color: canSend ? "white" : "#ccc",
                border: canSend ? "2px solid #e91e8c" : "2px solid #ddd",
                boxShadow: canSend ? "0 2px 0 #c2185b" : "none",
              }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {isListening ? (
            <p className="text-center text-sm font-bold mt-2 flex items-center justify-center gap-2"
              style={{ color: "#ef5350", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Listening... tap to stop! 🎤
            </p>
          ) : (
            <p className="text-center text-sm font-bold mt-2"
              style={{ color: "#ce93d8", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>
              Press Enter to send! 🚀
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-3 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2.5 bg-[#141414] border border-white/[0.09] rounded-2xl px-4 py-3 shadow-2xl focus-within:border-pink-500/40 transition-colors duration-150">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Talk to Buddy..."}
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none bg-transparent border-0 p-0 text-sm text-white/85 placeholder:text-white/25 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[24px] max-h-[160px] overflow-y-auto leading-6 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {micSupported ? (
            <Button
              onClick={handleMicToggle}
              disabled={isLoading}
              size="icon"
              variant="ghost"
              className={`flex-shrink-0 w-8 h-8 rounded-xl transition-all duration-150 shadow-none ${
                isListening
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          ) : null}

          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="icon"
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:bg-white/[0.06] disabled:text-white/20 text-white transition-all duration-150 shadow-none"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>

        {isListening ? (
          <p className="text-center text-[11px] text-red-400/70 mt-2 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Listening… tap mic to stop
          </p>
        ) : (
          <p className="text-center text-[11px] text-white/20 mt-2">
            Press Enter to send · Shift+Enter for newline
          </p>
        )}
      </div>
    </div>
  );
}
