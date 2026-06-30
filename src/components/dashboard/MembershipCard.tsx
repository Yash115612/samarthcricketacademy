import React from "react";
import { CreditCard, Calendar, ChevronRight, AlertTriangle, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Membership } from "@/types/dashboard";
import Link from "next/link";

interface MembershipCardProps {
  membership: Membership | null;
  onRenew?: () => void;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({ membership, onRenew }) => {
  if (!membership) return null;

  const isActive = membership.status === "Active";
  const isExpired = membership.status === "Expired";
  const expiry = new Date(membership.expiry_date);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const expiringSoon = isActive && daysLeft <= 3 && daysLeft >= 0;
  const expiringSoonWarning = isActive && daysLeft <= 7 && daysLeft > 3;

  const expiryFormatted = expiry.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  // Calculate progress percentage (assuming plan duration is 60 days by default, adjust if needed)
  const defaultDurationDays = 60;
  const progress = Math.max(0, Math.min(100, (daysLeft / defaultDurationDays) * 100));

  return (
    <Link href="/dashboard/membership" className="block group/card focus:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold rounded-2xl col-span-2 md:col-span-1">
      <Card
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-academy-gray/50 to-academy-dark/70 backdrop-blur-2xl p-6 md:p-7 flex flex-col gap-4 transition-all cursor-pointer border shadow-[0_10px_40px_rgba(0,0,0,0.25)]",
          expiringSoon ? "border-red-500/40 hover:border-red-500/60 shadow-red-500/15" : "border-white/10 hover:border-academy-gold/40 shadow-academy-gold/10"
        )}
        role="region"
        aria-labelledby="membership-title"
      >
        {/* Decorative elements */}
        <div className={cn(
          "absolute top-0 right-0 w-40 h-40 blur-3xl -z-10 transition-all",
          expiringSoon ? "bg-red-500/30 group-hover/card:bg-red-500/40" : "bg-academy-gold/20 group-hover/card:bg-academy-gold/30"
        )} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-academy-gold/15 border border-academy-gold/25 flex items-center justify-center">
              <CreditCard className="text-academy-gold shrink-0" size={20} aria-hidden="true" />
            </div>
            <h2 id="membership-title" className="text-[11px] font-black uppercase tracking-[0.3em] text-white">
              Membership
            </h2>
          </div>
          <ChevronRight size={16} className="text-gray-600 group-hover/card:text-academy-gold transition-colors" />
        </div>

        {/* Plan name */}
        <p className={cn(
          "text-xl md:text-2xl font-black uppercase leading-tight",
          (membership as any).plan_type === "pt" ? "text-white" : "text-academy-gold"
        )}>
          {membership.plan}
        </p>

        {/* Status badge */}
        <span
          className={cn(
            "self-start px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm",
            expiringSoon
              ? "bg-red-500/15 text-red-400 border-red-500/30"
              : expiringSoonWarning
              ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
              : isActive
              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
              : "bg-red-500/15 text-red-500 border-red-500/30"
          )}
          role="status"
        >
          {expiringSoon ? "Expiring Soon!" : membership.status}
        </span>

        {/* Progress Bar */}
        {isActive && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className={expiringSoon ? "text-red-400" : "text-academy-red"} />
                {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining` : "Expires today"}
              </span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  expiringSoon
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : expiringSoonWarning
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                    : "bg-gradient-to-r from-academy-gold to-yellow-600"
                )}
                style={{ width: `${100 - progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Expiry date */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 border-t border-white/10 pt-4">
          <Calendar size={14} className={cn("shrink-0", expiringSoon ? "text-red-400" : "text-academy-red")} aria-hidden="true" />
          <time dateTime={membership.expiry_date}>
            {isExpired ? "Expired" : "Valid until"} {expiryFormatted}
          </time>
        </div>

        {/* Expiring-soon warning */}
        {expiringSoon && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-[0.2em]">
            <AlertTriangle size={12} /> Renew before it expires!
          </div>
        )}

        {/* Renew button */}
        <Button
          variant={expiringSoon || isExpired ? "primary" : "secondary"}
          className={cn(
            "w-full h-11 md:h-12 uppercase tracking-[0.2em] text-[10px] font-black mt-auto shadow-lg",
            (expiringSoon || isExpired) && "bg-red-600 hover:bg-red-500 border-red-500/30 shadow-red-500/20"
          )}
          aria-label="Renew your membership now"
          onClick={(e) => { e.preventDefault(); onRenew?.(); }}
        >
          {isExpired ? "Renew Now" : expiringSoon ? "Renew Urgently" : "Renew Now"}
        </Button>
      </Card>
    </Link>
  );
};
