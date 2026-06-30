"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, CreditCard, MessageSquare,
  UserSquare, Trophy, BarChart3, Clock, Image as ImageIcon,
  Gift, Bell, ShoppingBag, Share2, Target,
  ChevronDown, Menu, X, LogOut, Settings,
  Globe, Wallet, BadgeCheck, Home, CalendarCheck
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminBranchProvider, useAdminBranch } from "@/context/AdminBranchContext";
import { NotificationBell } from "@/components/admin/NotificationBell";

const SIDEBAR_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard }
    ]
  },
  {
    label: "People",
    items: [
      { label: "Clients", href: "/admin/clients", icon: Users },
      { label: "Staff", href: "/admin/staff", icon: UserSquare },
      { label: "Coaches", href: "/admin/coaches", icon: Trophy }
    ]
  },
  {
    label: "Academy",
    items: [
      { label: "Branches", href: "/admin/branches", icon: Globe },
      { label: "Batches", href: "/admin/batches", icon: Clock },
      { label: "Matches", href: "/admin/matches", icon: Trophy },
      { label: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
      { label: "Player Records", href: "/admin/records", icon: BarChart3 },
      { label: "Personal Training", href: "/admin/pt", icon: Target }
    ]
  },
  {
    label: "Business",
    items: [
      { label: "Membership", href: "/admin/membership", icon: CreditCard },
      { label: "Payments", href: "/admin/payments", icon: BadgeCheck },
      { label: "Finance", href: "/admin/finance", icon: Wallet },
      { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare }
    ]
  },
  {
    label: "Content",
    items: [
      { label: "Homepage Media", href: "/admin/homepage", icon: Home },
      { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
      { label: "Notices", href: "/admin/notices", icon: Bell },
      { label: "Social Media", href: "/admin/social", icon: Share2 },
      { label: "Birthdays", href: "/admin/birthdays", icon: Gift },
      { label: "Shop", href: "/admin/shop", icon: ShoppingBag }
    ]
  },
  {
    label: "Reports",
    items: [
      { label: "Reports", href: "/admin/reports", icon: BarChart3 },
      { label: "Settings", href: "/admin/settings", icon: Settings }
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminBranchProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminBranchProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const { currentBranchId, setCurrentBranchId, branchName } = useAdminBranch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await fetch("/api/admin/branches");
        const data = await res.json();
        if (data.ok) setBranches(data.branches);
      } catch (err) {
        // ignore
      }
    };
    loadBranches();
  }, []);

  // Open sidebar by default on desktop, keep closed on mobile
  useEffect(() => {
    setMounted(true);
    const check = () => setSidebarOpen(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/signin");
    }
  }, [mounted, user, isLoading, router]);

  // Show loading state while checking auth (but only on initial mount to prevent hydration issues)
  if (!mounted || isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-academy-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-academy-dark flex overflow-hidden relative">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-academy-dark/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-academy-gray border-r border-white/5 transition-transform duration-300 will-change-transform",
        !sidebarOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo & Mobile Close */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3" onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}>
              <div className="relative w-10 h-10 shadow-lg shadow-academy-red/20">
                <Image
                  src="/logo.png"
                  alt="Samarth Cricket Academy Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg leading-tight tracking-tight uppercase">Admin</span>
                <span className="text-[10px] text-academy-gold font-black tracking-[0.3em] uppercase">Control Panel</span>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="space-y-6">
              {SIDEBAR_GROUPS.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="px-4 py-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">
                      {group.label}
                    </span>
                  </div>
                  {group.items.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group relative overflow-hidden",
                        pathname === link.href 
                          ? "text-white bg-white/10" 
                          : "text-gray-500 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 bg-academy-red transition-transform duration-300",
                        pathname === link.href ? "translate-x-0" : "-translate-x-full group-hover:translate-x-0"
                      )} />
                      <link.icon size={18} className={cn(
                        "transition-colors",
                        pathname === link.href ? "text-academy-gold" : "group-hover:text-academy-gold"
                      )} />
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </nav>

          {/* Bottom Profile */}
          <div className="p-6 border-t border-white/5">
            <Link href="/admin/settings" onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }} className="flex items-center gap-4 mb-4 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-all">
              <div className="w-10 h-10 rounded-full bg-academy-red flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                {user.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "AD"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase truncate group-hover:text-academy-gold transition-colors">{user.name || "Admin"}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase truncate">Super Admin</p>
              </div>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full h-10 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
            >
              <LogOut size={14} className="mr-2" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-[padding] duration-300",
        sidebarOpen ? "lg:pl-72" : "pl-0"
      )}>
        {/* Top Navbar */}
        <header className="h-16 md:h-20 bg-academy-gray/50 backdrop-blur-xl border-b border-white/5 px-3 md:px-8 flex items-center justify-between shrink-0 relative z-[60]">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/10"
            >
              <Menu size={20} className="md:w-6 md:h-6" />
            </button>
            
            {/* Branch Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setBranchMenuOpen(!branchMenuOpen)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all shadow-lg",
                  branchMenuOpen 
                    ? "bg-academy-gold text-academy-dark border-academy-gold" 
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30"
                )}
                aria-expanded={branchMenuOpen}
                aria-haspopup="listbox"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]",
                  branchMenuOpen ? "bg-academy-dark" : "bg-emerald-500"
                )}></div>
                <span className="text-[11px] font-black uppercase tracking-widest">{branchName}</span>
                <ChevronDown size={14} className={cn("transition-transform duration-300", branchMenuOpen && "rotate-180")} />
              </button>

              {branchMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setBranchMenuOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-3 w-64 max-w-[calc(100vw-1.5rem)] bg-academy-gray border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] py-3 animate-in fade-in zoom-in-95 duration-200 overflow-hidden" role="listbox">
                    <div className="px-5 py-2 border-b border-white/5 mb-2 bg-white/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Switch Academy Branch</p>
                    </div>
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        role="option"
                        aria-selected={currentBranchId === branch.id}
                        onClick={() => {
                          setCurrentBranchId(branch.id as any);
                          setBranchMenuOpen(false);
                          router.refresh();
                        }}
                        className={cn(
                          "w-full text-left px-5 py-4 text-[12px] font-black uppercase tracking-widest transition-all hover:bg-white/10 flex items-center justify-between group",
                          currentBranchId === branch.id ? "text-academy-gold bg-white/5" : "text-gray-400 hover:text-white"
                        )}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span>{branch.name}</span>
                          <span className="text-[8px] font-bold text-gray-600 group-hover:text-gray-400 transition-colors">{branch.city}</span>
                        </div>
                        {currentBranchId === branch.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-academy-gold shadow-[0_0_10px_rgba(255,184,0,0.4)]"></div>
                        )}
                      </button>
                    ))}
                    {branches.length === 0 && (
                      <div className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        No branches found
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <NotificationBell />
            <Link href="/admin/settings" aria-label="Settings" className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group cursor-pointer hover:border-academy-gold transition-all">
              <Settings size={18} className="text-gray-400 group-hover:text-white transition-colors md:w-5 md:h-5" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
