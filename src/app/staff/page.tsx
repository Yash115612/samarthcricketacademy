import Link from "next/link";
import {
  Users, Trophy, Target, Plus, ArrowUpRight,
  TrendingUp, Bell, Calendar, CheckCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAdminBranchId } from "@/server/branch";
import { users, matches, enquiries } from "@/server/db/inMemoryDb";

export default function StaffDashboard() {
  const branchId = getAdminBranchId();

  // Mock data for staff dashboard
  const totalPlayersCount = users.countByBranch(branchId);
  const allMatches = matches.listByBranch(branchId);
  const upcomingMatches = allMatches.filter(m => m.status === "Upcoming");
  const recentEnquiries = enquiries.list(branchId).slice(0, 2);

  const STATS = [
    { label: "Total Clients", value: totalPlayersCount.toString(), icon: Users, color: "text-blue-500" },
    { label: "Upcoming Matches", value: upcomingMatches.length.toString(), icon: Trophy, color: "text-academy-gold" },
  ];

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2 text-white">STAFF DASHBOARD</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">Welcome to Samarth Cricket Academy</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <Card key={i} className="border-white/5 bg-academy-gray/30 backdrop-blur-xl rounded-[2rem]">
            <CardContent className="p-8">
              <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6", stat.color)}>
                <stat.icon size={24} />
              </div>
              <h3 className="text-4xl font-black mb-1">{stat.value}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Matches */}
          <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-xl rounded-[2rem]">
            <CardHeader className="p-6">
              <CardTitle className="text-lg uppercase tracking-widest text-white">Upcoming Matches</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              {upcomingMatches.slice(0, 3).map((match: any) => (
                <div key={match.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-academy-red/10 rounded-xl flex items-center justify-center text-academy-red">
                      <Trophy size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-tight text-white">{match.teams}</h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{match.venue} | {match.date}</p>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingMatches.length === 0 && (
                <p className="text-center text-gray-500 text-[10px] font-black uppercase py-4">No upcoming matches</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-xl rounded-[2rem]">
            <CardHeader className="p-6">
              <CardTitle className="text-lg uppercase tracking-widest flex items-center gap-2 text-white">
                <Bell size={18} className="text-academy-gold" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              {recentEnquiries.map((e: any) => (
                <div key={e.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 flex-shrink-0">
                      <Bell size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black uppercase tracking-tight text-white truncate">New Enquiry</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase truncate">{e.name} - {e.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
              {recentEnquiries.length === 0 && (
                <p className="text-center text-gray-500 text-[10px] font-black uppercase py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper to fix missing cn import
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
