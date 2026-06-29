"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Batches", href: "/batches" },
  { label: "Matches", href: "/matches" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Coaches", href: "/coaches" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
  { label: "Membership", href: "/membership", highlight: true },
];

export const Navbar = () => {
  const { user, logout, updateSession } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Stable ref so polling closure never stales updateSession
  const updateSessionRef = useRef(updateSession);
  useEffect(() => { updateSessionRef.current = updateSession; });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Poll for membership status changes if not active.
  // Use stable primitives (userId, membershipStatus) as deps to avoid
  // re-creating the interval on every render when user object changes reference.
  const userId = user?.id ?? null;
  const membershipStatus = user?.membership_status ?? null;

  useEffect(() => {
    if (!userId || membershipStatus === "active") return;

    const controller = new AbortController();
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/player/dashboard", {
          cache: "no-store",
          signal: controller.signal
        });
        const data = await res.json();

        const isProcessed = data?.ok && (
          data.membership?.status === "Active" ||
          data.user?.membership_status === "rejected"
        );

        if (isProcessed) {
          await updateSessionRef.current();
          clearInterval(interval);
        }
      } catch (err) {
        // ignore errors
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, [userId, membershipStatus]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!profileRef.current) return;
      if (profileRef.current.contains(e.target as Node)) return;
      setProfileOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4 flex justify-between items-center",
        scrolled
          ? "bg-academy-dark/90 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <Image
          src="/logo.png"
          alt="Samarth Cricket Academy Logo"
          width={44}
          height={44}
          className="rounded-full group-hover:rotate-12 transition-transform"
        />
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight tracking-tight uppercase">Samarth</span>
          <span className="text-[10px] text-academy-gold font-bold tracking-widest uppercase">Cricket Academy</span>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex gap-8 text-xs font-bold uppercase tracking-widest">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={link.highlight
              ? "text-academy-red hover:text-white transition-colors font-black"
              : "hover:text-academy-gold transition-colors"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Auth Buttons */}
      <div className="hidden lg:flex items-center gap-4">
        {!mounted ? (
          <div className="w-20 h-8 animate-pulse bg-white/5 rounded-lg" />
        ) : !user ? (
          <>
            <Link href="/signin">
              <Button variant="ghost" className="uppercase tracking-widest text-xs font-black">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" className="uppercase tracking-widest text-xs font-black">Join Now</Button>
            </Link>
          </>
        ) : (
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              className="group flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-academy-gold/50"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-controls="profile-menu"
              onClick={() => setProfileOpen((v) => !v)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-academy-red group-hover:border-academy-gold transition-colors relative">
                {user.name ? (
                  <div className="w-full h-full flex items-center justify-center bg-academy-red text-white text-xs font-black">
                    {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </div>
                ) : (
                  <UserIcon size={16} className="absolute inset-0 m-auto text-gray-400" />
                )}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-tight leading-none mb-1 text-white">{user.name?.split(" ")[0] || "User"}</p>
                <p className="text-[8px] font-black uppercase tracking-widest leading-none text-academy-gold">{user.role}</p>
              </div>
              <ChevronDown size={16} className={cn("text-gray-400 transition-transform", profileOpen && "rotate-180")} aria-hidden="true" />
            </button>

            {profileOpen && (
              <div
                id="profile-menu"
                role="menu"
                className="absolute right-0 mt-3 w-52 bg-academy-gray/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              >
                <Link
                  role="menuitem"
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 focus:bg-white/5 focus:outline-none"
                  onClick={() => setProfileOpen(false)}
                >
                  Dashboard
                </Link>
                {(user as any).membership_status !== "active" && user.role === "player" && (
                  <Link
                    role="menuitem"
                    href="/membership"
                    className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest text-academy-gold hover:bg-academy-gold/5 focus:bg-academy-gold/5 focus:outline-none"
                    onClick={() => setProfileOpen(false)}
                  >
                    Get Membership
                  </Link>
                )}
                {user.role === "player" && (
                  <Link
                    role="menuitem"
                    href="/dashboard/profile"
                    className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 focus:bg-white/5 focus:outline-none"
                    onClick={() => setProfileOpen(false)}
                  >
                    Profile
                  </Link>
                )}
                <button
                  type="button"
                  role="menuitem"
                  className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:outline-none flex items-center gap-2"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={14} aria-hidden="true" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden text-white z-[60] p-2 bg-white/5 rounded-xl border border-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 bg-academy-dark z-50 lg:hidden transition-opacity duration-200 overflow-y-auto",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      )}>
        <div className="min-h-screen flex flex-col items-center justify-center p-8 py-24 text-center">
          <div className="flex flex-col gap-8 w-full max-w-xs">
          {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                "text-2xl font-black uppercase tracking-[0.2em]",
                link.highlight ? "text-academy-red" : "text-white"
              )}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-4 pt-8 border-t border-white/10">
            {!mounted ? (
              <div className="h-20 animate-pulse bg-white/5 rounded-2xl" />
            ) : !user ? (
              <div className="flex flex-col gap-4 mt-4">
                <Link href="/signin" className="w-full" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full uppercase tracking-widest text-xs font-black h-12">Sign In</Button>
                </Link>
                <Link href="/signup" className="w-full" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" className="w-full uppercase tracking-widest text-xs font-black h-12">Join Now</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4" onClick={() => setIsOpen(false)}>
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-academy-red flex items-center justify-center bg-academy-red text-white text-sm font-black">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black uppercase tracking-tight text-white">{user.name || 'User'}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-academy-gold">{user.role}</p>
                  </div>
                </Link>
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/dashboard" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full h-14 uppercase tracking-widest text-xs font-black bg-white/5 border border-white/10">Dashboard</Button>
                  </Link>
                  <Link href="/dashboard/profile" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full h-14 uppercase tracking-widest text-xs font-black bg-white/5 border border-white/10">My Profile</Button>
                  </Link>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full h-14 uppercase tracking-widest text-xs font-black border-white/10 text-red-500 hover:bg-red-500/10 hover:border-red-500/20"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                >
                  Logout Session
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </nav>
  );
};
