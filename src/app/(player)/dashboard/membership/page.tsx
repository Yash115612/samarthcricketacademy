"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Zap, Shield, Crown, CheckCircle, Clock, Calendar, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "2-months-plan",
    name: "2 Months Plan",
    price: "₹5,000",
    duration: "2 Months",
    features: [
      "Full academy training",
      "Group practice sessions",
      "Match participation",
      "Attendance tracking",
      "Performance tracking",
    ],
    color: "text-academy-gold",
    icon: Crown,
  },
  {
    id: "personal-training",
    name: "Personal Training",
    price: "Contact Base",
    duration: "Premium Access",
    features: [
      "One-to-one coaching",
      "Personalized training sessions",
      "No group practice",
      "Premium styling & badge",
      "Dedicated coach support",
    ],
    color: "text-blue-500",
    icon: Shield,
  },
];

export default function PlayerMembershipPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const userId = user?.id ?? null;
  const [membership, setMembership] = useState<{
    plan_name: string;
    start_date: string;
    expiry_date: string;
    status: "Active" | "Expired" | "Pending";
    expiring_soon: boolean;
    days_left?: number;
  } | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    const load = async () => {
      try {
        setPageError(null);
        const res = await fetch("/api/player/dashboard", { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as any;
        if (!mounted) return;
        if (!res.ok || !data?.ok) { setPageError("Could not load membership details."); return; }
        setMembership(data.membership);
      } catch {
        if (mounted) setPageError("Could not load membership details.");
      }
    };
    load();
    return () => { mounted = false; };
  }, [userId]);

  const daysLeft = useMemo(() => {
    if (membership?.days_left !== undefined) return membership.days_left;
    if (!membership?.expiry_date) return null;
    return Math.ceil((new Date(membership.expiry_date).getTime() - Date.now()) / 86400000);
  }, [membership]);

  const expiryFormatted = membership?.expiry_date
    ? new Date(membership.expiry_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  const isExpired = membership?.status === "Expired";
  const isExpiringSoon = membership?.expiring_soon ?? false;

  const handleRenew = (planId: string) => {
    const branch = user?.branch_id ?? "samarth";
    router.push(`/membership/pay?plan=${planId}&branch=${branch}`);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-academy-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-academy-dark text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 pt-32">
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">My Membership</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Manage your academy subscription and benefits</p>
        </div>

        {pageError && (
          <div className="mb-8 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm font-semibold" role="alert">
            {pageError}
          </div>
        )}

        {/* Expiry warning banner */}
        {(isExpired || isExpiringSoon) && (
          <div className={cn(
            "mb-8 p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4",
            isExpired
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
          )}>
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="shrink-0" />
              <p className="text-xs font-black uppercase tracking-widest">
                {isExpired
                  ? "Your membership has expired. Renew now to continue."
                  : `Your membership is expiring in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Renew now.`}
              </p>
            </div>
            <Button
              variant="secondary"
              className="shrink-0 h-10 px-6 text-[10px] font-black uppercase tracking-widest"
              onClick={() => handleRenew("2-months-plan")}
            >
              Renew Now <ArrowRight size={13} className="ml-2" />
            </Button>
          </div>
        )}

        {/* Current membership card */}
        <Card className="mb-12 p-8 border-academy-red/20 bg-gradient-to-br from-academy-red/10 to-transparent relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Crown size={120} />
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Status */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-academy-red">Current Membership</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className={cn(
                    "text-3xl font-black uppercase tracking-tight",
                    isExpired ? "text-red-400" : "text-white"
                  )}>
                    {membership?.status ?? "None"}
                  </h3>
                  {isExpired && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-red-500/10 text-red-400 border-red-500/20">
                      Expired
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-400 leading-relaxed">
                  {membership
                    ? `${membership.plan_name} membership — ${isExpired ? "expired" : "active"}.`
                    : "No membership found. Choose a plan to get started."}
                </p>
              </div>
            </div>

            {/* Expiry info */}
            <div className="space-y-4 md:border-l md:border-r border-white/5 md:px-12">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Plan Name</span>
                <span className="text-lg font-black text-white uppercase tracking-widest">{membership?.plan_name ?? "—"}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1 flex items-center gap-1">
                  <Calendar size={10} /> Expiry Date
                </span>
                <span className={cn(
                  "text-base font-black uppercase",
                  isExpired ? "text-red-400" : "text-white"
                )}>
                  {expiryFormatted ?? "—"}
                </span>
              </div>
            </div>

            {/* Days remaining + renew */}
            <div className="flex flex-col gap-4">
              <div className={cn(
                "flex items-center justify-between p-4 rounded-xl border",
                isExpired
                  ? "bg-red-500/10 border-red-500/20"
                  : isExpiringSoon
                  ? "bg-yellow-500/10 border-yellow-500/20"
                  : "bg-white/5 border-white/10"
              )}>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                    {isExpired ? "Status" : "Days Remaining"}
                  </span>
                  <span className={cn(
                    "text-xl font-black",
                    isExpired ? "text-red-400" : isExpiringSoon ? "text-yellow-400" : "text-white"
                  )}>
                    {isExpired ? "Expired" : daysLeft !== null ? `${daysLeft} Days` : "—"}
                  </span>
                </div>
                <Clock size={24} className={isExpired ? "text-red-400" : isExpiringSoon ? "text-yellow-400" : "text-gray-500"} />
              </div>

              <Button
                variant="secondary"
                className={cn(
                  "w-full h-12 uppercase tracking-widest text-[10px] font-black shadow-xl gap-2",
                  isExpired && "bg-red-600 hover:bg-red-500 border-red-500/30 shadow-red-500/20"
                )}
                onClick={() => handleRenew("2-months-plan")}
              >
                <RefreshCw size={14} />
                {isExpired ? "Renew Membership" : "Renew / Upgrade"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Choose a Plan</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Select a plan — you&apos;ll be taken to the payment page</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
          {PLANS.map((plan) => {
            const isCurrent = membership?.plan_name === plan.name && !isExpired;
            return (
              <Card key={plan.id} className={cn(
                "relative overflow-hidden border-white/5 bg-academy-gray/30 backdrop-blur-md group hover:border-academy-gold/30 transition-all duration-500",
                isCurrent && "border-academy-gold/50 bg-academy-gold/5"
              )}>
                <div className="p-8 space-y-8">
                  <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform", plan.color)}>
                    <plan.icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{plan.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-academy-gold">Click to view pricing & join</p>
                  </div>
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <CheckCircle size={14} className="text-emerald-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <div className="w-full h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle size={14} /> Current Plan
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full h-12 uppercase tracking-widest text-[10px] font-black gap-2"
                      onClick={() => handleRenew(plan.id)}
                    >
                      <Zap size={14} />
                      {isExpired ? "Renew with this Plan" : "Select Plan"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <Footer />
    </main>
  );
}
