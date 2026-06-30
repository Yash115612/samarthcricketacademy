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
      className="relative overflow-hidden rounded-[2.5rem] bg-academy-gray/30 border border-white/5 p-8 md:p-10 backdrop-blur-xl"
      aria-labelledby="dashboard-header-title"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-academy-red/10 blur-[100px] -z-10" />
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-academy-red shadow-2xl rotate-[-3deg] relative">
              <Image src="https://i.pravatar.cc/150?u=player1" alt={`${user.name}'s profile`} fill className="object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-academy-gold text-academy-dark rounded-xl flex items-center justify-center shadow-lg" aria-hidden="true">
              <Award size={20} />
            </div>
          </div>

          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 id="dashboard-header-title" className="text-3xl md:text-4xl font-black uppercase tracking-tight truncate w-full text-white">
                {user.name}
              </h1>
              <div className="flex gap-2 shrink-0">
                <span className="px-4 py-1 bg-academy-gold/10 border border-academy-gold/20 rounded-full text-academy-gold text-[10px] font-black uppercase tracking-widest">
                  {user.role}
                </span>
                {user.membership_status && user.membership_status !== "none" && (
                  <span className={cn(
                    "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    user.membership_status === "active"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                      : user.membership_status === "expired" || user.membership_status === "rejected"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-academy-gold/10 text-academy-gold border-academy-gold/20"
                  )}>
                    {user.membership_status === "active"
                      ? (membership as any)?.plan_name || "Active"
                      : user.membership_status}
                  </span>
                )}
              </div>
            </div>

            {(membership as any)?.coach_name && (
              <p className="text-[10px] font-black uppercase tracking-widest text-academy-gold bg-academy-gold/5 border border-academy-gold/20 px-3 py-1.5 rounded-xl inline-block">
                Coach: {(membership as any).coach_name}
              </p>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-academy-red" aria-hidden="true" />
                {user.branch_id === "aims" ? "AIMS Academy" : "Samarth Academy"}
              </span>
              <span className="flex items-center gap-2">
                <CreditCard size={14} className="text-academy-red" aria-hidden="true" />
                ID: SCA-{user.id.toUpperCase()}
              </span>
              {expiryFormatted && (
                <span className={cn(
                  "flex items-center gap-2",
                  isExpiringSoon ? "text-red-400" : "text-gray-500"
                )}>
                  <Clock size={14} className={isExpiringSoon ? "text-red-400" : "text-academy-red"} aria-hidden="true" />
                  Valid until {expiryFormatted}
                  {daysLeft !== null && daysLeft >= 0 && (
                    <span className={cn(
                      "ml-1 px-2 py-0.5 rounded-full text-[9px] font-black border",
                      daysLeft <= 3
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : daysLeft <= 7
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {daysLeft === 0 ? "Expires today" : `${daysLeft}d left`}
                    </span>
                  )}
                </span>
              )}
            </div>

            {isExpiringSoon && (
              <div
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse"
                role="alert"
              >
                <AlertCircle size={14} aria-hidden="true" />
                Membership expiring in {daysLeft === 0 ? "less than a day" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""}`} — Renew now!
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
          <Button
            variant="secondary"
            className={cn(
              "h-14 px-8 uppercase tracking-widest text-xs font-black shadow-xl",
              isExpiringSoon
                ? "shadow-red-500/20 bg-red-600 hover:bg-red-500 border-red-500/30"
                : "shadow-academy-gold/20"
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
              className="w-full sm:w-48 h-14 uppercase tracking-widest text-xs font-black bg-white/5 border-white/10 hover:bg-white/10"
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
