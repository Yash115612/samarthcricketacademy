import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, Star, ArrowRight, Shield, MessageSquare, Clock, Trophy, MapPin, ChevronDown } from "lucide-react";
import { settings, plans } from "@/server/db/inMemoryDb";
import type { BranchId } from "@/types/dashboard";

export default async function MembershipPage({ searchParams }: { searchParams: { branch?: string } }) {
  const branchId = (searchParams.branch as BranchId) || "samarth";
  const { total_pt_slots, used_pt_slots } = settings.get(branchId);
  const remaining_slots = total_pt_slots - used_pt_slots;
  const availablePlans = plans.list();

  return (
    <main className="min-h-screen bg-academy-dark">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-16 px-6 text-center bg-gradient-to-b from-academy-red/10 to-transparent border-b border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all">
                <MapPin size={16} className="text-academy-gold" />
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  {branchId === "samarth" ? "Samarth Academy" : "AIMS Academy"}
                </span>
                <ChevronDown size={14} className="text-gray-500 group-hover:text-academy-gold transition-transform group-hover:rotate-180" />
              </div>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-academy-gray border border-white/10 rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link 
                  href="/membership?branch=samarth" 
                  className={`block px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors ${branchId === "samarth" ? "text-academy-gold bg-white/5" : "text-gray-400"}`}
                >
                  Samarth Academy (Mira Bhayander)
                </Link>
                <Link 
                  href="/membership?branch=aims" 
                  className={`block px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors ${branchId === "aims" ? "text-academy-gold bg-white/5" : "text-gray-400"}`}
                >
                  AIMS Academy (Mumbai)
                </Link>
              </div>
            </div>
          </div>

          <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-academy-gold border border-academy-gold/30 bg-academy-gold/10 px-4 py-1.5 rounded-full mb-6 uppercase">
            Elevate Your Game
          </span>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-6">
            CHOOSE YOUR PLAN
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Structured training programs for every level — from beginner to competitive. Choose the plan that fits your goals.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {availablePlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border p-10 transition-all duration-500 group ${
                plan.type === "monthly"
                  ? "border-academy-gold bg-academy-gold/5 shadow-2xl shadow-academy-gold/10 scale-105 z-10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              } ${plan.id === "pt" ? "bg-gradient-to-br from-academy-red/5 to-academy-gold/5" : ""}`}
            >
              {plan.type === "monthly" && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-academy-gold text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    <Star size={10} fill="black" /> Most Popular
                  </span>
                </div>
              )}

              {plan.id === "pt" && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-academy-red text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    <Clock size={10} /> Limited Slots Available
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-academy-gold">Click to view pricing & subscribe</span>
                </div>
                <p className="text-[11px] text-academy-gold font-black uppercase tracking-widest">
                  {plan.duration_label}
                </p>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>

              {plan.id === "pt" ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Availability</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${remaining_slots > 0 ? "text-emerald-500" : "text-academy-red"}`}>
                        {remaining_slots > 0 ? `${remaining_slots} Slots Left` : "Waitlist Active"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${remaining_slots > 0 ? "bg-academy-gold" : "bg-academy-red"}`}
                        style={{ width: `${(used_pt_slots / total_pt_slots) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link href={`/membership/pt-contact?branch=${branchId}`} className="block">
                    <button className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-academy-gold transition-all shadow-xl shadow-white/5">
                      Request PT Session
                    </button>
                  </Link>
                </div>
              ) : (
                <Link href={`/membership/pay?plan=monthly&branch=${branchId}`}>
                  <button className="w-full h-14 rounded-2xl bg-academy-red text-white font-black uppercase tracking-widest text-xs hover:bg-academy-red/80 transition-all shadow-xl shadow-academy-red/20 flex items-center justify-center gap-2 group">
                    Subscribe Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-20 text-center flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-gray-400">
            <Trophy size={14} className="text-academy-gold" />
            Trusted by Players Across Mira Bhayander &amp; Mumbai
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Select Plan", desc: "Choose the membership plan that suits you best." },
              { step: "02", title: "Pay via QR", desc: "Scan the UPI QR code, pay, and upload your UTR + screenshot." },
              { step: "03", title: "Admin Approval", desc: "Our team verifies your payment and activates your account within 24 hours." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-academy-red/20 border border-academy-red/30 flex items-center justify-center text-academy-red font-black text-sm">
                  {item.step}
                </span>
                <h3 className="font-black uppercase tracking-wider text-sm">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">
            <Shield size={14} className="text-academy-gold" />
            Already have an approved account?{" "}
            <Link href="/signin" className="text-academy-gold hover:underline ml-1">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
