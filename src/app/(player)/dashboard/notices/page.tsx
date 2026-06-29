"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Bell, ArrowLeft, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Notice = {
  id: string;
  branch_id: string;
  title: string;
  message: string;
  date: string;
  important: boolean;
};

export default function NoticesPage() {
  const { user, isLoading } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "important">("all");

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch("/api/player/dashboard", { 
          cache: "no-store",
          signal: controller.signal 
        });
        const data = (await res.json().catch(() => null)) as any;
        if (!res.ok || !data?.ok) { setPageError("Could not load notices."); return; }
        setNotices(data.notices ?? []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setPageError("Could not load notices.");
        }
      }
    };
    load();
    return () => controller.abort();
  }, [user?.id]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-academy-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const importantCount = notices.filter((n) => n.important).length;
  const displayed = filter === "important" ? notices.filter((n) => n.important) : notices;

  return (
    <div className="min-h-screen bg-academy-dark text-white flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 pt-32 pb-20">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Heading */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-1 flex items-center gap-3">
              <Bell className="text-academy-red" size={32} /> Notices
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              Academy announcements for your branch
            </p>
          </div>
          {/* Filter pills */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors",
                filter === "all"
                  ? "bg-academy-red text-white border-academy-red"
                  : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30"
              )}
            >
              All ({notices.length})
            </button>
            <button
              onClick={() => setFilter("important")}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors",
                filter === "important"
                  ? "bg-academy-red text-white border-academy-red"
                  : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30"
              )}
            >
              Important ({importantCount})
            </button>
          </div>
        </div>

        {pageError && (
          <div className="mb-8 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm font-semibold" role="alert">
            {pageError}
          </div>
        )}

        {displayed.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={40} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No notices found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((notice) => (
              <Card
                key={notice.id}
                className={cn(
                  "border backdrop-blur-md p-6 relative overflow-hidden transition-all",
                  notice.important
                    ? "border-academy-red/30 bg-academy-red/5"
                    : "border-white/5 bg-academy-gray/30"
                )}
              >
                {notice.important && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-academy-red rounded-l-2xl" />
                )}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pl-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {notice.important && (
                        <AlertCircle size={14} className="text-academy-red shrink-0" />
                      )}
                      <h2 className={cn(
                        "text-sm font-black uppercase tracking-tight",
                        notice.important ? "text-academy-red" : "text-white"
                      )}>
                        {notice.title}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">
                      {notice.message}
                    </p>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
                    <time className="text-[10px] font-black uppercase tracking-widest text-gray-500" dateTime={notice.date}>
                      {notice.date}
                    </time>
                    {notice.important && (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-academy-red/10 text-academy-red border border-academy-red/20">
                        Important
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
