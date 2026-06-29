"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Trophy,
  Calendar,
  MapPin,
  Search,
  Filter,
  Users,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LiveScorecard } from "@/components/scoring/LiveScorecard";

const TABS = ["Live", "Completed", "Upcoming"];

// ── Main Page ────────────────────────────────────────────────────────────────

function MatchesPageContent() {
  const searchParams = useSearchParams();
  const branchFromUrl = searchParams.get("branch") as "samarth" | "aims" | null;
  const [activeTab, setActiveTab] = useState("Live");
  const [selectedBranch, setSelectedBranch] = useState(branchFromUrl || "samarth");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const fetchMatches = async () => {
      try {
        const res = await fetch(`/api/public/matches?branch=${selectedBranch}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        if (data.ok) {
          const mapped = (data.matches as any[]).map((m) => {
            const parts = (m.teams as string).split(" vs ");
            return {
              ...m,
              teamA: parts[0]?.trim() ?? m.teams,
              teamB: parts[1]?.trim() ?? "",
              type: m.status,
            };
          });
          setMatches(mapped);
        } else {
          setError("Failed to load matches.");
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Match fetch error:", err);
          setError("Could not load matches. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    return () => controller.abort();
  }, [selectedBranch, isMounted, retryCount]);

  const filteredMatches = matches.filter((m) => m.status === activeTab);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-academy-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24">
      <Navbar />

      {/* Page Header */}
      <section className="py-20 px-6 bg-gradient-to-b from-academy-gold/10 to-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          {/* Branch selector */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all">
                <MapPin size={16} className="text-academy-gold" />
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  {selectedBranch === "samarth"
                    ? "Samarth Academy (Pune)"
                    : "AIMS Academy (Mumbai)"}
                </span>
                <ChevronDown
                  size={14}
                  className="text-gray-500 group-hover:text-academy-gold transition-transform group-hover:rotate-180"
                />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-academy-gray border border-white/10 rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {(["samarth", "aims"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBranch(b)}
                    className={cn(
                      "w-full text-left block px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors",
                      selectedBranch === b ? "text-academy-gold bg-white/5" : "text-gray-400"
                    )}
                  >
                    {b === "samarth" ? "Samarth Academy (Pune)" : "AIMS Academy (Mumbai)"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-7xl font-black mb-6 uppercase tracking-tight text-white">
            LIVE MATCHES
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Watch the stars of tomorrow in action. Follow live scores, catch up on completed match
            results, and stay updated with upcoming fixtures.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="sticky top-24 z-40 bg-academy-dark/80 backdrop-blur-xl border-b border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 md:px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === tab
                    ? "bg-academy-red text-white shadow-lg shadow-academy-red/20"
                    : "text-gray-500 hover:text-white"
                )}
              >
                {tab}
                {tab === "Live" && matches.filter((m) => m.status === "Live").length > 0 && (
                  <span className="ml-2 inline-block w-2 h-2 bg-academy-red rounded-full animate-pulse align-middle" />
                )}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4 text-gray-500">
            <Search size={18} />
            <Filter size={18} />
          </div>
        </div>
      </section>

      {/* Matches */}
      <section className="py-24 px-6 min-h-[600px]">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Loading Matches…
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
              <p className="text-sm font-black uppercase tracking-widest text-academy-red">{error}</p>
              <button
                onClick={() => setRetryCount((c) => c + 1)}
                className="px-6 py-2 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 transition-all"
              >
                Retry
              </button>
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {filteredMatches.map((match) => (
                <Card
                  key={match.id}
                  className="group overflow-hidden border-white/5 hover:border-academy-red/50 transition-all duration-500 bg-academy-gray/50 backdrop-blur-xl"
                >
                  <CardContent className="p-0">
                    <div className="p-4 md:p-10 space-y-6 md:space-y-10">
                      {/* Status badges */}
                      <div className="flex flex-wrap items-center gap-6">
                        <span
                          className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                            match.status === "Live"
                              ? "bg-academy-red/10 text-academy-red animate-pulse"
                              : "bg-white/10 text-gray-400"
                          )}
                        >
                          {match.status} Match
                        </span>
                        {match.live_link && (
                          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-academy-gold">
                            <Trophy size={12} /> CricHeroes
                          </span>
                        )}
                      </div>

                      {/* Team names */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="text-center md:text-left space-y-2">
                          <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white">
                            {match.teamA}
                          </h3>
                        </div>
                        <div className="text-xl md:text-2xl font-black italic text-gray-600">VS</div>
                        <div className="text-center md:text-right space-y-2">
                          <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white">
                            {match.teamB}
                          </h3>
                        </div>
                      </div>

                      {/* Live scorecard — in-app scoring takes priority */}
                      {match.status === "Live" && (
                        <div className="border border-academy-red/20 rounded-2xl p-6 bg-academy-red/5">
                          <div className="flex items-center gap-2 mb-5">
                            <span className="w-2 h-2 bg-academy-red rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-academy-red">
                              Live Score
                            </span>
                          </div>
                          <LiveScorecard matchId={match.id} liveLink={match.live_link} />

                          {/* CricHeroes fallback link */}
                          {match.live_link && (
                            <Link
                              href={match.live_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-academy-gold/10 hover:bg-academy-gold/20 border border-academy-gold/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-academy-gold transition-all group"
                            >
                              <ExternalLink size={11} className="group-hover:scale-110 transition-transform" />
                              Open Full Scorecard on CricHeroes
                            </Link>
                          )}
                        </div>
                      )}

                      {/* Result for completed matches */}
                      {match.status === "Completed" && match.result && (
                        <div className="px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          <p className="text-sm font-black uppercase tracking-widest text-emerald-400 text-center">
                            {match.result}
                          </p>
                        </div>
                      )}

                      {/* Completed: scorecard link */}
                      {match.status === "Completed" && match.live_link && (
                        <Link
                          href={match.live_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-academy-gold hover:underline"
                        >
                          <ExternalLink size={12} /> View Full Scorecard on CricHeroes
                        </Link>
                      )}

                      {/* Venue & time */}
                      <div className="flex flex-wrap items-center gap-10 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <MapPin size={18} className="text-academy-red" />
                          <div>
                            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Venue</span>
                            <span className="text-sm font-bold text-white">{match.venue}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar size={18} className="text-academy-red" />
                          <div>
                            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Date & Time</span>
                            <span className="text-sm font-bold text-white">
                              {match.date} {match.time && `· ${match.time}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                <Users size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  No {activeTab} Matches
                </h3>
                <p className="text-gray-500 max-w-sm font-medium italic">
                  Check back later or explore other categories.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 text-center">
            {[
              { label: "Matches Played", val: "1,240+" },
              { label: "Tournaments", val: "45+" },
              { label: "Win Rate", val: "68%" },
              { label: "Players", val: "500+" },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-4xl font-black text-white italic">{stat.val}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-academy-red">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function MatchesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-academy-dark flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MatchesPageContent />
    </Suspense>
  );
}
