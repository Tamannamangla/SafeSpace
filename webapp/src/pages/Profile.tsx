import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { api } from "@/lib/api";

interface ReportSummary {
  id: string;
  sessionId: string;
  riskLevel: string;
  wellbeing: number;
  createdAt: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.get<ReportSummary[]>("/api/reports")
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
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
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{user?.name || "—"}</p>
            <p className="text-sm text-white/50">{user?.email}</p>
            <p className="text-xs text-white/30 mt-1">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "—"}
            </p>
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
                <div key={report.id} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-white/80 font-medium">
                      {new Date(report.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                    <p className="text-xs text-white/35">Session #{report.sessionId}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-white/35">Wellbeing</p>
                      <p className="text-sm font-semibold text-white">{report.wellbeing.toFixed(1)}/10</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${riskBadge(report.riskLevel)}`}>
                      {report.riskLevel}
                    </span>
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
