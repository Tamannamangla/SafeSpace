import { Bot, Sparkles } from "lucide-react";

export function ChatHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 h-14 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30">
          <Bot className="w-4 h-4 text-violet-400" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-white/90">AI Chat</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-white/30">
        <Sparkles className="w-3 h-3" />
        <span>Powered by Claude</span>
      </div>
    </header>
  );
}
