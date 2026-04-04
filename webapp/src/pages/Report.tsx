import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ArrowLeft, Download, Loader2, AlertTriangle, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

// --- Local types ---
interface AnalysisMessage {
  role: string;
  content: string;
}

interface IdentifiedIssue {
  name: string;
  severity: number;
  description: string;
  category: string;
}

interface EmotionalPattern {
  emotion: string;
  percentage: number;
  color: string;
}

interface DimensionScores {
  anxiety: number;
  depression: number;
  stress: number;
  trauma: number;
  socialIsolation: number;
  selfEsteem: number;
}

interface AnalysisReport {
  patientSummary: string;
  sessionNotes: string[];
  identifiedIssues: IdentifiedIssue[];
  emotionalPatterns: EmotionalPattern[];
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendations: string[];
  followUpActions: string[];
  diagnosisInsights: string;
  overallWellbeingScore: number;
  dimensionScores: DimensionScores;
}

// --- Helpers ---
function randomHex(len: number): string {
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function riskColors(level: AnalysisReport["riskLevel"]) {
  const map = {
    low: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
    medium: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" },
    high: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
    critical: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
  };
  return map[level];
}

function severityColor(s: number): string {
  if (s <= 3) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (s <= 6) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  return "text-red-400 bg-red-500/10 border-red-500/30";
}

function wellbeingColor(s: number): string {
  if (s > 6) return "text-emerald-400";
  if (s >= 4) return "text-yellow-400";
  return "text-red-400";
}

function wellbeingBarColor(s: number): string {
  if (s > 6) return "bg-emerald-500";
  if (s >= 4) return "bg-yellow-500";
  return "bg-red-500";
}

// --- Subcomponents ---
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-cyan-400/70 mb-3">
      {children}
    </h2>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.03] border border-white/8 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

