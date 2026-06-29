"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { MembershipCard } from "@/components/dashboard/MembershipCard";
import { MatchHistory } from "@/components/dashboard/MatchHistory";
import { UpcomingMatches } from "@/components/dashboard/UpcomingMatches";
import { NoticeBoard } from "@/components/dashboard/NoticeBoard";
import { AttendanceSummary } from "@/components/dashboard/AttendanceSummary";
import { PlayerRecords } from "@/components/dashboard/PlayerRecords";
import { YearlyReport } from "@/components/dashboard/YearlyReport";
import { DashboardLockOverlay } from "@/components/dashboard/DashboardLockOverlay";
import type { Membership } from "@/types/dashboard";

type DashboardData = {
  membership: {
    plan_name: string;
    start_date: string;
    expiry_date: string;
    status: Membership["status"];
    expiring_soon: boolean;
  } | null;
  stats: {
    matches_played: number;
    total_runs: number;
    total_wickets: number;
    role: string;
  };
  matchHistory: Array<{
    id: string;
    opponent: string;
    runs: number;
    wickets: number;
    result: string | null;
    date: string;
    venue: string;
  }>;
  upcomingMatches: Array<{
    id: string;
    teams: string;
    date: string;
    time: string;
    venue: string;
    fee: number;
    joined: boolean;
  }>;
  notices: Array<{
    id: string;
    branch_id: "samarth" | "aims";
    title: string;
    message: string;
    date: string;
    important: boolean;
  }>;
  attendance: {
    present: number;
    absent: number;
    percentage: number;
    entries: Array<{ id: string; user_id: string; branch_id: "samarth" | "aims"; date: string; status: "Present" | "Absent" }>;
  };
  yearlyReport: {
    year: number;
    matches_played: number;
    total_runs: number;
    total_wickets: number;
    attendance: { present: number; absent: number; percentage: number };
    months: Array<{
      month: string;
      matches_played: number;
      runs: number;
      wickets: number;
      present: number;
      absent: number;
    }>;
  };
};

