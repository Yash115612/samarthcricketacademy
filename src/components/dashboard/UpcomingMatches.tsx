import React from "react";
import { Calendar, Clock, MapPin, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MembershipStatus } from "@/types/dashboard";

interface UpcomingMatchesProps {
  matches: Array<{
    id: string;
    teams: string;
    date: string;
    time: string;
    venue: string;
    fee: number;
    joined: boolean;
  }>;
  onJoin: (matchId: string) => void;
  membershipStatus?: MembershipStatus;
}

export const UpcomingMatches: React.FC<UpcomingMatchesProps> = ({ matches, onJoin, membershipStatus }) => {
  const upcoming = matches;

  return (
    <section className="space-y-4" role="region" aria-labelledby="upcoming-title">
      <h2 id="upcoming-title" className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-white">
        <Calendar className="text-academy-red" size={20} aria-hidden="true" /> Upcoming Matches
      </h2>
      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-academy-gray/40 border border-white/10 rounded-2xl backdrop-blur-xl">
          <div className="w-16 h-16 mb-4 rounded-full bg-academy-red/10 border border-academy-red/20 flex items-center justify-center">
            <CalendarDays className="text-academy-red" size={32} />
          </div>
          <p className="text-lg font-black text-white mb-1">No upcoming matches</p>
          <p className="text-[11px] text-gray-400 font-medium">Check back soon for new match announcements!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcoming.map((match) => (
            <Card 
              key={match.id} 
              className="border-white/5 bg-academy-gray/40 backdrop-blur-xl p-6 group hover:border-academy-red/40 transition-all relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
            >
              <div className="absolute top-0 right-0 p-4">
                <span 
                  className="text-[10px] font-black uppercase tracking-widest text-academy-gold bg-academy-gold/10 px-3 py-1 rounded-full border border-academy-gold/20"
                  aria-label={`Match fee: ${match.fee} rupees`}
                >
                  {match.fee > 0 ? `₹${match.fee}` : "FREE"}
                </span>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-tight text-white">{match.teams}</p>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-t border-white/10 pt-4">
                  <span className="flex items-center gap-1">
                    <Clock size={12} aria-hidden="true" /> 
                    <time dateTime={`${match.date}T${match.time}`}>{match.date} • {match.time}</time>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} aria-hidden="true" /> 
                    {match.venue}
                  </span>
                </div>
                <Button 
                  onClick={() => onJoin(match.id)}
                  variant="secondary" 
                  className="w-full h-12 uppercase tracking-widest text-[10px] font-black"
                  disabled={membershipStatus !== "Active" || match.joined}
                  aria-label={`Join match: ${match.teams}`}
                >
                  {match.joined ? "Joined" : membershipStatus === "Active" ? "Join Match" : "Membership Inactive"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};
