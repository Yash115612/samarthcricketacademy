"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, CheckCircle, ArrowRight, Mail } from "lucide-react";
import { Suspense } from "react";

function PendingPageContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") ?? "Player";
  const plan = searchParams.get("plan") ?? "";

  return (
    <main className="min-h-screen bg-academy-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2073&auto=format&fit=crop"
          alt="background"
          fill
          priority
          className="object-cover grayscale opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-academy-dark via-academy-dark to-academy-gold/10" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
          <Image
            src="/logo.png"
            alt="Samarth Cricket Academy"
            width={48}
            height={48}
            className="rounded-full group-hover:rotate-12 transition-transform shadow-xl shadow-academy-red/20"
          />
          <div className="text-left">
            <span className="font-black text-xl leading-tight tracking-tight uppercase block">Samarth</span>
            <span className="text-[10px] text-academy-gold font-black tracking-[0.3em] uppercase block">Cricket Academy</span>
          </div>
        </Link>

        {/* Status Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-academy-gold/10 border-2 border-academy-gold/30 flex items-center justify-center mx-auto animate-pulse">
            <Clock size={40} className="text-academy-gold" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl font-black uppercase tracking-tight mb-3">Payment Submitted!</h1>
        <p className="text-gray-400 text-base mb-8 leading-relaxed">
          Hi <span className="text-white font-black">{name}</span>, your{" "}
          {plan && <span className="text-academy-gold font-black">{plan} Plan </span>}
          payment has been received and is awaiting admin verification.
        </p>

        {/* Steps Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 text-left space-y-5">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6 text-center">What Happens Next</h2>
          {[
            { icon: CheckCircle, label: "Payment Received", desc: "Your UTR number and screenshot have been recorded.", done: true },
            { icon: Clock, label: "Admin Review", desc: "Our team will verify your payment within 24 hours.", done: false },
            { icon: Mail, label: "Account Activated", desc: "Once approved, you can sign in with your email and password.", done: false },
          ].map(({ icon: Icon, label, desc, done }) => (
            <div key={label} className="flex items-start gap-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-white/5 border border-white/10"}`}>
                <Icon size={16} className={done ? "text-emerald-400" : "text-gray-500"} />
              </div>
              <div>
                <p className={`text-xs font-black uppercase tracking-widest ${done ? "text-emerald-400" : "text-white"}`}>{label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            href="/signin"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-academy-gold text-black text-xs font-black uppercase tracking-widest hover:bg-academy-gold/90 transition-all shadow-lg shadow-academy-gold/20"
          >
            Go to Sign In <ArrowRight size={14} />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Back to Home
          </Link>
        </div>

        <p className="mt-8 text-[10px] font-bold uppercase tracking-widest text-gray-600">
          Questions? Contact us at{" "}
          <span className="text-academy-gold">support@samarthcricket.com</span>
        </p>
      </div>
    </main>
  );
}

export default function PendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-academy-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PendingPageContent />
    </Suspense>
  );
}
