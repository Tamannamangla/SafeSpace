import { BarChart2, Heart, LogOut, User, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { VoiceLang } from "@/hooks/useVoice";

interface ChatHeaderProps {
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  lang: VoiceLang;
  onChangeLang: (lang: VoiceLang) => void;
  isSpeaking: boolean;
  onAnalyze?: () => void;
  messagesCount?: number;
  userName?: string;
  onSignOut?: () => void;
}

export function ChatHeader({ voiceEnabled, onToggleVoice, lang, onChangeLang, isSpeaking, onAnalyze, messagesCount = 0, userName, onSignOut }: ChatHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 h-14 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/30">
          <Heart className="w-4 h-4 text-pink-400" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-white/90">Buddy</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Generate Report button */}
        {onAnalyze !== undefined ? (
          <button
            onClick={onAnalyze}
            disabled={messagesCount === 0}
            title="Generate psychological report"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              messagesCount > 0
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                : "bg-white/5 border-white/10 text-white/20 cursor-not-allowed"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Generate Report</span>
          </button>
        ) : null}

        {/* Language toggle */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 text-xs">
          <button
            onClick={() => onChangeLang("en")}
            className={`px-2 py-1 rounded-md transition-colors ${
              lang === "en" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onChangeLang("hi")}
            className={`px-2 py-1 rounded-md transition-colors ${
              lang === "hi" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            HI
          </button>
        </div>

        {/* Voice toggle */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? "Mute voice" : "Enable voice"}
          className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
            voiceEnabled
              ? isSpeaking
                ? "bg-pink-500/20 border-pink-500/40 text-pink-400 animate-pulse"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white/90"
              : "bg-white/5 border-white/10 text-white/20 hover:text-white/40"
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Online indicator */}
        <div className="flex items-center gap-1.5 text-xs text-white/30">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Online</span>
        </div>

        {/* User + sign out */}
        {userName !== undefined ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-white/30 max-w-[120px] truncate">{userName}</span>
            {onSignOut !== undefined ? (
              <button
                onClick={onSignOut}
                title="Sign out"
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-white/30 hover:text-white/70 hover:border-white/20 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <button
              onClick={() => navigate("/profile")}
              title="View profile"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-white/30 hover:text-violet-400 hover:border-violet-500/30 transition-all"
            >
              <User className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
