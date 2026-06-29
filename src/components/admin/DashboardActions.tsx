"use client";

import React, { useState } from "react";
import { Zap, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Clock, Megaphone, Wallet, LucideIcon } from "lucide-react";

interface ActionItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  highlight?: boolean;
  color?: string;
}

export function DashboardActions() {
  const [instantMatchModal, setInstantMatchModal] = useState(false);
  const [instantMatchData, setInstantMatchData] = useState({ teams: "", link: "" });
  const [isCreatingInstant, setIsCreatingInstant] = useState(false);

  const actions: ActionItem[] = [
    { label: "Instant Live", icon: Zap, onClick: () => setInstantMatchModal(true), highlight: true, color: "text-academy-red" },
    { label: "Quick Batch", icon: Clock, href: "/admin/batches" },
    { label: "Instant Notice", icon: Megaphone, href: "/admin/notices" },
    { label: "Fast Expense", icon: Wallet, href: "/admin/finance?type=expense", highlight: true, color: "text-academy-gold" },
  ];

  const handleCreateInstantMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingInstant(true);
    try {
      const res = await fetch("/api/admin/matches/instant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: instantMatchData.teams, live_link: instantMatchData.link })
      });
      const data = await res.json();
      if (data.ok) {
        setInstantMatchModal(false);
        setInstantMatchData({ teams: "", link: "" });
        window.location.reload();
      }
    } catch (error) {
      // ignore
    } finally {
      setIsCreatingInstant(false);
    }
  };

  return (
    <>
      {/* Instant Match Modal */}
      {instantMatchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setInstantMatchModal(false)}></div>
          <Card className="relative w-full max-w-lg bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-academy-red animate-pulse" />
                <h2 className="text-2xl font-black uppercase tracking-tight">Instant Live Match</h2>
              </div>
              <button onClick={() => setInstantMatchModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateInstantMatch} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Match Title / Teams</label>
                <Input 
                  required 
                  value={instantMatchData.teams} 
                  onChange={(e) => setInstantMatchData({ ...instantMatchData, teams: e.target.value })}
                  placeholder="e.g. Academy A vs Academy B" 
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">CricHeroes Live Link</label>
                <Input 
                  required 
                  type="url"
                  value={instantMatchData.link} 
                  onChange={(e) => setInstantMatchData({ ...instantMatchData, link: e.target.value })}
                  placeholder="https://cricheroes.in/scorecard/..." 
                  className="bg-white/5 border-white/10"
                />
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Paste the live scorecard URL here</p>
              </div>
              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" onClick={() => setInstantMatchModal(false)} className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black">Cancel</Button>
                <Button type="submit" disabled={isCreatingInstant} variant="primary" className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black bg-academy-red hover:bg-red-600 shadow-xl shadow-academy-red/20">
                  {isCreatingInstant ? "Starting..." : "Start Live Match"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Quick Actions Grid Item */}
      {actions.map((action, i) => (
        action.href ? (
          <Link key={i} href={action.href}>
            <button className={cn(
              "w-full p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 group",
              action.highlight
                ? action.label === "Instant Live" 
                  ? "bg-academy-red/10 border-academy-red/30 hover:border-academy-red/50"
                  : "bg-academy-gold/10 border-academy-gold/30 hover:border-academy-gold/50"
                : "bg-white/5 border-white/5 hover:border-white/20"
            )}>
              <action.icon size={20} className={cn(
                "transition-colors",
                action.highlight ? action.color : "text-gray-500 group-hover:text-white"
              )} />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors text-center">{action.label}</span>
            </button>
          </Link>
        ) : (
          <button key={i} onClick={action.onClick} className={cn(
            "w-full p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 group",
            action.highlight
              ? action.label === "Instant Live" 
                ? "bg-academy-red/10 border-academy-red/30 hover:border-academy-red/50"
                : "bg-academy-gold/10 border-academy-gold/30 hover:border-academy-gold/50"
              : "bg-white/5 border-white/5 hover:border-white/20"
          )}>
            <action.icon size={20} className={cn(
              "transition-colors",
              action.highlight ? action.color : "text-gray-500 group-hover:text-white"
            )} />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors text-center">{action.label}</span>
          </button>
        )
      ))}
    </>
  );
}
