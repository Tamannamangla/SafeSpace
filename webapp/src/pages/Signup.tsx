import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Heart, Sparkles } from "lucide-react";

type AgeGroup = "under7" | "8to18" | "above18" | "";

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !ageGroup || !name.trim()) return;
    setIsLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: "sign-in",
      });
      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message || "Failed to send code",
          variant: "destructive",
        });
      } else {
        localStorage.setItem("ageGroup", ageGroup);
        localStorage.setItem("authMode", "signup");
        navigate("/verify-otp", { state: { email: email.trim(), name: name.trim() } });
      }
    } finally {
      setIsLoading(false);
    }
  }

  // CHILD MODE (under 7)
  if (ageGroup === "under7") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #fff9c4 0%, #fce4ec 40%, #e3f2fd 100%)" }}>
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDuration: "2s" }}>⭐</div>
          <div className="absolute top-20 right-16 text-5xl animate-bounce" style={{ animationDuration: "2.5s" }}>🌈</div>
          <div className="absolute bottom-20 left-8 text-5xl animate-bounce" style={{ animationDuration: "3s" }}>🦋</div>
          <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDuration: "1.8s" }}>🌟</div>
          <div className="absolute top-1/2 left-4 text-4xl animate-bounce" style={{ animationDuration: "2.2s" }}>🎈</div>
          <div className="absolute top-1/3 right-4 text-4xl animate-bounce" style={{ animationDuration: "2.8s" }}>🎨</div>
        </div>

        <div className="relative w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="text-7xl animate-bounce" style={{ animationDuration: "1.5s" }}>🐻</div>
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-tight" style={{ color: "#e91e8c", fontFamily: "Comic Sans MS, Chalkboard SE, cursive", textShadow: "2px 2px 0 #ff69b4" }}>Buddy!</h1>
              <p className="mt-1 text-lg font-bold" style={{ color: "#9c27b0", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>🌈 Your fun friend! 🌈</p>
            </div>
          </div>

          <div className="rounded-3xl border-4 p-6 shadow-2xl" style={{ borderColor: "#ff69b4", background: "rgba(255,255,255,0.9)" }}>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black" style={{ color: "#e91e8c", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>Let's be friends! 🎉</h2>
              <p className="mt-1 text-base font-semibold" style={{ color: "#9c27b0", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>
                Tell me about you! 😊
              </p>
            </div>

            <form onSubmit={handleSendOTP} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-lg font-black" style={{ color: "#e91e8c", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>
                  👤 Victim Name
                </label>
                <Input
                  type="text"
                  autoComplete="name"
                  placeholder="What's your name? 😊"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-14 text-lg rounded-2xl border-4 font-bold"
                  style={{ borderColor: "#ff69b4", fontFamily: "Comic Sans MS, Chalkboard SE, cursive", fontSize: "18px", color: "#333" }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-lg font-black" style={{ color: "#e91e8c", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>
                  📧 Email
                </label>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com 📬"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 text-lg rounded-2xl border-4 font-bold"
                  style={{ borderColor: "#ff69b4", fontFamily: "Comic Sans MS, Chalkboard SE, cursive", fontSize: "18px", color: "#333" }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-lg font-black" style={{ color: "#e91e8c", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>
                  🎂 How old are you?
                </label>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => setAgeGroup("under7")}
                    className="w-full py-3 rounded-2xl border-4 text-base font-black"
                    style={{ borderColor: "#ff69b4", background: "#ff69b4", color: "white", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>
                    🧒 Under 7 ✓
                  </button>
                  <button type="button" onClick={() => setAgeGroup("8to18")}
                    className="w-full py-3 rounded-2xl border-4 text-base font-black transition-all"
                    style={{ borderColor: "#ddd", background: "white", color: "#999", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>
                    🧑 8-18 years
                  </button>
                  <button type="button" onClick={() => setAgeGroup("above18")}
                    className="w-full py-3 rounded-2xl border-4 text-base font-black transition-all"
                    style={{ borderColor: "#ddd", background: "white", color: "#999", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>
                    👤 Above 18
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading || !email.trim() || !name.trim()}
                className="w-full h-14 rounded-2xl text-xl font-black text-white transition-all shadow-lg disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #ff69b4, #e91e8c)", fontFamily: "Comic Sans MS, Chalkboard SE, cursive", boxShadow: "0 4px 0 #c2185b" }}>
                {isLoading ? "Sending... ⏳" : "Let's go! 🚀"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm font-bold" style={{ color: "#9c27b0", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>
              We'll send a secret code to your email! 🔑
            </p>
          </div>

          <p className="mt-6 text-center text-base font-bold" style={{ color: "#9c27b0", fontFamily: "Comic Sans MS, Chalkboard SE, cursive" }}>
            Already a user?{" "}
            <Link to="/login" style={{ color: "#e91e8c", textDecoration: "underline" }}>Login! 🎈</Link>
          </p>
        </div>
      </div>
    );
  }

  // TEEN MODE (8-18)
  if (ageGroup === "8to18") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-blue-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <span className="text-3xl">💪</span>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">Buddy</h1>
              <p className="mt-1 text-sm text-cyan-300/60">Someone who gets it ✨</p>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-white/[0.04] backdrop-blur-sm p-6 shadow-xl shadow-black/40">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white/90">Join Buddy 🤝</h2>
              <p className="mt-1 text-sm text-cyan-200/40">
                Create your account — it only takes a sec
              </p>
            </div>

            <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-cyan-200/50">Victim Name</label>
                <Input type="text" autoComplete="name" placeholder="What should we call you?"
                  value={name} onChange={(e) => setName(e.target.value)} required
                  className="bg-white/5 border-cyan-500/20 text-white placeholder:text-white/20 focus:border-cyan-400/50 focus:ring-cyan-400/20 h-11 text-sm" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-cyan-200/50">Email</label>
                <Input type="email" autoComplete="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="bg-white/5 border-cyan-500/20 text-white placeholder:text-white/20 focus:border-cyan-400/50 focus:ring-cyan-400/20 h-11 text-sm" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-cyan-200/50">Age group</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAgeGroup("under7")}
                    className="flex-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all bg-white/5 border-white/10 text-white/40 hover:border-white/20">
                    Under 7
                  </button>
                  <button type="button" onClick={() => setAgeGroup("8to18")}
                    className="flex-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all bg-cyan-500/20 border-cyan-500/50 text-cyan-300">
                    8-18 yrs ✓
                  </button>
                  <button type="button" onClick={() => setAgeGroup("above18")}
                    className="flex-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all bg-white/5 border-white/10 text-white/40 hover:border-white/20">
                    18+
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading || !email.trim() || !name.trim()}
                className="w-full h-11 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white font-semibold border-0 shadow-lg shadow-cyan-500/20 transition-all text-sm">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Sending code...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Let's do this
                  </span>
                )}
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-cyan-200/25 leading-relaxed">
              This is your safe space. Everything you share stays private.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-white/40">
            Already a user?{" "}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // DEFAULT / ABOVE 18 MODE
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-pink-600/8 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 rounded-full bg-indigo-600/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 via-pink-500/20 to-orange-500/20 border border-pink-500/20 shadow-lg shadow-violet-500/10">
            <Heart className="w-7 h-7 text-pink-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">Buddy</h1>
            <p className="mt-1 text-sm text-white/40">Your safe space to talk</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 shadow-xl shadow-black/40">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white/90">Create your account</h2>
            <p className="mt-1 text-xs text-white/40">
              We'll send a one-time code to your email
            </p>
          </div>

          <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/50">Victim Name</label>
              <Input type="text" autoComplete="name" placeholder="What should we call you?"
                value={name} onChange={(e) => setName(e.target.value)} required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 focus:ring-violet-500/20 h-10" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/50">Email address</label>
              <Input type="email" autoComplete="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 focus:ring-violet-500/20 h-10" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/50">Age group</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAgeGroup("under7")}
                  className="flex-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60">
                  Under 7
                </button>
                <button type="button" onClick={() => setAgeGroup("8to18")}
                  className="flex-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60">
                  8-18 yrs
                </button>
                <button type="button" onClick={() => setAgeGroup("above18")}
                  className="flex-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all bg-violet-500/20 border-violet-500/50 text-violet-300">
                  18+ ✓
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading || !email.trim() || !name.trim() || !ageGroup}
              className="w-full h-10 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-medium border-0 shadow-lg shadow-violet-500/20 transition-all">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Sending code...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Send verification code
                </span>
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-white/25 leading-relaxed">
            By continuing, you agree to keep this space safe and supportive.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-white/40">
          Already a user?{" "}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