export default function PlayerDashboard() {
  const { user, isLoading, updateSession } = useAuth();
  const router = useRouter();
  const userId = user?.id ?? null;
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Use a ref so updateSession never causes loadDashboard to get a new reference
  const updateSessionRef = useRef(updateSession);
  useEffect(() => { updateSessionRef.current = updateSession; });

  const membershipStatus = user?.membership_status;

  const loadDashboard = useCallback(async (signal?: AbortSignal) => {
    setIsRefreshing(true);
    setPageError(null);
    try {
      const res = await fetch("/api/player/dashboard", {
        cache: "no-store",
        signal
      });
      const data = (await res.json().catch(() => null)) as any;
      if (!res.ok || !data?.ok) {
        setPageError("Could not load your dashboard. Please try again.");
        setDashboard(null);
        return;
      }
      setDashboard(data);

      // Automatically upgrade session if membership status changed in DB
      if (data.membership?.status === "Active" && membershipStatus !== "active") {
        await updateSessionRef.current();
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setPageError("Could not load your dashboard. Please try again.");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [membershipStatus]);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    loadDashboard(controller.signal);
    return () => controller.abort();
  }, [userId, loadDashboard]);

  useEffect(() => {
    if (!showPayment) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPayment(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showPayment]);

  // Only block render on the very first load — never flash the spinner
  // mid-session during re-validates (dashboard state already set).
  if ((isLoading || !user) && !dashboard) {
    return (
      <div className="min-h-screen bg-academy-dark flex items-center justify-center" aria-busy="true" aria-live="polite">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin"></div>
        <span className="sr-only">Loading your dashboard...</span>
      </div>
    );
  }

  if (!user) return null;

  const handleJoinMatch = (id: string) => {
    setIsJoining(id);
    setShowPayment(true);
  };

  const selectedMatch = dashboard?.upcomingMatches.find((m) => m.id === isJoining) ?? null;

  const confirmPayment = async () => {
    if (!isJoining) return;
    setNotice(null);
    setPageError(null);
    setIsPaying(true);
    try {
      const res = await fetch("/api/player/matches/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: isJoining }),
      });
      const data = (await res.json().catch(() => null)) as any;
      if (!res.ok || !data?.ok) {
        setPageError(
          data?.error === "MEMBERSHIP_INACTIVE"
            ? "Your membership must be active to join matches."
            : "Could not join the match. Please try again."
        );
        return;
      }
      setShowPayment(false);
      setIsJoining(null);
      setNotice(data?.status === "ALREADY_JOINED" ? "You are already joined for this match." : "Successfully joined the match.");
      await loadDashboard();
    } finally {
      setIsPaying(false);
    }
  };

  const renewMembership = () => {
    router.push("/membership");
  };

  const membership: Membership | null = dashboard?.membership
    ? {
        id: `mem-${user.id}`,
        user_id: user.id,
        plan: dashboard.membership.plan_name,
        start_date: dashboard.membership.start_date,
        expiry_date: dashboard.membership.expiry_date,
        status: dashboard.membership.status,
      }
    : null;

  return (
    <div className="min-h-screen bg-academy-dark text-white flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-20 relative" id="main-content">
        {/* Membership status banners */}
        {user?.membership_status !== "active" && (
          <div className="mb-8 p-6 rounded-[2rem] bg-gradient-to-r from-academy-red/20 to-academy-gold/20 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-academy-red/20 flex items-center justify-center text-academy-red shrink-0">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">
                  {user?.membership_status === "expired" 
                    ? "Membership Expired" 
                    : user?.membership_status === "rejected"
                    ? "Membership Rejected"
                    : "Membership Required"}
                </h3>
                <p className="text-gray-400 text-xs font-medium max-w-md mt-1">
                  {user?.membership_status === "expired"
                    ? "Your membership has expired. Renew now to regain full access to training, matches, and all features."
                    : user?.membership_status === "rejected"
                    ? "Your membership payment was rejected by the admin. Please contact support or try again with a valid payment."
                    : `Your membership is currently ${user?.membership_status === "none" ? "inactive" : user?.membership_status}. Get a membership to access training, matches, and academy facilities.`}
                </p>
              </div>
            </div>
            <Link href="/membership" className="w-full md:w-auto">
              <Button variant="secondary" className="w-full md:px-8 h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-academy-gold/20">
                {user?.membership_status === "expired" ? "Renew Now" : "Choose a Plan"} <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {/* 3-day expiry warning banner — shown even when active */}
        {user?.membership_status === "active" && dashboard?.membership?.expiring_soon && (() => {
          const daysLeft = dashboard.membership?.expiry_date
            ? Math.ceil((new Date(dashboard.membership.expiry_date).getTime() - Date.now()) / 86400000)
            : null;
          return (
            <div className="mb-8 p-5 rounded-[2rem] bg-gradient-to-r from-red-500/15 to-yellow-500/10 border border-red-500/20 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400 shrink-0 animate-pulse">
                  <Clock size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-red-400">
                    Membership Expiring {daysLeft === 0 ? "Today" : `in ${daysLeft} Day${daysLeft !== 1 ? "s" : ""}`}
                  </h3>
                  <p className="text-gray-400 text-[11px] font-medium mt-0.5">
                    Your membership expires on {new Date(dashboard.membership!.expiry_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}. Renew now to avoid losing access.
                  </p>
                </div>
              </div>
              <Link href="/membership" className="w-full md:w-auto shrink-0">
                <Button variant="secondary" className="w-full md:px-6 h-11 text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 border-red-500/30 shadow-red-500/20">
                  Renew Now <ArrowRight size={13} className="ml-2" />
                </Button>
              </Link>
            </div>
          );
        })()}

        {/* SR live region for notices */}
        <div className="sr-only" aria-live="polite">{notice ?? ""}</div>

        {/* Error banner */}
        {pageError && (
          <div
            className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm font-semibold"
            role="alert"
          >
            {pageError}
          </div>
        )}

        {/* Loading skeleton while first fetch runs */}
        {isRefreshing && !dashboard && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-academy-red border-t-transparent rounded-full animate-spin" />
            <span className="ml-4 text-sm text-gray-400 font-medium">Loading dashboard…</span>
          </div>
        )}

        {/* ── Row 1: Profile header ── */}
        <div className="mb-8">
          <DashboardHeader user={user} membership={membership} onRenew={renewMembership} />
        </div>

        {/* ── Row 2: Stats strip ── */}
        {dashboard && (
          <div className="mb-8">
            <StatsGrid stats={dashboard.stats} />
          </div>
        )}

        {/* ── Row 3: Main content + Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">

          {/* LEFT — main content (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {dashboard && <MatchHistory items={dashboard.matchHistory} />}
            <UpcomingMatches
              matches={dashboard?.upcomingMatches ?? []}
              onJoin={handleJoinMatch}
              membershipStatus={membership?.status}
            />
          </div>

          {/* RIGHT — 2×2 card grid */}
          <div className="grid grid-cols-2 gap-4 items-start">
            <MembershipCard membership={membership} onRenew={renewMembership} />
            {dashboard ? (
              <PlayerRecords matchHistory={dashboard.matchHistory} stats={dashboard.stats} />
            ) : (
              <div />
            )}
            <NoticeBoard notices={dashboard?.notices ?? []} />
            <AttendanceSummary attendance={dashboard?.attendance?.entries ?? []} />
          </div>
        </div>

        {/* ── Row 4: Yearly Report — full width ── */}
        {dashboard?.yearlyReport && (
          <YearlyReport report={dashboard.yearlyReport} />
        )}
      </main>

      {/* ── Payment modal ── */}
      {showPayment && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-modal-title"
        >
          <div
            className="absolute inset-0 bg-academy-dark/80 backdrop-blur-md"
            onClick={() => setShowPayment(false)}
          />
          <Card className="relative z-10 w-full max-w-md p-8 border-white/10 bg-academy-gray shadow-2xl">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-academy-gold/10 rounded-full flex items-center justify-center mx-auto text-academy-gold">
                <CreditCard size={40} aria-hidden="true" />
              </div>
              <div>
                <h3 id="payment-modal-title" className="text-2xl font-black uppercase tracking-tight mb-2 text-white">
                  Secure Payment
                </h3>
                <p className="text-gray-400 text-sm font-medium">
                  Confirming participation for: {selectedMatch?.teams ?? isJoining}
                </p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex justify-between text-xs font-black uppercase">
                  <span className="text-gray-500">Match Fee</span>
                  <span className="text-white">{selectedMatch ? `₹${selectedMatch.fee}.00` : "—"}</span>
                </div>
                <div className="flex justify-between text-xs font-black uppercase border-t border-white/5 pt-3">
                  <span className="text-white">Total Amount</span>
                  <span className="text-academy-gold">{selectedMatch ? `₹${selectedMatch.fee}.00` : "—"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  variant="outline"
                  className="h-12 uppercase tracking-widest text-[10px] font-black border-white/10"
                  onClick={() => setShowPayment(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 uppercase tracking-widest text-[10px] font-black"
                  onClick={confirmPayment}
                  disabled={isPaying}
                >
                  {isPaying ? "Processing…" : "Pay Now"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
