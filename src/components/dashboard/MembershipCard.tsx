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

  return (
    <Link href="/dashboard/membership" className="block group/card focus:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold rounded-2xl">
      <Card
        className={cn(
          "border-white/5 bg-academy-gray/30 backdrop-blur-md p-4 relative overflow-hidden flex flex-col gap-3 transition-all cursor-pointer",
          expiringSoon ? "border-red-500/30 hover:border-red-500/50" : "hover:border-academy-gold/40"
        )}
        role="region"
        aria-labelledby="membership-title"
      >
        <div className={cn(
          "absolute top-0 right-0 w-24 h-24 blur-3xl -z-10 transition-all",
          expiringSoon ? "bg-red-500/10 group-hover/card:bg-red-500/20" : "bg-academy-gold/5 group-hover/card:bg-academy-gold/10"
        )} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="text-academy-gold shrink-0" size={14} aria-hidden="true" />
            <h2 id="membership-title" className="text-[10px] font-black uppercase tracking-widest text-white">
              Membership
            </h2>
          </div>
          <ChevronRight size={12} className="text-gray-600 group-hover/card:text-academy-gold transition-colors" />
        </div>

        {/* Plan name */}
        <p className={cn(
          "text-base font-black uppercase leading-tight",
          (membership as any).plan_type === "pt" ? "text-white" : "text-academy-gold"
        )}>
          {membership.plan}
        </p>

        {/* Status badge */}
        <span
          className={cn(
            "self-start px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
            expiringSoon
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : expiringSoonWarning
              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
              : isActive
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-red-500/10 text-red-500 border-red-500/20"
          )}
          role="status"
        >
          {expiringSoon ? "Expiring Soon!" : membership.status}
        </span>

        {/* Days remaining */}
        {isActive && (
          <div className={cn(
            "flex items-center gap-1.5 text-[10px] font-bold",
            expiringSoon ? "text-red-400" : expiringSoonWarning ? "text-yellow-400" : "text-gray-400"
          )}>
            <Clock size={11} className="shrink-0" />
            {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining` : "Expires today"}
          </div>
        )}

        {/* Expiry date */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 border-t border-white/5 pt-2">
          <Calendar size={11} className={cn("shrink-0", expiringSoon ? "text-red-400" : "text-academy-red")} aria-hidden="true" />
          <time dateTime={membership.expiry_date}>
            {isExpired ? "Expired" : "Valid until"} {expiryFormatted}
          </time>
        </div>

        {/* Expiring-soon warning */}
        {expiringSoon && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest">
            <AlertTriangle size={10} /> Renew before it expires!
          </div>
        )}

        {/* Renew button */}
        <Button
          variant={expiringSoon || isExpired ? "primary" : "secondary"}
          className={cn(
            "w-full h-9 uppercase tracking-widest text-[9px] font-black mt-auto",
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
