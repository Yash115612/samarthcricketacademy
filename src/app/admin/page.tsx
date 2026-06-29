import Link from "next/link";
import {
  Users, CreditCard, MessageSquare, UserSquare,
  Trophy, Target, Wallet, Plus, ArrowUpRight,
  ArrowDownRight, TrendingUp, Calendar, Bell,
  CheckCircle, Clock, AlertTriangle, Star, Gift,
  Image as ImageIcon, Settings, BarChart3, Share2, UserPlus,
  Receipt, CalendarPlus, Megaphone, ArrowRight,
  Zap, Phone, Mail, Globe
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getAdminBranchId } from "@/server/branch";
import { users, memberships, enquiries, matches, paymentVerifications, settings } from "@/server/db/inMemoryDb";
import { getCached, setCache } from "@/server/cache";
import { DashboardActions } from "@/components/admin/DashboardActions";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { AdminShortcuts } from "@/components/admin/AdminShortcuts";
import { AdminNotifications } from "@/components/admin/AdminNotifications";

export default function AdminDashboard() {
  const branchId = getAdminBranchId();
  const cacheKey = `admin_dashboard_${branchId}`;
  
  // Try to get from cache first
  const cachedData = getCached<any>(cacheKey);
  
  let dashboardData;
  if (cachedData) {
    dashboardData = cachedData;
  } else {
    // Fetch real data (Optimized counts)
    const totalPlayersCount = users.countByBranch(branchId);
    const activePlayersCount = users.countActiveByBranch(branchId);
    
    // Full list only for what's needed for counts not yet optimized
    const allMemberships = memberships.listByBranch(branchId);
    const activeMemberships = allMemberships.filter(m => m.status === "Active");
    const expiringMemberships = allMemberships.filter(m => memberships.isExpiringSoon(m));
    
    const allEnquiries = enquiries.list(branchId);
    const allMatches = matches.listByBranch(branchId);
    const liveMatches = allMatches.filter(m => m.status === "Live");
    const upcomingMatches = allMatches.filter(m => m.status === "Upcoming");

    const branchSettings = settings.get(branchId);

    dashboardData = {
      totalPlayersCount,
      activePlayersCount,
      activeMembershipsCount: activeMemberships.length,
      expiringMemberships: expiringMemberships.slice(0, 1),
      allEnquiriesCount: allEnquiries.length,
      recentEnquiries: allEnquiries.slice(0, 2),
      liveMatches,
      upcomingMatches: upcomingMatches.slice(0, 3),
      totalPtSlots: branchSettings.total_pt_slots,
      usedPtSlots: branchSettings.used_pt_slots,
      allMatchesCount: allMatches.length
    };
    
    setCache(cacheKey, dashboardData);
  }

  const STATS = [
    { label: "Total Clients", value: dashboardData.totalPlayersCount.toString(), icon: Users, color: "text-blue-500", trend: "+12.5%", isUp: true, href: "/admin/clients" },
    { label: "Active Members", value: dashboardData.activeMembershipsCount.toString(), icon: CreditCard, color: "text-academy-gold", trend: "+5.2%", isUp: true, href: "/admin/membership" },
    { label: "New Enquiries", value: dashboardData.allEnquiriesCount.toString(), icon: MessageSquare, color: "text-purple-500", trend: "-2.4%", isUp: false, href: "/admin/enquiries" },
    { label: "PT Slots Left", value: (dashboardData.totalPtSlots - dashboardData.usedPtSlots).toString(), icon: Target, color: "text-emerald-500", trend: "Limited", isUp: true, href: "/admin/pt" },
  ];

  const SHORTCUTS = [
    { label: "Add New Client", icon: UserPlus, href: "/admin/clients", desc: "Register player", color: "hover:text-blue-400" },
    { label: "Record Income", icon: Receipt, href: "/admin/finance", desc: "Log revenue", color: "hover:text-emerald-400" },
    { label: "Schedule Match", icon: CalendarPlus, href: "/admin/matches", desc: "Create match", color: "hover:text-academy-red" },
    { label: "Post Announcement", icon: Megaphone, href: "/admin/notices", desc: "Broadcast", color: "hover:text-purple-400" },
    { label: "Manage Gallery", icon: ImageIcon, href: "/admin/gallery", desc: "Photos & videos", color: "hover:text-pink-400" },
    { label: "View Reports", icon: BarChart3, href: "/admin/reports", desc: "Analytics", color: "hover:text-academy-gold" },
    { label: "Social Media", icon: Share2, href: "/admin/social", desc: "Update info", color: "hover:text-cyan-400" },
    { label: "Site Settings", icon: Settings, href: "/admin/settings", desc: "Configure", color: "hover:text-white" },
  ];

  const NOTIFICATIONS = [
    ...dashboardData.recentEnquiries.map((e: any) => ({
      id: e.id,
      title: "New Enquiry",
      desc: `${e.name} - ${e.type === "personal_training" ? "PT" : "General"}`,
      time: "Recent",
      icon: MessageSquare,
      color: "bg-blue-500/10 text-blue-500",
      href: "/admin/enquiries"
    })),
    ...dashboardData.expiringMemberships.map((m: any) => ({
      id: m.id,
      title: "Membership Expiring",
      desc: `${users.getById(m.user_id)?.name || 'User'} expiring soon`,
      time: "Alert",
      icon: AlertTriangle,
      color: "bg-amber-500/10 text-amber-500",
      href: "/admin/membership"
    }))
  ];

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2 text-white">DASHBOARD</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">Real-time performance for {branchId === "samarth" ? "Samarth Academy" : "AIMS Academy"}</p>
        </div>
        <div className="flex flex-wrap gap-3 md:gap-4 w-full md:w-auto">
          <Link href="/admin/reports" className="flex-1 md:flex-none">
            <Button variant="outline" className="w-full h-12 uppercase tracking-widest text-[10px] font-black bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl">
              Download Report
            </Button>
          </Link>
          <Link href="/admin/finance?type=expense" className="flex-1 md:flex-none">
            <Button variant="primary" className="w-full h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-red/20 bg-academy-red hover:bg-red-600 text-white rounded-2xl">
              <Plus size={14} className="mr-2" /> Add Expense
            </Button>
          </Link>
          <Link href="/admin/clients" className="flex-1 md:flex-none">
            <Button variant="secondary" className="w-full h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10 text-academy-dark rounded-2xl">
              <Plus size={14} className="mr-2" /> Add Client
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <AdminStatsGrid stats={STATS} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Admin Shortcuts */}
          <AdminShortcuts shortcuts={SHORTCUTS} />

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-xl rounded-[2rem]">
              <CardHeader className="p-6">
                <CardTitle className="text-lg uppercase tracking-widest text-white">Matches</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                {[...dashboardData.liveMatches, ...dashboardData.upcomingMatches].slice(0, 3).map((match: any) => (
                  <Link key={match.id} href="/admin/matches">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-academy-red/10 rounded-xl flex items-center justify-center text-academy-red group-hover:scale-110 transition-transform">
                          <Trophy size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-tight text-white group-hover:text-academy-gold transition-colors">{match.teams}</h4>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{match.venue} | {match.status}</p>
                        </div>
                      </div>
                      <ArrowUpRight size={16} className="text-gray-600 group-hover:text-white transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </Link>
                ))}
                {dashboardData.allMatchesCount === 0 && (
                  <p className="text-center text-gray-500 text-[10px] font-black uppercase py-4">No matches scheduled</p>
                )}
                <Link href="/admin/matches">
                  <Button variant="ghost" className="w-full h-12 uppercase tracking-widest text-[10px] font-black text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl">
                    View Match Schedule
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-xl rounded-[2rem]">
              <CardHeader className="p-6">
                <CardTitle className="text-lg uppercase tracking-widest flex items-center gap-2 text-white">
                  <Zap size={18} className="text-academy-red" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 grid grid-cols-2 gap-4">
                <DashboardActions />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <AdminNotifications notifications={NOTIFICATIONS} />
          
          {/* Branch Info - Extra Context */}
          <Card className="border-white/5 bg-gradient-to-br from-academy-red/10 to-transparent backdrop-blur-xl rounded-[2rem] p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-academy-red flex items-center justify-center text-white">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-white">{branchId === "samarth" ? "Samarth Academy" : "AIMS Academy"}</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{branchId === "samarth" ? "Pune, MH" : "Mumbai, MH"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-black uppercase text-gray-500">System Status</span>
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-black uppercase text-gray-500">Database</span>
                <span className="text-[10px] font-black uppercase text-white">Synced</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
