import React from "react";
import { Trophy, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

interface MatchHistoryItem {
  id: string;
  opponent: string;
  runs: number;
  wickets: number;
  result: string | null;
  date: string;
  venue: string;
}

interface PlayerRecordsProps {
  matchHistory: MatchHistoryItem[];
  stats: {
    matches_played: number;
    total_runs: number;
    total_wickets: number;
    role: string;
  };
}

export const PlayerRecords: React.FC<PlayerRecordsProps> = ({ matchHistory, stats }) => {
  const highestRuns = matchHistory.length > 0 ? Math.max(...matchHistory.map((m) => m.runs)) : 0;
  const bestWickets = matchHistory.length > 0 ? Math.max(...matchHistory.map((m) => m.wickets)) : 0;
  const battingAvg =
    stats.matches_played > 0 ? (stats.total_runs / stats.matches_played).toFixed(1) : "0.0";
  const winCount = matchHistory.filter((m) => m.result?.toLowerCase()?.startsWith("won")).length;

  const records = [
    { label: "High Score", value: String(highestRuns), sub: "runs" },
    { label: "Best Wkts", value: String(bestWickets), sub: "wkts" },
    { label: "Bat Avg", value: battingAvg, sub: "/match" },
    { label: "Wins", value: String(winCount), sub: `of ${stats.matches_played}` },
  ];

  return (
    <Link href="/dashboard/records" className="block group/card focus:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold rounded-2xl">
      <Card
        className="border-white/5 bg-academy-gray/40 backdrop-blur-xl p-4 flex flex-col gap-3 hover:border-academy-gold/40 transition-all cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
        role="region"
        aria-labelledby="records-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="text-academy-gold shrink-0" size={14} aria-hidden="true" />
            <h2 id="records-title" className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
              Player Records
            </h2>
          </div>
          <ChevronRight size={12} className="text-gray-600 group-hover/card:text-academy-gold transition-colors" />
        </div>

        {/* 2×2 stat grid */}
        <div className="grid grid-cols-2 gap-2">
          {records.map((rec) => (
            <div key={rec.label} className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-academy-gold leading-none">{rec.value}</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-1">{rec.sub}</p>
              <p className="text-[8px] font-bold text-gray-600 mt-1">{rec.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </Link>
  );
};
