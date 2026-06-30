"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";

export default function AdminSignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || status !== "authenticated") return;
    if (session?.user?.role === "admin") {
      router.replace("/admin");
    }
  }, [mounted, status, router, session?.user?.role]);

  const callbackUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("callbackUrl") ?? null
      : null;

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

      window.location.href = callbackUrl ?? "/admin";
    } catch (err) {
      setError("Admin sign-in failed.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-6 relative overflow-hidden bg-academy-dark">
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
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">Admin Access</h1>
          <p className="text-gray-400 text-sm">Sign in to manage the academy</p>
        </div>

        <Card className="p-6 md:p-8 border-white/5 bg-academy-gray/50 backdrop-blur-2xl shadow-2xl">
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
              <ShieldCheck className="mr-2" /> {loading ? "Authenticating…" : "Admin Sign In"}
            </Button>
          </form>
        </Card>

        <div className="mt-10 text-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
            Restricted Admin Area
          </p>
        </div>
      </div>
    </main>
  );
}
