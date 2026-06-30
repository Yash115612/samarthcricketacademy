import React from "react";
import { Activity, TrendingUp, Trophy, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatsGridProps {
  stats: {
    matches_played: number;
    total_runs: number;
    total_wickets: number;
    role: string;
  };
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const statItems = [
    { label: "Matches", value: stats.matches_played, icon: Activity, color: "text-blue-500", aria: `Total matches played: ${stats.matches_played}` },
    { label: "Total Runs", value: stats.total_runs, icon: TrendingUp, color: "text-emerald-500", aria: `Total runs scored: ${stats.total_runs}` },
    { label: "Wickets", value: stats.total_wickets, icon: Trophy, color: "text-academy-gold", aria: `Total wickets taken: ${stats.total_wickets}` },
    { label: "Role", value: stats.role, icon: Star, color: "text-academy-red", aria: `Player role: ${stats.role}` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="region" aria-label="Player Performance Statistics">
      {statItems.map((stat, i) => (
        <Card 
          key={i} 
          className="border-white/5 bg-academy-gray/30 backdrop-blur-md p-6 text-center group hover:border-white/20 transition-all"
          aria-label={stat.aria}
        >
          <stat.icon size={24} className={cn("mx-auto mb-3", stat.color)} aria-hidden="true" />
          <p className="text-2xl font-black mb-1 text-white">{stat.value}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
};
