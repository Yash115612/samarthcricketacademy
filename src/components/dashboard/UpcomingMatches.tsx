import React from "react";
import { Calendar, Clock, MapPin, CalendarDays } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
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
    <Card className="border-white/5 bg-academy-gray/40 backdrop-blur-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.25)] rounded-2xl h-full" role="region" aria-labelledby="upcoming-title">
      <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between p-6 pb-4">
        <CardTitle id="upcoming-title" className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-white">
          <Calendar className="text-academy-red" size={20} aria-hidden="true" /> Upcoming Matches
        </CardTitle>
      </CardHeader>
      <div className="p-6 pt-4">
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 mb-3 rounded-full bg-academy-red/10 border border-academy-red/20 flex items-center justify-center">
              <CalendarDays className="text-academy-red" size={24} />
            </div>
            <p className="text-sm font-black text-white mb-1">No upcoming matches</p>
            <p className="text-[11px] text-gray-400 font-medium">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((match) => (
              <Card 
                key={match.id} 
                className="border-white/5 bg-white/5 backdrop-blur-md p-5 group hover:border-academy-red/40 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3">
                  <span 
                    className="text-[10px] font-black uppercase tracking-widest text-academy-gold bg-academy-gold/10 px-3 py-1 rounded-full border border-academy-gold/20"
                    aria-label={`Match fee: ${match.fee} rupees`}
                  >
                    {match.fee > 0 ? `₹${match.fee}` : "FREE"}
                  </span>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-tight text-white">{match.teams}</p>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-t border-white/5 pt-3">
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
                    className="w-full h-11 uppercase tracking-widest text-[10px] font-black"
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
      </div>
    </Card>
  );
};
