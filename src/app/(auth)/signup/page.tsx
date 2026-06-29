"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const { status } = useSession();

  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    branch_id: "samarth" as "samarth" | "aims",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    if (status === "authenticated" && !params.has("error") && !isSubmitting) {
      router.replace("/dashboard");
    }
  }, [mounted, status, router, isSubmitting]);

  const handleGoogleSignUp = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-academy-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = (await res.json().catch(() => null)) as any;
      if (!res.ok || !data?.ok) {
        setError(data?.message || data?.error || "Registration failed. Please verify your details and try again.");
        setIsSubmitting(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInRes?.error) {
        setError("Account created, but auto-login failed. Please sign in manually.");
        setIsSubmitting(false);
        return;
      }

      // Successful auto-login: hard redirect to fresh session
      window.location.href = "/dashboard";
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-academy-dark">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2073&auto=format&fit=crop"
          alt="Academy training background"
          fill
          priority
          className="object-cover grayscale opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-academy-dark via-academy-dark to-academy-gold/20"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-xl">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 group mb-8">
            <Image
              src="/logo.png"
              alt="Samarth Cricket Academy Logo"
              width={48}
              height={48}
              className="rounded-full group-hover:rotate-12 transition-transform shadow-xl shadow-academy-red/20"
            />
            <div className="text-left">
              <span className="font-black text-2xl leading-tight tracking-tight uppercase block">Samarth</span>
              <span className="text-[10px] text-academy-gold font-black tracking-[0.3em] uppercase block">Cricket Academy</span>
            </div>
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Join the Academy</h1>
          <p className="text-gray-400 font-medium">Step into the big leagues. Register today.</p>
        </div>

        <Card className="p-10 border-white/5 bg-academy-gray/50 backdrop-blur-2xl shadow-2xl">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                required
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 00000 00000"
                required
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Academy Branch</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "samarth", name: "Samarth Cricket Academy", location: "Main Branch, Pune" },
                  { id: "aims", name: "AIMS Academy", location: "Second Branch, Mumbai" }
                ].map((branch) => (
                  <label key={branch.id} className="relative group cursor-pointer">
                    <input
                      type="radio"
                      name="branch_id"
                      value={branch.id}
                      className="peer sr-only"
                      checked={formData.branch_id === branch.id}
                      onChange={() => setFormData((p) => ({ ...p, branch_id: branch.id as any }))}
                    />
                    <div className="p-4 border border-white/10 rounded-2xl bg-white/5 peer-checked:border-academy-gold peer-checked:bg-academy-gold/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-academy-gold group-hover:scale-110 transition-transform">
                          <Users size={16} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-tight">{branch.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{branch.location}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center bg-red-500/10 py-2 rounded-lg" role="alert">
                {error}
              </p>
            )}

            <div className="space-y-4 pt-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 accent-academy-red" required />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                  I agree to the Terms of Service, Privacy Policy, and Academy Rules & Regulations.
                </span>
              </label>
            </div>

            <Button variant="secondary" size="lg" className="w-full h-14 text-lg uppercase tracking-widest font-black shadow-2xl" disabled={isSubmitting}>
              Register Now <ArrowRight className="ml-2" />
            </Button>
          </form>

          {/* Social Signup */}
          <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">OR JOIN WITH</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button 
                variant="outline" 
                className="w-full h-12 uppercase tracking-widest text-xs font-black bg-white/5 border-white/10 hover:bg-white/10"
                onClick={handleGoogleSignUp}
              >
                <Image src="https://www.google.com/favicon.ico" alt="Google" width={16} height={16} className="mr-2" />
                Join with Google
              </Button>
            </div>
          </div>

          <div className="mt-10 text-center space-y-4 pt-8 border-t border-white/5">
            <p className="text-sm font-medium text-gray-400">
              Already have an account?{" "}
              <Link href="/signin" className="text-academy-gold font-black uppercase tracking-widest hover:underline">
                Sign In Instead
              </Link>
            </p>
          </div>
        </Card>

        {/* Support Link */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
            Need help? Contact our support at <span className="text-academy-gold">support@samarthcricket.com</span>
          </p>
        </div>
      </div>
    </main>
  );
}
