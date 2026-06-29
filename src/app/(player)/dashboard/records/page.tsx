"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Trophy, ArrowLeft, TrendingUp, Target, Star, Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

type MatchHistoryItem = {
  id: string;
  opponent: string;
  runs: number;
  wickets: number;
  result: string | null;
  date: string;
  venue: string;
};

type Stats = {
  matches_played: number;
  total_runs: number;
  total_wickets: number;
  role: string;
};

export default function RecordsPage() {
  const { user, isLoading } = useAuth();
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        setPageError(null);
        const res = await fetch("/api/player/dashboard", { 
          cache: "no-store",
          signal: controller.signal 
        });
        const data = (await res.json().catch(() => null)) as any;
        if (!res.ok || !data?.ok) { setPageError("Could not load records."); return; }
        setMatchHistory(data.matchHistory ?? []);
        setStats(data.stats ?? null);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setPageError("Could not load records.");
        }
      }
    };
    load();
    return () => controller.abort();
  }, [user?.id]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-academy-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const highestRuns = matchHistory.length > 0 ? Math.max(...matchHistory.map((m) => m.runs)) : 0;
  const bestWickets = matchHistory.length > 0 ? Math.max(...matchHistory.map((m) => m.wickets)) : 0;
  const battingAvg = stats && stats.matches_played > 0
    ? (stats.total_runs / stats.matches_played).toFixed(2)
    : "0.00";
  const bowlingAvg = stats && stats.total_wickets > 0
    ? (stats.total_runs / stats.total_wickets).toFixed(2)
    : "N/A";
  const wins = matchHistory.filter((m) => m.result?.toLowerCase().startsWith("won")).length;
  const losses = matchHistory.length - wins;
  const winRate = matchHistory.length > 0 ? Math.round((wins / matchHistory.length) * 100) : 0;

  const bestRunMatch = matchHistory.reduce<MatchHistoryItem | null>(
    (best, m) => (!best || m.runs > best.runs ? m : best), null
  );
  const bestWktMatch = matchHistory.reduce<MatchHistoryItem | null>(
    (best, m) => (!best || m.wickets > best.wickets ? m : best), null
  );

  const careerStats = [
    { label: "Matches Played", value: stats?.matches_played ?? 0, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Total Runs", value: stats?.total_runs ?? 0, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Total Wickets", value: stats?.total_wickets ?? 0, icon: Target, color: "text-academy-gold", bg: "bg-academy-gold/10 border-academy-gold/20" },
    { label: "Player Role", value: stats?.role ?? "—", icon: Star, color: "text-academy-red", bg: "bg-academy-red/10 border-academy-red/20" },
  ];

  const personalBests = [
    { label: "Highest Score", value: `${highestRuns} runs`, sub: bestRunMatch ? `vs ${bestRunMatch.opponent} on ${bestRunMatch.date}` : "—" },
    { label: "Best Bowling", value: `${bestWickets} wkts`, sub: bestWktMatch ? `vs ${bestWktMatch.opponent} on ${bestWktMatch.date}` : "—" },
    { label: "Batting Average", value: battingAvg, sub: "runs per match" },
    { label: "Bowling Average", value: bowlingAvg, sub: stats?.total_wickets ? "runs per wicket" : "no wickets yet" },
    { label: "Matches Won", value: `${wins}`, sub: `${losses} losses · ${winRate}% win rate` },
  ];

  return (
    <div className="min-h-screen bg-academy-dark text-white flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 pt-32 pb-20">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-1 flex items-center gap-3">
            <Trophy className="text-academy-gold" size={32} /> Player Records
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Your complete career statistics and personal bests
          </p>
        </div>

        {pageError && (
          <div className="mb-8 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm font-semibold" role="alert">
            {pageError}
          </div>
        )}

        {/* Career stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {careerStats.map((s) => (
            <Card key={s.label} className={cn("border p-5 text-center backdrop-blur-md", s.bg)}>
              <s.icon size={22} className={cn("mx-auto mb-2", s.color)} />
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Personal bests */}
        <h2 className="text-lg font-black uppercase tracking-widest text-white mb-4">Personal Bests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {personalBests.map((pb) => (
            <Card key={pb.label} className="border-white/5 bg-academy-gray/30 backdrop-blur-md p-5 flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl bg-academy-gold/10 border border-academy-gold/20 flex items-center justify-center shrink-0">
                <Trophy size={18} className="text-academy-gold" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{pb.label}</p>
                <p className="text-lg font-black text-white">{pb.value}</p>
                <p className="text-[10px] text-gray-500 font-medium truncate">{pb.sub}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Match-by-match history */}
        <h2 className="text-lg font-black uppercase tracking-widest text-white mb-4">Match by Match</h2>
        {matchHistory.length === 0 ? (
          <p className="text-gray-500 font-medium text-center py-16">No matches played yet.</p>
        ) : (
          <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px]" aria-label="Match performance history">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <th className="text-left px-6 py-4">Opponent</th>
                    <th className="text-center px-4 py-4">Runs</th>
                    <th className="text-center px-4 py-4">Wkts</th>
                    <th className="text-center px-4 py-4">Result</th>
                    <th className="text-right px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {matchHistory
                    .slice()
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((m) => {
                      const won = m.result?.toLowerCase().startsWith("won");
                      return (
                        <tr key={m.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-xs font-black text-white">{m.opponent}</p>
                            <p className="text-[10px] text-gray-500 font-bold">{m.venue}</p>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-sm font-black text-emerald-400">{m.runs}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-sm font-black text-academy-gold">{m.wickets}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                              won
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-500 border border-red-500/20"
                            )}>
                              {won ? "Won" : "Lost"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-[10px] font-bold text-gray-500">{m.date}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
