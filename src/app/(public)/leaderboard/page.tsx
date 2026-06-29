"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Trophy, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Overall", "Batsman", "Bowler", "All-rounder"];

type LeaderboardEntry = Record<string, string | number>;
type LeaderboardData = Record<string, LeaderboardEntry[]>;

export default function LeaderboardPage() {
  const [activeCategory, setActiveCategory] = useState("Overall");
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch("/api/public/leaderboard?branch=samarth", { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) {
          setData({
            Overall: json.Overall,
            Batsman: json.Batsman,
            Bowler: json.Bowler,
            "All-rounder": json["All-rounder"],
          });
        } else {
          setError("Failed to load leaderboard.");
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError("Could not load leaderboard.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const currentData: LeaderboardEntry[] = data?.[activeCategory] ?? [];

  const SKIP_KEYS = ["rank", "name", "image", "userId"];

  return (
    <main className="min-h-screen pt-24">
      <Navbar />

      {/* Page Header */}
      <section className="py-20 px-6 bg-gradient-to-b from-academy-gold/10 to-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight">PLAYER LEADERBOARD</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Celebrate the top performers of Samarth Cricket Academy.
            Rankings updated in real time.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all",
                  activeCategory === cat
                    ? "bg-academy-gold text-academy-dark shadow-xl shadow-academy-gold/20"
                    : "bg-academy-gray border border-white/10 text-gray-500 hover:text-white hover:border-white/20"
                )}
              >
                Top {cat}s
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-32">
              <RefreshCw size={24} className="animate-spin text-academy-gold" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-academy-red">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && currentData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
              <Trophy size={48} className="text-gray-600" />
              <p className="text-sm font-black uppercase tracking-widest text-gray-500">
                No rankings yet — play some matches!
              </p>
            </div>
          )}

          {/* Leaderboard */}
          {!loading && !error && currentData.length > 0 && (
            <div className="space-y-6">
              {/* Top 3 Podium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {currentData.slice(0, 3).map((player, i) => {
                  const colors = [
                    "border-academy-gold shadow-academy-gold/10 scale-110",
                    "border-gray-400 shadow-gray-400/10",
                    "border-orange-500 shadow-orange-500/10",
                  ];
                  const rankText = ["1ST", "2ND", "3RD"];
                  return (
                    <Card key={player.rank} className={cn("p-10 text-center relative overflow-visible transition-all duration-500 bg-academy-gray/50 backdrop-blur-xl", colors[i])}>
                      <div className={cn(
                        "absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-academy-dark",
                        i === 0 ? "bg-academy-gold" : i === 1 ? "bg-gray-400" : "bg-orange-500"
                      )}>
                        {rankText[i]}
                      </div>
                      <div className={cn(
                        "w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-black text-academy-dark",
                        i === 0 ? "bg-academy-gold" : i === 1 ? "bg-gray-400" : "bg-orange-500"
                      )}>
                        {String(player.name).charAt(0).toUpperCase()}
                      </div>
                      <h4 className="text-2xl font-black uppercase tracking-tight mb-4">{player.name}</h4>
                      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                        {Object.entries(player).map(([key, value], idx) => {
                          if (SKIP_KEYS.includes(key)) return null;
                          return (
                            <div key={idx} className="text-center">
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">{key}</span>
                              <span className="text-xl font-black text-academy-gold">{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Remaining Players List */}
              {currentData.slice(3).length > 0 && (
                <div className="space-y-4">
                  {currentData.slice(3).map((player) => (
                    <div key={player.rank} className="card p-6 flex items-center gap-8 group hover:border-white/20 transition-all bg-academy-gray/30 backdrop-blur-md">
                      <div className="w-12 text-2xl font-black text-gray-600 group-hover:text-white transition-colors">
                        #{player.rank}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-black text-white shrink-0">
                        {String(player.name).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-lg font-black uppercase tracking-tight truncate">{player.name}</h5>
                      </div>
                      <div className="hidden md:flex gap-12 text-right">
                        {Object.entries(player).map(([key, value], idx) => {
                          if (SKIP_KEYS.includes(key)) return null;
                          return (
                            <div key={idx} className="w-20">
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">{key}</span>
                              <span className="text-lg font-black">{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
