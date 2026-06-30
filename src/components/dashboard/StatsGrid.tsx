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
    { label: "Matches", value: stats.matches_played, icon: Activity, color: "from-blue-500 to-blue-700", textColor: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", shadow: "shadow-blue-500/20", aria: `Total matches played: ${stats.matches_played}` },
    { label: "Total Runs", value: stats.total_runs, icon: TrendingUp, color: "from-emerald-500 to-emerald-700", textColor: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", shadow: "shadow-emerald-500/20", aria: `Total runs scored: ${stats.total_runs}` },
    { label: "Wickets", value: stats.total_wickets, icon: Trophy, color: "from-academy-gold to-yellow-600", textColor: "text-academy-gold", bg: "bg-academy-gold/10", border: "border-academy-gold/20", shadow: "shadow-academy-gold/20", aria: `Total wickets taken: ${stats.total_wickets}` },
    { label: "Role", value: stats.role, icon: Star, color: "from-academy-red to-red-700", textColor: "text-academy-red", bg: "bg-academy-red/10", border: "border-academy-red/20", shadow: "shadow-academy-red/20", aria: `Player role: ${stats.role}` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" role="region" aria-label="Player Performance Statistics">
      {statItems.map((stat, i) => (
        <Card 
          key={i} 
          className={cn(
            "relative overflow-hidden bg-academy-gray/40 backdrop-blur-xl p-6 md:p-8 text-center group hover:scale-[1.02] transition-all duration-300 border",
            stat.border,
            stat.shadow
          )}
          aria-label={stat.aria}
        >
          {/* Background gradient accent */}
          <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r", stat.color)} />
          <div className={cn("absolute top-0 right-0 w-32 h-32 blur-3xl -z-10 opacity-50 group-hover:opacity-75 transition-opacity", "bg-" + (stat.color.includes("blue") ? "blue" : stat.color.includes("emerald") ? "emerald" : stat.color.includes("gold") ? "yellow" : "red") + "-500/20")} />
          
          <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg", stat.bg, "border", stat.border)}>
            <stat.icon size={24} className={stat.textColor} aria-hidden="true" />
          </div>
          
          <p className="text-3xl md:text-4xl lg:text-5xl font-black mb-2 text-white tracking-tight">{stat.value}</p>
          <p className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] text-gray-500">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
};
