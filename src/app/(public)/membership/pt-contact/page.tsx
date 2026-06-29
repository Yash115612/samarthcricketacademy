"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ArrowLeft, ArrowRight, MessageSquare, Send, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const BRANCHES = [
  { id: "samarth", name: "Samarth Cricket Academy", location: "Main Branch, Pune" },
  { id: "aims", name: "AIMS Academy", location: "Second Branch, Mumbai" },
];

function PTContactPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isWaitingList = searchParams.get("waiting") === "true";
  const branchFromUrl = searchParams.get("branch") as "samarth" | "aims" | null;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    branch_id: (branchFromUrl === "samarth" || branchFromUrl === "aims" ? branchFromUrl : "samarth") as "samarth" | "aims",
    message: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user?.name ?? prev.name,
        phone: (session.user as any).phone ?? prev.phone,
        branch_id: (session.user as any).branch_id ?? (branchFromUrl === "samarth" || branchFromUrl === "aims" ? branchFromUrl : prev.branch_id),
      }));
    }
  }, [session, branchFromUrl]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/membership/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: "personal_training",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit enquiry");
      }

      setIsSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again or contact us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-academy-dark">
        <Navbar />
        <section className="pt-40 pb-20 px-6 flex items-center justify-center">
          <Card className="max-w-xl w-full p-12 text-center border-white/10 bg-academy-gray/50 backdrop-blur-xl">
            <div className="w-20 h-20 bg-academy-gold/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} className="text-academy-gold" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-4">Enquiry Submitted!</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              {isWaitingList 
                ? "You&apos;ve been added to our waiting list. Our head coach will contact you as soon as a slot becomes available."
                : "Thank you for your interest in Personal Training. Our team will review your enquiry and contact you within 24-48 hours to discuss custom pricing and scheduling."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full h-12 uppercase tracking-widest text-[10px] font-black">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="https://wa.me/919876543210" className="flex-1">
                <Button variant="primary" className="w-full h-12 uppercase tracking-widest text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 border-none">
                  Chat on WhatsApp
                </Button>
              </Link>
            </div>
          </Card>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-academy-dark">
      <Navbar />

      <section className="pt-36 pb-20 px-6 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-academy-gold/5 blur-[120px] rounded-full -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-academy-red/5 blur-[120px] rounded-full -ml-64 -mb-64" />

        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div>
              <Link
                href="/membership"
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-8"
              >
                <ArrowLeft size={14} /> Back to Plans
              </Link>
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest mb-6 ${
                isWaitingList ? "border-academy-red/30 bg-academy-red/10 text-academy-red" : "border-academy-gold/30 bg-academy-gold/10 text-academy-gold"
              }`}>
                {isWaitingList ? <Clock size={12} /> : <ShieldCheck size={12} />}
                {isWaitingList ? "Joining Waiting List" : "Premium Personal Training"}
              </span>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] mb-6">
                GET THE <span className="text-academy-gold">EDGE</span> YOU NEED.
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                Our Personal Training program offers one-to-one coaching with state-level mentors. 
                Perfect for players aiming for professional cricket.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "100% Focused on your technique",
                "Personalized drill sessions",
                "Direct mentorship from head coach",
                "Video analysis & feedback",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-academy-gold/20 flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-academy-gold" />
                  </div>
                  <span className="text-sm font-bold text-gray-300 uppercase tracking-wide">{item}</span>
                </div>
              ))}
            </div>

            <Card className="p-6 border-white/5 bg-white/[0.02] max-w-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Trusted By</p>
              <div className="flex -space-x-2 mb-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-academy-dark bg-academy-gray overflow-hidden">
                    <Image src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" width={32} height={32} />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-academy-dark bg-academy-gold flex items-center justify-center text-[10px] font-black text-black">
                  +50
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium">Joined by 50+ elite players this month.</p>
            </Card>
          </div>

          {/* Right: Form */}
          <Card className="p-10 border-white/10 bg-academy-gray/50 backdrop-blur-2xl shadow-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              {isWaitingList ? "Join Waiting List" : "Request a Slot"}
            </h2>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-8">
              Fill the form below and we&apos;ll get back to you.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  placeholder="Enter your name"
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
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Select Branch</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BRANCHES.map((branch) => (
                    <label key={branch.id} className="relative cursor-pointer group">
                      <input
                        type="radio"
                        name="branch_id"
                        value={branch.id}
                        className="peer sr-only"
                        checked={formData.branch_id === branch.id}
                        onChange={() => setFormData((p) => ({ ...p, branch_id: branch.id as any }))}
                      />
                      <div className="p-4 border border-white/10 rounded-2xl bg-white/5 peer-checked:border-academy-gold peer-checked:bg-academy-gold/10 hover:bg-white/10 transition-all">
                        <p className="text-xs font-black uppercase tracking-tight mb-1">{branch.name}</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{branch.location}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Your Message (Optional)</label>
                <textarea
                  className="w-full min-h-[120px] p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-academy-gold/50 transition-all placeholder:text-gray-600"
                  placeholder={isWaitingList ? "Tell us why you want to join the program..." : "Tell us about your experience level or specific training needs..."}
                  value={formData.message}
                  onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                />
              </div>

              {error && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center bg-red-500/10 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full h-14 text-base uppercase tracking-widest font-black shadow-2xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : isWaitingList ? "Join Waiting List" : "Request Slot"} <Send size={16} className="ml-2" />
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function PTContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-academy-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PTContactPageContent />
    </Suspense>
  );
}
