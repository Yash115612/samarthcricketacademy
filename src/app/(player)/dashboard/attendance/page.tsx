"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, XCircle, ArrowLeft, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

type AttendanceEntry = {
  id: string;
  date: string;
  status: "Present" | "Absent";
};

const MONTH_LABELS: Record<string, string> = {
  "01": "January", "02": "February", "03": "March", "04": "April",
  "05": "May", "06": "June", "07": "July", "08": "August",
  "09": "September", "10": "October", "11": "November", "12": "December",
};

export default function AttendancePage() {
  const { user, isLoading } = useAuth();
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [yearlyAtt, setYearlyAtt] = useState<{ present: number; absent: number; percentage: number } | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

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
        if (!res.ok || !data?.ok) { setPageError("Could not load attendance."); return; }
        setEntries(data.attendance?.entries ?? []);
        setYearlyAtt(data.yearlyReport?.attendance ?? null);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setPageError("Could not load attendance.");
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

  const present = entries.filter((e) => e.status === "Present").length;
  const absent = entries.filter((e) => e.status === "Absent").length;
  const total = entries.length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  // Group by month
  const grouped = entries.reduce<Record<string, AttendanceEntry[]>>((acc, e) => {
    const key = e.date.slice(0, 7);
    (acc[key] = acc[key] ?? []).push(e);
    return acc;
  }, {});
  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-academy-dark text-white flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 pt-32 pb-20">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-1 flex items-center gap-3">
            <CalendarDays className="text-emerald-500" size={32} /> Attendance History
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Full record of your academy attendance
          </p>
        </div>

        {pageError && (
          <div className="mb-8 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm font-semibold" role="alert">
            {pageError}
          </div>
        )}

        {/* Summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Days", value: total, color: "text-white" },
            { label: "Present", value: present, color: "text-emerald-500" },
            { label: "Absent", value: absent, color: "text-red-500" },
            { label: "Rate", value: `${percentage}%`, color: "text-academy-gold" },
          ].map((s) => (
            <Card key={s.label} className="border-white/5 bg-academy-gray/30 backdrop-blur-md p-5 text-center">
              <p className={cn("text-3xl font-black", s.color)}>{s.value}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Overall progress bar */}
        <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md p-6 mb-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Overall Attendance Rate</span>
            <span className="text-sm font-black text-emerald-500">{percentage}%</span>
          </div>
          <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${percentage}%` }} />
          </div>
        </Card>

        {/* Month-by-month */}
        {months.length === 0 ? (
          <p className="text-gray-500 font-medium text-center py-16">No attendance records found.</p>
        ) : (
          <div className="space-y-8">
            {months.map((monthKey) => {
              const [year, mo] = monthKey.split("-");
              const label = `${MONTH_LABELS[mo] ?? mo} ${year}`;
              const monthEntries = grouped[monthKey].slice().sort((a, b) => b.date.localeCompare(a.date));
              const mPresent = monthEntries.filter((e) => e.status === "Present").length;
              const mTotal = monthEntries.length;
              const mPct = mTotal > 0 ? Math.round((mPresent / mTotal) * 100) : 0;

              return (
                <Card key={monthKey} className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
                  {/* Month header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <h2 className="text-sm font-black uppercase tracking-widest text-white">{label}</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-gray-500">{mPresent}/{mTotal} days</span>
                      <span className={cn("text-[10px] font-black", mPct >= 75 ? "text-emerald-500" : "text-red-500")}>{mPct}%</span>
                    </div>
                  </div>

                  {/* Entries table */}
                  <div className="divide-y divide-white/5">
                    {monthEntries.map((e) => (
                      <div key={e.id} className="flex items-center justify-between px-6 py-3">
                        <span className="text-xs font-bold text-gray-300">{e.date}</span>
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          e.status === "Present"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                        )}>
                          {e.status === "Present"
                            ? <CheckCircle2 size={12} />
                            : <XCircle size={12} />}
                          {e.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
