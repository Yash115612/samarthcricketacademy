"use client";

import { ArrowRight, CheckCircle2, Lock, RefreshCw, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";

interface DashboardLockOverlayProps {
  membershipStatus?: string;
}

export function DashboardLockOverlay({ membershipStatus }: DashboardLockOverlayProps) {
  const isExpired = membershipStatus === "expired";
  const isPending = membershipStatus === "pending";
  const isRejected = membershipStatus === "rejected";

  const benefits = [
    "Register for Upcoming Matches",
    "Track Your Detailed Performance Stats",
    "Join Group Training Sessions",
    "Access Academy Facilities & Gear",
    "View Detailed Attendance Reports",
    "Direct Messaging with Coaches",
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-academy-dark/60 backdrop-blur-[10px] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="bg-academy-gray/90 border border-white/10 p-8 md:p-12 rounded-[2.5rem] max-w-xl w-full shadow-[0_0_100px_rgba(0,0,0,0.6)] relative overflow-hidden"
      >
        {/* Glow Effects */}
        <div className={`absolute top-0 right-0 w-48 h-48 blur-[100px] -translate-y-1/2 translate-x-1/2 ${isExpired || isRejected ? "bg-red-500/20" : "bg-academy-gold/20"}`} />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-academy-red/20 blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center">
          {/* Icon */}
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border rotate-3 ${
            isExpired || isRejected
              ? "bg-gradient-to-br from-red-500/20 to-red-500/5 text-red-400 border-red-500/20 shadow-red-500/10"
              : isPending
              ? "bg-gradient-to-br from-academy-gold/20 to-academy-gold/5 text-academy-gold border-academy-gold/20 shadow-academy-gold/10"
              : "bg-gradient-to-br from-academy-gold/20 to-academy-gold/5 text-academy-gold border-academy-gold/20 shadow-academy-gold/10"
          }`}>
            {isExpired ? (
              <RefreshCw size={40} className="animate-spin [animation-duration:3s]" />
            ) : isRejected ? (
              <XCircle size={40} className="text-red-400" />
            ) : isPending ? (
              <Clock size={40} className="animate-pulse" />
            ) : (
              <Lock size={40} className="animate-pulse" />
            )}
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-white leading-none">
            {isExpired
              ? "Membership Expired"
              : isRejected
              ? "Membership Rejected"
              : isPending
              ? "Approval Pending"
              : "Unlock Your Pro Dashboard"}
          </h2>

          {/* Description */}
          <p className="text-gray-400 font-medium mb-8 leading-relaxed text-sm md:text-base">
            {isExpired
              ? "Your membership has expired. Renew now to regain full access to training, matches, and all academy features."
              : isRejected
              ? "Your membership payment was rejected by the admin. Please contact support or try again with a valid payment."
              : isPending
              ? "Your payment is being verified by our team. You'll have full access once approved — usually within 24 hours."
              : "You're in preview mode. Get a membership to unlock all professional features and start your cricket journey."}
          </p>

          {/* Expiry/Rejection notice */}
          {(isExpired || isRejected) && (
            <div className={`mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest`}>
              {isExpired ? "Your membership has expired. Renew to continue." : "Your payment was rejected. Please retry."}
            </div>
          )}

          {/* Benefits grid — hide for pending */}
          {!isPending && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i }}
                  className="flex items-center gap-3 text-left p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="w-6 h-6 rounded-full bg-academy-gold/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={12} className="text-academy-gold" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{benefit}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col gap-4">
            {isPending ? (
              <div className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-academy-gold font-black uppercase tracking-widest">
                <div className="w-2 h-2 bg-academy-gold rounded-full animate-ping" />
                Verification in Progress
              </div>
            ) : (
              <Link href="/membership" className="w-full">
                <Button
                  variant="secondary"
                  className="w-full h-16 text-lg uppercase tracking-widest font-black shadow-2xl shadow-academy-gold/20 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isExpired ? "Renew Membership" : "Get Active Membership"}
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>
              </Link>
            )}
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
              Join 500+ elite players today
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
