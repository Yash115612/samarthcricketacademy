import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  trend: string;
  isUp: boolean;
  href: string;
}

interface AdminStatsGridProps {
  stats: StatItem[];
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Link key={i} href={stat.href}>
          <Card className="p-6 md:p-8 border-white/5 bg-academy-gray/30 backdrop-blur-xl relative overflow-hidden group cursor-pointer hover:border-white/20 transition-all rounded-[2rem]">
            <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", stat.color)}>
              <stat.icon size={28} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-white">{stat.value}</h3>
              </div>
              <div className={cn("flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full", 
                stat.isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
