import { useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
}

export function ChatInput({ value, onChange, onSend, isStreaming }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      if (!isStreaming && value.trim()) {
        onSend();
      }
    }
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
  }

  const canSend = !isStreaming && value.trim().length > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-3 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2.5 bg-[#141414] border border-white/[0.09] rounded-2xl px-4 py-3 shadow-2xl focus-within:border-violet-500/40 transition-colors duration-150">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message AI Chat…"
            disabled={isStreaming}
            rows={1}
            className="flex-1 resize-none bg-transparent border-0 p-0 text-sm text-white/85 placeholder:text-white/25 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[24px] max-h-[160px] overflow-y-auto leading-6 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            onClick={onSend}
            disabled={!canSend}
            size="icon"
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-white/[0.06] disabled:text-white/20 text-white transition-all duration-150 shadow-none"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
        <p className="text-center text-[11px] text-white/20 mt-2">
          Press Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