// --- Main Component ---
export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: reportId } = useParams<{ id: string }>();
  const reportRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>(() => randomHex(8));
  const [reportDate, setReportDate] = useState<string>(() =>
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  );

  useEffect(() => {
    // If we have a report ID in the URL, load saved report from backend
    if (reportId) {
      api.get<{ id: string; sessionId: string; reportData: AnalysisReport; createdAt: string }>(`/api/reports/${reportId}`)
        .then((saved) => {
          setReport(saved.reportData);
          setSessionId(saved.sessionId);
          setReportDate(new Date(saved.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }));
        })
        .catch(() => {
          setError("Could not load this report. It may have been deleted.");
        })
        .finally(() => setLoading(false));
      return;
    }

    // Otherwise, generate a new report from chat messages
    let messages: AnalysisMessage[] | null = null;

    const stateMessages = (location.state as { messages?: AnalysisMessage[] } | null)?.messages;
    if (stateMessages && stateMessages.length > 0) {
      messages = stateMessages;
    } else {
      const stored = localStorage.getItem("chatMessages");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as AnalysisMessage[];
          if (parsed.length > 0) messages = parsed;
        } catch {
          // ignore parse errors
        }
      }
    }

    if (!messages) {
      setError("No conversation to analyze. Please have a chat session first.");
      setLoading(false);
      return;
    }

    async function fetchReport() {
      try {
        const data = await api.post<AnalysisReport>("/api/analyze", { messages });
        setReport(data);
        // Save report to backend
        api.post("/api/reports", {
          sessionId,
          reportData: data,
          riskLevel: data.riskLevel,
          wellbeing: data.overallWellbeingScore,
        }).catch(() => {/* silent fail - don't block the UI */});
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to analyze conversation.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    void fetchReport();
  }, [location.state, reportId]);

  async function downloadPDF() {
    if (!reportRef.current) return;
    setDownloadingPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#0a0a0a",
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`psychological-report-${Date.now()}.pdf`);
    } finally {
      setDownloadingPdf(false);
    }
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-5">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-white/80 font-medium text-sm tracking-wide">Analyzing conversation...</p>
          <p className="text-white/30 text-xs mt-1">Generating psychological assessment</p>
        </div>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-5 px-6">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20">
          <FileWarning className="w-6 h-6 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-white/80 font-medium text-sm">{error}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="border-white/10 text-white/60 hover:text-white bg-transparent"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Chat
        </Button>
      </div>
    );
  }

  if (!report) return null;

  const { riskLevel } = report;
  const risk = riskColors(riskLevel);

  // Radar data
  const radarData = [
    { subject: "Anxiety", value: report.dimensionScores.anxiety },
    { subject: "Depression", value: report.dimensionScores.depression },
    { subject: "Stress", value: report.dimensionScores.stress },
    { subject: "Trauma", value: report.dimensionScores.trauma },
    { subject: "Isolation", value: report.dimensionScores.socialIsolation },
    { subject: "Self-Esteem", value: report.dimensionScores.selfEsteem },
  ];

  // Bar data
  const barData = report.identifiedIssues.map((issue) => ({
    name: issue.name.length > 16 ? issue.name.slice(0, 14) + "…" : issue.name,
    severity: issue.severity,
  }));

  const wellbeingPct = (report.overallWellbeingScore / 10) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 h-14 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
        <button
          onClick={() => navigate(reportId ? "/profile" : "/")}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {reportId ? "Back to Profile" : "Back to Chat"}
        </button>
        <Button
          onClick={downloadPDF}
          disabled={downloadingPdf}
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-500 text-white border-0 gap-1.5 text-xs"
        >
          {downloadingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          {downloadingPdf ? "Generating…" : "Download PDF Report"}
        </Button>
      </div>

      {/* Report body */}
      <div ref={reportRef} className="bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="border-b border-white/8 pb-7">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-5 rounded-full bg-cyan-500" />
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-400/70">
                    Confidential Clinical Document
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Psychological Assessment Report
                </h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-xs text-white/35">
                  <span>Date: {reportDate}</span>
                  <span>Session ID: #{sessionId}</span>
                  <span>Generated by AI Clinical Analysis</span>
                </div>
              </div>
              <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border ${risk.bg} ${risk.border}`}>
                <AlertTriangle className={`w-3.5 h-3.5 ${risk.text}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${risk.text}`}>
                  {riskLevel} Risk
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Patient Summary */}
          <div>
            <SectionTitle>01 — Patient Summary</SectionTitle>
            <Card className="space-y-4">
              <p className="text-white/70 text-sm leading-relaxed">{report.patientSummary}</p>
              {report.sessionNotes.length > 0 && (
                <div className="border-t border-white/5 pt-4">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Session Notes</p>
                  <ul className="space-y-2">
                    {report.sessionNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan-500/60 flex-shrink-0" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>

          {/* Section 2: Wellbeing Score + Radar */}
          <div>
            <SectionTitle>02 — Overall Wellbeing</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="flex flex-col items-center justify-center gap-4">
                <div className="text-center">
                  <span className={`text-6xl font-bold tabular-nums ${wellbeingColor(report.overallWellbeingScore)}`}>
                    {report.overallWellbeingScore.toFixed(1)}
                  </span>
                  <span className="text-2xl font-light text-white/20">/10</span>
                  <p className="text-xs text-white/35 mt-1 tracking-wide">Overall Wellbeing Score</p>
                </div>
                <div className="w-full">
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${wellbeingBarColor(report.overallWellbeingScore)}`}
                      style={{ width: `${wellbeingPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/20 mt-1">
                    <span>0</span>
                    <span>10</span>
                  </div>
                </div>
              </Card>

              <Card>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Dimension Scores</p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 10]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.15}
                      strokeWidth={1.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>

          {/* Section 3: Identified Issues */}
          <div>
            <SectionTitle>03 — Identified Issues</SectionTitle>
            <Card className="mb-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#111",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "12px",
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="severity" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => {
                      const sev = report.identifiedIssues[index]?.severity ?? 5;
                      const color = sev <= 3 ? "#10b981" : sev <= 6 ? "#eab308" : "#ef4444";
                      return <Cell key={index} fill={color} fillOpacity={0.8} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.identifiedIssues.map((issue, i) => (
                <Card key={i} className="flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm text-white/90">{issue.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${severityColor(issue.severity)} flex-shrink-0`}>
                      {issue.severity}/10
                    </span>
                  </div>
                  <span className="inline-block w-fit text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400/70 border border-cyan-500/20 uppercase tracking-wider">
                    {issue.category}
                  </span>
                  <p className="text-xs text-white/45 leading-relaxed">{issue.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Section 4: Emotional Patterns */}
          <div>
            <SectionTitle>04 — Emotional Patterns</SectionTitle>
            <Card>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={report.emotionalPatterns}
                      dataKey="percentage"
                      nameKey="emotion"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={52}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {report.emotionalPatterns.map((entry, i) => (
                        <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#111",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`${value}%`, ""]}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex flex-col gap-2 min-w-[160px]">
                  {report.emotionalPatterns.map((ep, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: ep.color }} />
                      <span className="text-xs text-white/55 capitalize">{ep.emotion}</span>
                      <span className="ml-auto text-xs font-semibold text-white/80">{ep.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Section 5: Clinical Insights */}
          <div>
            <SectionTitle>05 — Clinical Insights</SectionTitle>
            <Card className="border-l-2 border-l-cyan-500/50">
              <p className="text-white/70 text-sm leading-relaxed italic">{report.diagnosisInsights}</p>
            </Card>
          </div>

          {/* Section 6: Recommendations */}
          <div>
            <SectionTitle>06 — Recommendations</SectionTitle>
            <Card>
              <ol className="space-y-3">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/65">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded bg-cyan-500/15 text-cyan-400 text-[10px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          {/* Section 7: Follow-up Actions */}
          <div>
            <SectionTitle>07 — Follow-up Actions</SectionTitle>
            <Card>
              <ol className="space-y-3">
                {report.followUpActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/65">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded bg-orange-500/15 text-orange-400 text-[10px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 pt-6 text-center">
            <p className="text-xs text-white/20">
              This report is AI-generated and intended to support — not replace — clinical judgment.
              All findings should be reviewed by a qualified mental health professional.
            </p>
            <p className="text-xs text-white/15 mt-1">Session #{sessionId} · {reportDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
