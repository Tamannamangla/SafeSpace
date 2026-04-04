import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, TrendingUp, AlertTriangle, Pencil, Check, X, Eye, Brain, Activity } from "lucide-react";
import { useSession, signOut, authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ReportSummary {
  id: string;
  sessionId: string;
  riskLevel: string;
  wellbeing: number;
  createdAt: string;
}

interface EmotionNode {
  name: string;
  count: number;
  avgIntensity: number;
}

interface TriggerNode {
  name: string;
  count: number;
}

interface EmotionLink {
  emotion: string;
  trigger: string;
  count: number;
}

interface RecentEvent {
  id: string;
  emotion: string;
  trigger: string;
  event: string;
  intensity: number;
  createdAt: string;
}

interface EmotionalData {
  emotions: EmotionNode[];
  triggers: TriggerNode[];
  links: EmotionLink[];
  recentEvents: RecentEvent[];
  totalMemories: number;
}

const EMOTION_COLORS: Record<string, string> = {
  anxiety: "#f59e0b",
  sadness: "#3b82f6",
  joy: "#10b981",
  fear: "#8b5cf6",
  anger: "#ef4444",
  guilt: "#f97316",
  shame: "#ec4899",
  loneliness: "#6366f1",
  hope: "#06b6d4",
  frustration: "#f43f5e",
  grief: "#64748b",
  confusion: "#a855f7",
};

function getEmotionColor(emotion: string): string {
  return EMOTION_COLORS[emotion] ?? "#94a3b8";
}

export default function Profile() {
  const navigate = useNavigate();
  const { data: session, refetch } = useSession();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [emotionalData, setEmotionalData] = useState<EmotionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<ReportSummary[]>("/api/reports").catch(() => [] as ReportSummary[]),
      api.get<EmotionalData>("/api/emotions").catch(() => null),
    ]).then(([r, e]) => {
      setReports(r);
      setEmotionalData(e);
      setLoading(false);
    });
  }, []);

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

  const avgWellbeing = reports.length
    ? (reports.reduce((s, r) => s + r.wellbeing, 0) / reports.length).toFixed(1)
    : "—";

  const highestRisk = reports.length
    ? (["critical", "high", "medium", "low"].find(lvl => reports.some(r => r.riskLevel === lvl)) ?? "—")
    : "—";

  function riskBadge(level: string) {
    const map: Record<string, string> = {
      low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
      high: "text-orange-400 bg-orange-500/10 border-orange-500/30",
      critical: "text-red-400 bg-red-500/10 border-red-500/30",
    };
    return map[level] ?? "text-white/40 bg-white/5 border-white/10";
  }

  function startEditName() {
    setNameInput(user?.name ?? "");
    setEditingName(true);
  }

  async function saveName() {
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      await authClient.updateUser({ name: nameInput.trim() });
      await refetch();
      setEditingName(false);
    } catch {
      // silent
    } finally {
      setSavingName(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </button>
        <button
          onClick={() => signOut().then(() => navigate("/login", { replace: true }))}
          className="text-xs text-white/30 hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* User card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your name"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 focus:ring-violet-500/20 h-9 text-sm"
                  />
                  <button
                    onClick={saveName}
                    disabled={savingName || !nameInput.trim()}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all disabled:opacity-40"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-white truncate">{user?.name || "No name set"}</p>
                  <button
                    onClick={startEditName}
                    className="flex items-center justify-center w-6 h-6 rounded-md text-white/25 hover:text-violet-400 hover:bg-violet-500/10 transition-all flex-shrink-0"
                    title="Edit name"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
              <p className="text-sm text-white/50 mt-0.5">{user?.email}</p>
              <p className="text-xs text-white/30 mt-1">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Reports", value: String(reports.length), icon: FileText, color: "text-cyan-400" },
            { label: "Avg Wellbeing", value: String(avgWellbeing), icon: TrendingUp, color: "text-emerald-400" },
            { label: "Highest Risk", value: String(highestRisk), icon: AlertTriangle, color: "text-orange-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 flex flex-col items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <p className="text-xl font-bold text-white capitalize">{value}</p>
              <p className="text-[10px] text-white/35 text-center">{label}</p>
            </div>
          ))}
        </div>

        {/* Emotional Memory Graph */}
        {emotionalData && emotionalData.totalMemories > 0 ? (
          <div>
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-violet-400/70 mb-3 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" />
              Emotional Memory
            </h2>

            {/* Emotion nodes */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 space-y-4">
              {/* Emotion bubbles */}
              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Detected Emotions</p>
                <div className="flex flex-wrap gap-2">
                  {emotionalData.emotions.map((e) => (
                    <div
                      key={e.name}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all"
                      style={{
                        backgroundColor: `${getEmotionColor(e.name)}10`,
                        borderColor: `${getEmotionColor(e.name)}30`,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getEmotionColor(e.name) }}
                      />
                      <span className="text-xs font-medium capitalize" style={{ color: getEmotionColor(e.name) }}>
                        {e.name}
                      </span>
                      <span className="text-[10px] text-white/30">{e.count}x</span>
                      <span className="text-[10px] text-white/20">avg {e.avgIntensity}/10</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relationship links: emotion → trigger */}
              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Patterns (emotion → trigger)</p>
                <div className="space-y-2">
                  {emotionalData.links
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 8)
                    .map((link, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="capitalize font-medium" style={{ color: getEmotionColor(link.emotion) }}>
                          {link.emotion}
                        </span>
                        <span className="text-white/15">→</span>
                        <span className="text-white/50 capitalize">{link.trigger}</span>
                        <div className="flex-1 h-1 bg-white/[0.03] rounded-full overflow-hidden ml-1">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (link.count / Math.max(...emotionalData.links.map(l => l.count))) * 100)}%`,
                              backgroundColor: getEmotionColor(link.emotion),
                              opacity: 0.5,
                            }}
                          />
                        </div>
                        <span className="text-white/20 text-[10px] w-6 text-right">{link.count}x</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent emotional events */}
              {emotionalData.recentEvents.length > 0 ? (
                <div>
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Recent Emotional Events</p>
                  <div className="space-y-2">
                    {emotionalData.recentEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                          <Activity className="w-3 h-3" style={{ color: getEmotionColor(event.emotion) }} />
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                            style={{
                              color: getEmotionColor(event.emotion),
                              backgroundColor: `${getEmotionColor(event.emotion)}10`,
                              borderColor: `${getEmotionColor(event.emotion)}30`,
                            }}
                          >
                            {event.emotion}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/55 leading-relaxed">{event.event}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-white/25 capitalize">trigger: {event.trigger}</span>
                            <span className="text-[10px] text-white/25">intensity: {event.intensity}/10</span>
                            <span className="text-[10px] text-white/15">
                              {new Date(event.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Reports list */}
        <div>
          <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-cyan-400/70 mb-3">Past Reports</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500" />
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-8 text-center">
              <FileText className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40">No reports yet</p>
              <p className="text-xs text-white/25 mt-1">Generate a report from a chat session to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-sm text-white/80 font-medium">
                        {new Date(report.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                      <p className="text-xs text-white/35">Session #{report.sessionId}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-white/35">Wellbeing</p>
                        <p className="text-sm font-semibold text-white">{report.wellbeing.toFixed(1)}/10</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${riskBadge(report.riskLevel)}`}>
                        {report.riskLevel}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/report/${report.id}`)}
                      className="h-8 text-xs text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/10 gap-1.5 px-2"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Full Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
