import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Heart, ArrowLeft, RefreshCw } from "lucide-react";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const email: string = (location.state as { email?: string })?.email ?? "";
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Mask email: sh***@example.com
  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, _b, c) => `${a}***${c}`)
    : "your email";

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) return;
    setIsLoading(true);
    try {
      const result = await authClient.signIn.emailOtp({
        email,
        otp: otp.trim(),
      });
      if (result.error) {
        toast({
          title: "Invalid code",
          description: result.error.message || "The code you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      } else {
        navigate("/", { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setIsResending(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message || "Failed to resend code",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Code sent",
          description: "A new verification code has been sent to your email.",
        });
        setOtp("");
      }
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-pink-600/8 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 rounded-full bg-indigo-600/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 via-pink-500/20 to-orange-500/20 border border-pink-500/20 shadow-lg shadow-violet-500/10">
            <Heart className="w-7 h-7 text-pink-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">Buddy</h1>
            <p className="mt-1 text-sm text-white/40">Your safe space to talk</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 shadow-xl shadow-black/40">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white/90">Check your email</h2>
            <p className="mt-1 text-xs text-white/40">
              We sent a 6-digit code to{" "}
              <span className="text-violet-400 font-medium">{maskedEmail}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="otp" className="text-xs font-medium text-white/50">
                Verification code
              </label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                autoFocus
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 focus:ring-violet-500/20 h-12 text-center text-2xl tracking-[0.4em] font-mono"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full h-10 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-medium border-0 shadow-lg shadow-violet-500/20 transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify & sign in"
              )}
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="flex items-center gap-1.5 text-xs text-violet-400/70 hover:text-violet-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
              Resend code
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          Didn't get an email? Check your spam folder.
        </p>
      </div>
    </div>
  );
}
