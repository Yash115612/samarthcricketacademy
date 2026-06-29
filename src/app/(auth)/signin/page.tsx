"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { signIn, useSession } from "next-auth/react";

type LoginTab = "player" | "admin";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  NO_MEMBERSHIP: "No approved membership found for this Google account. Please apply for membership first.",
  MEMBERSHIP_PENDING: "Your membership is pending admin approval. Please wait for confirmation.",
  MEMBERSHIP_EXPIRED: "Your membership has expired. Please renew.",
  NO_BRANCH: "Branch not assigned to your account. Contact support.",
  OAuthCallback: "Google sign-in failed. Ensure you use the same URL everywhere and allow cookies.",
  OAuthSignin: "Google sign-in could not be started. Please try again.",
};

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [tab, setTab] = useState<LoginTab>("player");
  const [mounted, setMounted] = useState(false);

  // Player state
  const [playerEmail, setPlayerEmail] = useState("");
  const [playerPassword, setPlayerPassword] = useState("");

  // Admin state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in (only after client-side mount to prevent hydration loop)
  useEffect(() => {
    if (!mounted) return;
    if (status !== "authenticated") return;
    const params = new URLSearchParams(window.location.search);
    if (params.has("error")) return;
    const dest = session?.user?.role === "admin" ? "/admin" : "/dashboard";
    window.location.replace(dest);
  }, [mounted, status, router, session?.user?.role]);

  const callbackUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("callbackUrl") ?? null
      : null;

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    const err = params.get("error");
    if (!err) return;
    
    setError(GOOGLE_ERROR_MESSAGES[err] ?? "Sign-in failed. Please try again.");
  }, []);

  const handlePlayerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!playerEmail.trim() || !playerPassword.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: playerEmail,
        password: playerPassword,
      });

      if (res?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      // Successful login: hard redirect to fresh session
      window.location.href = callbackUrl ?? "/dashboard";
    } catch (err) {
      setError("Sign-in failed. Please check your connection.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    const dest = tab === "admin" ? "/admin" : "/dashboard";
    signIn("google", { callbackUrl: new URL(dest, window.location.origin).toString() });
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("admin-credentials", {
        redirect: false,
        email: adminEmail,
        password: adminPassword,
      });

      if (res?.error) {
        setError("Invalid admin credentials.");
        setLoading(false);
        return;
      }

      // Successful login: hard redirect to fresh session
      window.location.href = callbackUrl ?? "/admin";
    } catch (err) {
      setError("Admin sign-in failed.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-6 relative overflow-hidden bg-academy-dark">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2070&auto=format&fit=crop"
          alt="Cricket stadium"
          fill
          priority
          className="object-cover grayscale opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-academy-dark via-academy-dark to-academy-red/20" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <Image
              src="/logo.png"
              alt="Samarth Cricket Academy"
              width={48}
              height={48}
              className="rounded-full group-hover:rotate-12 transition-transform shadow-xl shadow-academy-red/20"
            />
            <div className="text-left">
              <span className="font-black text-xl md:text-2xl leading-tight tracking-tight uppercase block">Samarth</span>
              <span className="text-[8px] md:text-[10px] text-academy-gold font-black tracking-[0.3em] uppercase block">Cricket Academy</span>
            </div>
          </Link>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in to access your dashboard</p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl mb-6">
          {(["player", "admin"] as LoginTab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                tab === t
                  ? t === "admin"
                    ? "bg-academy-gold text-black shadow-xl shadow-academy-gold/20"
                    : "bg-academy-red text-white shadow-xl shadow-academy-red/20"
                  : "text-gray-500 hover:text-white"
              )}
            >
              {t === "player" ? "Player Login" : "Admin Login"}
            </button>
          ))}
        </div>

        <Card className="p-6 md:p-8 border-white/5 bg-academy-gray/50 backdrop-blur-2xl shadow-2xl">

          {/* ── PLAYER PANEL ─────────────────────────────────────── */}
          {tab === "player" && (
            <div className="space-y-6">
              <form onSubmit={handlePlayerLogin} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={playerEmail}
                  onChange={(e) => setPlayerEmail(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={playerPassword}
                  onChange={(e) => setPlayerPassword(e.target.value)}
                />

                {error && (
                  <div className="space-y-4">
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest text-center bg-red-500/10 py-3 rounded-xl">
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-14 text-base uppercase tracking-widest font-black shadow-2xl"
                  disabled={loading}
                >
                  {loading ? "Signing In…" : "Sign In"} <ArrowRight className="ml-2" />
                </Button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-academy-gray px-4 text-gray-500">OR</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 uppercase tracking-widest text-[10px] font-black bg-white/5 border-white/10 hover:bg-white/10"
                onClick={handleGoogleLogin}
              >
                <Image src="https://www.google.com/favicon.ico" alt="Google" width={14} height={14} className="mr-2" />
                Sign in with Google
              </Button>

              {/* Demo Credentials Hint */}
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center mb-2">Demo Player Account</p>
                <div className="space-y-2 text-[10px] font-bold text-center">
                  <p className="text-gray-400">Email: <span className="text-white">player@samarth.com</span></p>
                  <p className="text-gray-400">Pass: <span className="text-white">player123</span></p>
                </div>
              </div>
            </div>
          )}

          {/* ── ADMIN PANEL ──────────────────────────────────────── */}
          {tab === "admin" && (
            <form className="space-y-6" onSubmit={handleAdminLogin}>
              <Input
                label="Admin Email"
                type="email"
                placeholder="admin@samarth.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />

              {error && (
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest text-center bg-red-500/10 py-3 rounded-xl">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full h-14 text-base uppercase tracking-widest font-black shadow-2xl"
                disabled={loading}
              >
                <ShieldCheck className="mr-2" /> {loading ? "Authenticating…" : "Admin Access"}
              </Button>

              {/* Demo Admin Hint */}
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center mb-2">Demo Admin Account</p>
                <div className="space-y-1 text-[10px] font-bold text-center">
                  <p className="text-gray-400">Email: <span className="text-white">admin@samarth.com</span></p>
                  <p className="text-gray-400">Pass: <span className="text-white">admin123</span></p>
                </div>
              </div>
            </form>
          )}

        </Card>

        {/* Footer */}
        <div className="mt-10 text-center space-y-4">
          {tab === "player" && (
            <p className="text-sm font-medium text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-academy-red font-black uppercase tracking-widest hover:underline">
                Register Now
              </Link>
            </p>
          )}
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
            Secure Academy Access Control
          </p>
        </div>
      </div>
    </main>
  );
}
