import React from "react";
import { Trophy, CalendarCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MatchHistoryProps {
  items: Array<{
    id: string;
    opponent: string;
    runs: number;
    wickets: number;
    result: string | null;
    date: string;
    venue: string;
  }>;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ items }) => {
  return (
    <Card className="border-white/5 bg-academy-gray/40 backdrop-blur-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.25)] rounded-2xl h-full" role="region" aria-labelledby="history-title">
      <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between p-6">
        <CardTitle id="history-title" className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-white">
          <Trophy className="text-academy-gold" size={20} aria-hidden="true" /> Match History
        </CardTitle>
        <Link href="/dashboard/matches">
          <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white" aria-label="View all matches">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 mb-3 rounded-full bg-academy-gold/10 border border-academy-gold/20 flex items-center justify-center">
              <CalendarCheck className="text-academy-gold" size={24} />
            </div>
            <p className="text-sm font-black text-white mb-1">No matches yet</p>
            <p className="text-[11px] text-gray-400 font-medium">Join your first match!</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <caption className="sr-only">List of your recently played matches and performance</caption>
              <tbody className="divide-y divide-white/5">
                {items.map((match) => {
                  const isWon = match.result?.toLowerCase()?.includes("won");
                  
                  return (
                    <tr key={match.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div 
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px]",
                              isWon ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                            )}
                            aria-hidden="true"
                          >
                            {isWon ? "W" : "L"}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-tight text-white">{match.opponent}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{match.venue}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-4">
                          <div className="text-center">
                            <p className="text-xs font-black text-white">{match.runs}</p>
                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Runs</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-black text-white">{match.wickets}</p>
                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Wkts</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <time className="text-[10px] text-gray-500 font-black uppercase tracking-widest" dateTime={match.date}>
                          {match.date}
                        </time>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
