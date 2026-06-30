import React from "react";
import Image from "next/image";
import { Award, MapPin, CreditCard, AlertCircle, Edit2, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { User as UserType, Membership } from "@/types/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  user: UserType;
  membership: Membership | null;
  onRenew?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, membership, onRenew }) => {
  const daysLeft = (() => {
    if (!membership?.expiry_date) return null;
    const diff = new Date(membership.expiry_date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
  const expiryFormatted = membership?.expiry_date
    ? new Date(membership.expiry_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <section
      className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-academy-gray/60 to-academy-dark/80 border border-white/10 p-6 md:p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
      aria-labelledby="dashboard-header-title"
    >
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-academy-red/15 blur-[120px] rounded-full -z-10" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-academy-gold/10 blur-[120px] rounded-full -z-10" />
      
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
        <div className="flex flex-col lg:flex-row items-center gap-6 text-center lg:text-left">
          {/* Player ID Photo Section */}
          <div className="relative">
            <div className="relative w-28 h-28 md:w-36 md:h-36">
              <div className="absolute inset-0 bg-gradient-to-br from-academy-red to-academy-gold rounded-full blur-sm opacity-70" />
              <Image 
                src="https://i.pravatar.cc/150?u=player1" 
                alt={`${user.name}'s profile`} 
                fill 
                className="object-cover rounded-full border-4 border-academy-dark shadow-[0_0_30px_rgba(244,63,94,0.4)]"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-academy-gold to-yellow-600 text-academy-dark rounded-full flex items-center justify-center shadow-lg shadow-academy-gold/40" aria-hidden="true">
              <Award size={20} />
            </div>
          </div>

          <div className="space-y-4 flex-1 min-w-0">
            <div className="flex flex-col items-center lg:items-start gap-3">
              <div className="flex flex-col items-center lg:items-start gap-2">
                <h1 id="dashboard-header-title" className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight truncate w-full text-white">
                  {user.name}
                </h1>
                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                  <span className="px-4 py-1.5 bg-academy-gold/15 border border-academy-gold/30 rounded-full text-academy-gold text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {user.role}
                  </span>
                  {user.membership_status && user.membership_status !== "none" && (
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                      user.membership_status === "active"
                        ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 shadow-emerald-500/10"
                        : user.membership_status === "expired" || user.membership_status === "rejected"
                        ? "bg-red-500/15 text-red-400 border-red-500/30"
                        : "bg-academy-gold/15 text-academy-gold border-academy-gold/30"
                    )}>
                      {user.membership_status === "active"
                        ? (membership as any)?.plan_name || "Active"
                        : user.membership_status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {(membership as any)?.coach_name && (
              <p className="text-[11px] font-black uppercase tracking-widest text-academy-gold bg-academy-gold/10 border border-academy-gold/25 px-4 py-2 rounded-xl inline-block">
                Coach: {(membership as any).coach_name}
              </p>
            )}

            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-xs font-bold uppercase tracking-widest text-gray-400">
              <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <MapPin size={16} className="text-academy-red" aria-hidden="true" />
                {user.branch_id === "aims" ? "AIMS Academy" : "Samarth Academy"}
              </span>
              <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <CreditCard size={16} className="text-academy-red" aria-hidden="true" />
                <span className="font-mono">SCA-{user.id.toUpperCase()}</span>
              </span>
              {expiryFormatted && (
                <span className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border",
                  isExpiringSoon 
                    ? "bg-red-500/10 text-red-400 border-red-500/25" 
                    : "bg-white/5 text-gray-400 border-white/10"
                )}>
                  <Clock size={16} className={isExpiringSoon ? "text-red-400" : "text-academy-red"} aria-hidden="true" />
                  Valid until {expiryFormatted}
                  {daysLeft !== null && daysLeft >= 0 && (
                    <span className={cn(
                      "ml-1 px-2.5 py-1 rounded-full text-[9px] font-black border",
                      daysLeft <= 3
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : daysLeft <= 7
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    )}>
                      {daysLeft === 0 ? "Expires today" : `${daysLeft}d left`}
                    </span>
                  )}
                </span>
              )}
            </div>

            {isExpiringSoon && (
              <div
                className="flex items-center justify-center lg:justify-start gap-2 px-4 py-3 bg-red-500/15 border border-red-500/25 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse"
                role="alert"
              >
                <AlertCircle size={16} aria-hidden="true" />
                Membership expiring in {daysLeft === 0 ? "less than a day" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""}`} — Renew now!
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
          <Button
            variant="secondary"
            className={cn(
              "h-14 px-8 uppercase tracking-widest text-xs font-black shadow-xl",
              isExpiringSoon
                ? "shadow-red-500/25 bg-red-600 hover:bg-red-500 border-red-500/35"
                : "shadow-academy-gold/25"
            )}
            aria-label="Renew your membership"
            onClick={onRenew}
          >
            {isExpiringSoon ? "Renew Urgently" : "Renew Membership"}
            <CreditCard className="ml-2" size={18} aria-hidden="true" />
          </Button>
          <Link href="/dashboard/profile" prefetch={false} className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-48 h-14 uppercase tracking-widest text-xs font-black bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              aria-label="Edit your profile"
            >
              Edit Profile <Edit2 className="ml-2" size={18} aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
