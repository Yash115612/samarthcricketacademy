"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { Footer } from "@/components/layout/Footer";
import { Calendar, MapPin, Search, Filter, PlayCircle, ExternalLink, RefreshCw, Radio, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface InningsScore {
  team: string;
  runs: number;
  wickets: number;
  overs: string;
  isCurrent: boolean;
}

interface LiveScoreData {
  ok: boolean;
  status: string;
  innings: InningsScore[];
  result: string | null;
  fetched_at: string;
}

type DashboardSnapshot = {
  membership: { status: "Active" | "Expired" | "Pending" } | null;
  matchHistory: Array<{ id: string; opponent: string; runs: number; wickets: number; result: string | null; date: string; venue: string }>;
  upcomingMatches: Array<{ id: string; teams: string; date: string; time: string; venue: string; fee: number; joined: boolean; live_link?: string }>;
  liveMatches: Array<{ id: string; teams: string; date: string; time: string; venue: string; fee: number; joined: boolean; live_link?: string }>;
};

// ── LiveBallByBallPanel — aggressive polling text-based score ───────────────

function LiveBallByBallPanel({ liveLink }: { liveLink: string }) {
  const [data, setData] = useState<LiveScoreData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [nextRetryIn, setNextRetryIn] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchRef = useRef<() => void>(() => {});
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const POLL_INTERVAL_MS = 5_000;
  const MAX_RETRIES = 5;

  const scheduleRetry = (attempt: number) => {
    if (!isMountedRef.current) return;
    const delay = Math.min(1000 * Math.pow(2, attempt), 30_000);
    setNextRetryIn(Math.ceil(delay / 1000));
    retryTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) fetchRef.current();
    }, delay);
  };

  const fetchScore = async () => {
    if (!isMountedRef.current) return;
    setFetching(true);
    setError(false);
    try {
      const res = await fetch(
        `/api/public/live-score?url=${encodeURIComponent(liveLink)}`,
        { cache: "no-store" }
      );
      if (!isMountedRef.current) return;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: LiveScoreData = await res.json();
      if (!isMountedRef.current) return;
      if (json.ok) {
        setData(json);
        setLastUpdated(new Date());
        setRetryCount(0);
        setNextRetryIn(0);
      } else {
        throw new Error("Invalid response");
      }
    } catch {
      if (!isMountedRef.current) return;
      setError(true);
      if (retryCount < MAX_RETRIES) {
        scheduleRetry(retryCount);
        setRetryCount((c) => c + 1);
      }
    } finally {
      if (isMountedRef.current) setFetching(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchScore();
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? POLL_INTERVAL_MS / 1000 : c - 1));
    }, 1000);
    fetchRef.current = fetchScore;
    const pollId = setInterval(() => {
      if (isMountedRef.current) {
        fetchRef.current();
        setCountdown(POLL_INTERVAL_MS / 1000);
      }
    }, POLL_INTERVAL_MS);
    return () => {
      isMountedRef.current = false;
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      clearInterval(pollId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveLink]);

  const freshnessLabel = lastUpdated
    ? `Updated ${lastUpdated.toLocaleTimeString()}`
    : fetching
      ? "Connecting…"
      : "Waiting for data…";

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle size={12} className="text-red-400 shrink-0" />
          <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">
            {retryCount > 0
              ? `Retry ${retryCount}/${MAX_RETRIES} in ${nextRetryIn}s…`
              : "Update failed. Retrying…"}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Radio size={10} className="text-academy-red animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-academy-red">
            Live Ball-by-Ball
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {fetching && <RefreshCw size={9} className="text-gray-500 animate-spin" />}
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
            {freshnessLabel} · Next {countdown}s
          </span>
        </div>
      </div>
      {data?.innings && data.innings.length > 0 ? (
        <div className="space-y-1.5">
          {data.innings.map((inn, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg border text-[10px]",
                inn.isCurrent
                  ? "bg-academy-red/10 border-academy-red/30"
                  : "bg-white/5 border-white/5"
              )}
            >
              <div className="flex items-center gap-1.5">
                {inn.isCurrent && (
                  <span className="w-1 h-1 bg-academy-red rounded-full animate-pulse" />
                )}
                <span className="font-black uppercase tracking-tight text-white">
                  {inn.team}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-academy-gold leading-none">
                  {inn.runs}/{inn.wickets}
                </span>
                <span className="text-[9px] font-bold text-gray-400">
                  ({inn.overs} ov)
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : !fetching && !error ? (
        <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl">
          <RefreshCw size={10} className="text-gray-500 animate-spin" />
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
            Loading live score…
          </span>
        </div>
      ) : null}
      {data?.result && (
        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 text-center py-1">
          {data.result}
        </p>
      )}
      <Link
        href={liveLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-academy-gold/10 hover:bg-academy-gold/20 border border-academy-gold/30 rounded-lg text-[9px] font-black uppercase tracking-widest text-academy-gold transition-all group"
      >
        <ExternalLink size={10} className="group-hover:scale-110 transition-transform" />
        Full Scorecard
      </Link>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PlayerMatchesPage() {
  const { user, isLoading } = useAuth();
  const userId = user?.id ?? null;
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "live">("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async () => {
      try {
        setPageError(null);
        const res = await fetch("/api/player/dashboard", { cache: "no-store" });
        if (cancelled) return;
        const data = (await res.json().catch(() => null)) as any;
        if (!res.ok || !data?.ok) {
          if (!cancelled) setPageError("Could not load matches.");
          return;
        }
        if (!cancelled) {
          setSnapshot({
            membership: data.membership,
            matchHistory: data.matchHistory ?? [],
            upcomingMatches: data.upcomingMatches ?? [],
            liveMatches: data.liveMatches ?? [],
          });
        }
      } catch {
        if (!cancelled) setPageError("Could not load matches.");
      }
    };

    load();
    return () => { cancelled = true; };
  }, [userId]);

  const membershipStatus = snapshot?.membership?.status ?? null;

  const matches = useMemo(() => {
    const upcoming = (snapshot?.upcomingMatches ?? []).map((m) => ({
      id: m.id,
      type: "Upcoming" as const,
      teams: m.teams,
      teamA: m.teams.split(" vs ")[0] ?? m.teams,
      teamB: m.teams.split(" vs ")[1] ?? "",
      venue: m.venue,
      date: m.date,
      time: m.time,
      fee: m.fee,
      joined: m.joined,
      result: null as string | null,
      runs: null as number | null,
      wickets: null as number | null,
      live_link: m.live_link,
    }));
    const live = (snapshot?.liveMatches ?? []).map((m) => ({
      id: m.id,
      type: "Live" as const,
      teams: m.teams,
      teamA: m.teams.split(" vs ")[0] ?? m.teams,
      teamB: m.teams.split(" vs ")[1] ?? "",
      venue: m.venue,
      date: m.date,
      time: m.time,
      fee: m.fee,
      joined: m.joined,
      result: null as string | null,
      runs: null as number | null,
      wickets: null as number | null,
      live_link: m.live_link,
    }));
    const completed = (snapshot?.matchHistory ?? []).map((m) => ({
      id: m.id,
      type: "Completed" as const,
      teams: m.opponent,
      teamA: m.opponent.split(" vs ")[0] ?? m.opponent,
      teamB: m.opponent.split(" vs ")[1] ?? "",
      venue: m.venue,
      date: m.date,
      time: "",
      fee: 0,
      joined: true,
      result: m.result,
      runs: m.runs,
      wickets: m.wickets,
      live_link: undefined as string | undefined,
    }));
    const all = [...live, ...upcoming, ...completed];
    const q = query.trim().toLowerCase();
    return all.filter((m) => {
      if (filter !== "all" && m.type.toLowerCase() !== filter) return false;
      if (!q) return true;
      return (
        m.teams.toLowerCase().includes(q) ||
        m.venue.toLowerCase().includes(q) ||
        m.date.toLowerCase().includes(q)
      );
    });
  }, [snapshot, query, filter]);

  const joinMatch = async (matchId: string) => {
    setNotice(null);
    setPageError(null);
    setIsJoining(matchId);
    try {
      const res = await fetch("/api/player/matches/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId }),
      });
      const data = (await res.json().catch(() => null)) as any;
      if (!res.ok || !data?.ok) {
        setPageError(
          data?.error === "MEMBERSHIP_INACTIVE"
            ? "Your membership must be active to join matches."
            : "Could not join match."
        );
        return;
      }
      setNotice(
        data?.status === "ALREADY_JOINED"
          ? "You are already joined for this match."
          : "Successfully joined the match."
      );
      const refresh = await fetch("/api/player/dashboard", { cache: "no-store" });
      const refreshed = (await refresh.json().catch(() => null)) as any;
      if (refresh.ok && refreshed?.ok) {
        setSnapshot({
          membership: refreshed.membership,
          matchHistory: refreshed.matchHistory ?? [],
          upcomingMatches: refreshed.upcomingMatches ?? [],
          liveMatches: refreshed.liveMatches ?? [],
        });
      }
    } finally {
      setIsJoining(null);
    }
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
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 text-center md:text-left">
          <div className="w-full md:w-auto">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">My Matches</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">
              Track your match schedule and career statistics
            </p>
          </div>
        </div>

        <div className="sr-only" aria-live="polite">{notice ?? ""}</div>

        {pageError && (
          <div
            className="mb-8 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm font-semibold"
            role="alert"
          >
            {pageError}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-12">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search matches…"
              className="pl-12 h-14 bg-white/5 border-white/10 w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {(["all", "live", "upcoming", "completed"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "secondary" : "outline"}
                className="h-14 px-6 uppercase tracking-widest text-[10px] font-black bg-white/5 border-white/10 hover:bg-white/10 flex-1 md:flex-none"
                onClick={() => setFilter(f)}
              >
                {f === "all" && <Filter size={14} className="mr-2" />}
                {f === "all" ? "All" : f === "completed" ? "History" : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Match Cards */}
        <div className="grid grid-cols-1 gap-8">
          {matches.map((match) => (
            <Card
              key={match.id}
              className="group overflow-hidden border-white/5 bg-academy-gray/30 backdrop-blur-md"
            >
              <div className="p-8 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div
                    className={cn(
                      "text-[10px] font-black uppercase px-3 py-1 rounded-full border",
                      match.type === "Live"
                        ? "bg-academy-red/10 text-academy-red border-academy-red/20 animate-pulse"
                        : match.type === "Upcoming"
                        ? "bg-academy-gold/10 text-academy-gold border-academy-gold/20"
                        : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}
                  >
                    {match.type}
                  </div>
                  {(match.type === "Upcoming" || match.type === "Live") && (
                    <div className="text-right">
                      <span className="text-lg font-black">{match.fee > 0 ? `₹${match.fee}` : "FREE"}</span>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fee</p>
                    </div>
                  )}
                </div>

                {/* Teams */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-black uppercase tracking-tight">{match.teamA}</h3>
                  </div>
                  <div className="text-xl font-black text-gray-600 italic">VS</div>
                  <div className="flex-1 text-center md:text-right">
                    <h3 className="text-2xl font-black uppercase tracking-tight">{match.teamB}</h3>
                  </div>
                </div>

                {/* Live embed (iframe) */}
                {match.type === "Live" && match.live_link && (
                  <div className="border border-academy-red/20 rounded-2xl p-5 bg-academy-red/5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 bg-academy-red rounded-full animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-academy-red">
                        Live Score — Auto-updating
                      </span>
                    </div>
                    <LiveBallByBallPanel liveLink={match.live_link} />
                  </div>
                )}

                {/* Date & Venue */}
                <div className="flex flex-wrap gap-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Calendar size={14} className="text-academy-red" />
                    {match.type === "Completed" ? match.date : `${match.date} • ${match.time}`}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <MapPin size={14} className="text-academy-red" />
                    {match.venue}
                  </div>
                </div>

                {/* Action */}
                {match.type === "Completed" ? (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs font-black uppercase tracking-widest text-academy-gold text-center">
                      {match.result ?? "Completed"}
                    </p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
                      Runs: {match.runs ?? 0} • Wickets: {match.wickets ?? 0}
                    </p>
                  </div>
                ) : match.type === "Live" && match.live_link ? (
                  <Link href={match.live_link} target="_blank" className="w-full block">
                    <Button className="w-full h-12 bg-academy-gold hover:bg-yellow-600 text-black uppercase tracking-widest text-[10px] font-black shadow-lg shadow-academy-gold/20">
                      <PlayCircle size={14} className="mr-2" /> Full Scorecard on CricHeroes
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full h-12 uppercase tracking-widest text-[10px] font-black shadow-lg shadow-academy-red/10"
                    onClick={() => joinMatch(match.id)}
                    disabled={membershipStatus !== "Active" || match.joined || isJoining === match.id}
                  >
                    {match.joined
                      ? "Joined"
                      : membershipStatus !== "Active"
                      ? "Membership Inactive"
                      : isJoining === match.id
                      ? "Joining…"
                      : "Join Match"}
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {matches.length === 0 && (
            <div className="py-24 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">
              No matches found
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
