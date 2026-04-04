import { X, Phone, MessageCircle, ShieldAlert, AlertTriangle, Info } from "lucide-react";

export type CrisisLevel = "concern" | "high" | "critical";

interface CrisisAlertProps {
  level: CrisisLevel;
  onDismiss: () => void;
}

const config: Record<CrisisLevel, {
  title: string;
  border: string;
  bg: string;
  icon: typeof ShieldAlert;
  iconColor: string;
  titleColor: string;
}> = {
  critical: {
    title: "You're not alone. Help is available right now.",
    border: "border-red-500/40",
    bg: "bg-red-500/[0.07]",
    icon: ShieldAlert,
    iconColor: "text-red-400",
    titleColor: "text-red-300",
  },
  high: {
    title: "We care about your safety.",
    border: "border-orange-500/40",
    bg: "bg-orange-500/[0.07]",
    icon: AlertTriangle,
    iconColor: "text-orange-400",
    titleColor: "text-orange-300",
  },
  concern: {
    title: "Support is always available.",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/[0.05]",
    icon: Info,
    iconColor: "text-yellow-400",
    titleColor: "text-yellow-300",
  },
};

export function CrisisAlert({ level, onDismiss }: CrisisAlertProps) {
  const c = config[level];
  const Icon = c.icon;

  return (
    <div className={`mx-4 mt-3 rounded-xl border ${c.border} ${c.bg} p-4 animate-in fade-in slide-in-from-top-2 duration-300`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${c.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${c.titleColor}`}>{c.title}</p>

          <div className="mt-3 space-y-2">
            <a
              href="tel:988"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] transition-colors group"
            >
              <Phone className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
              <div>
                <p className="text-xs font-semibold text-white/80">988 Suicide & Crisis Lifeline</p>
                <p className="text-[10px] text-white/35">Call or text 988 — available 24/7</p>
              </div>
            </a>

            <a
              href="sms:741741&body=HOME"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] transition-colors group"
            >
              <MessageCircle className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
              <div>
                <p className="text-xs font-semibold text-white/80">Crisis Text Line</p>
                <p className="text-[10px] text-white/35">Text HOME to 741741</p>
              </div>
            </a>
          </div>

          <p className="mt-3 text-[10px] text-white/25 leading-relaxed">
            If you or someone you know is in immediate danger, please call emergency services (911).
          </p>
        </div>

        {level !== "critical" ? (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-md text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
