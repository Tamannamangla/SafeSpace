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
  isChildMode?: boolean;
  isTeenMode?: boolean;
}

export function ChatHeader({ voiceEnabled, onToggleVoice, lang, onChangeLang, isSpeaking, onAnalyze, messagesCount = 0, userName, onSignOut, isChildMode, isTeenMode }: ChatHeaderProps) {
  const navigate = useNavigate();

  if (isTeenMode) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 h-14 border-b shadow-lg"
        style={{ background: "rgba(15,23,42,0.95)", borderColor: "rgba(6,182,212,0.15)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30">
            <span className="text-lg">💪</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white/90">Buddy</span>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>

        <div className="flex items-center gap-3">
          {onAnalyze !== undefined ? (
            <button onClick={onAnalyze} disabled={messagesCount === 0}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                messagesCount > 0
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                  : "bg-white/5 border-white/10 text-white/20 cursor-not-allowed"
              }`}>
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report</span>
            </button>
          ) : null}

          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 text-xs">
            <button onClick={() => onChangeLang("en")}
              className={`px-2 py-1 rounded-md transition-colors ${lang === "en" ? "bg-cyan-500/20 text-cyan-300" : "text-white/40 hover:text-white/70"}`}>
              EN
            </button>
            <button onClick={() => onChangeLang("hi")}
              className={`px-2 py-1 rounded-md transition-colors ${lang === "hi" ? "bg-cyan-500/20 text-cyan-300" : "text-white/40 hover:text-white/70"}`}>
              HI
            </button>
          </div>

          <button onClick={onToggleVoice}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
              voiceEnabled
                ? isSpeaking ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400 animate-pulse" : "bg-white/5 border-cyan-500/20 text-cyan-300/60"
                : "bg-white/5 border-white/10 text-white/20 hover:text-white/40"
            }`}>
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {userName !== undefined ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-xs text-cyan-200/30 max-w-[120px] truncate">{userName}</span>
              {onSignOut !== undefined ? (
                <button onClick={onSignOut}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-white/30 hover:text-white/70 hover:border-white/20 transition-all">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              ) : null}
              <button onClick={() => navigate("/profile")}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400/60 hover:text-cyan-400 hover:border-cyan-500/40 transition-all">
                <User className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      </header>
    );
  }

  if (isChildMode) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 h-16 shadow-md"
        style={{ background: "linear-gradient(135deg, #fff9c4, #fce4ec, #e3f2fd)", borderBottom: "3px solid #ff69b4" }}>
        <div className="flex items-center gap-2">
          <span className="text-3xl">🐻</span>
          <span className="text-xl font-black" style={{ color: "#e91e8c", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>Buddy</span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
        </div>

        <div className="flex items-center gap-2">
          {/* Report button */}
          {onAnalyze !== undefined ? (
            <button
              onClick={onAnalyze}
              disabled={messagesCount === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-black transition-all disabled:opacity-30"
              style={{
                background: messagesCount > 0 ? "#4fc3f7" : "#e0e0e0",
                color: messagesCount > 0 ? "white" : "#999",
                fontFamily: "Comic Sans MS, Chalkboard SE, cursive",
                border: "2px solid " + (messagesCount > 0 ? "#29b6f6" : "#ccc"),
              }}
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </button>
          ) : null}

          {/* Voice toggle */}
          <button
            onClick={onToggleVoice}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all"
            style={{
              background: voiceEnabled ? "#ff69b4" : "white",
              color: voiceEnabled ? "white" : "#999",
              border: "2px solid " + (voiceEnabled ? "#e91e8c" : "#ddd"),
            }}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Sign out */}
          {onSignOut !== undefined ? (
            <button
              onClick={onSignOut}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all"
              style={{ background: "white", border: "2px solid #ddd", color: "#999" }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : null}

          {/* Profile */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all"
            style={{ background: "#e1bee7", border: "2px solid #ce93d8", color: "#7b1fa2" }}
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>
    );
  }

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
