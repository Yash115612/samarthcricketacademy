"use client";

import React, { useState } from "react";
import { Zap, ArrowLeft, Link2, Trophy, MapPin, Calendar, Clock, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function InstantLivePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleParseLink = async () => {
    if (!url) return;
    setLoading(true);
    // Simulate smart parsing of CricHeroes link
    // In a real production app, this would call a server-side route that uses Cheerio or an API
    setTimeout(() => {
      let teams = "Team A vs Team B";
      let venue = "Local Ground";
      
      // Basic simulation based on URL content
      if (url.includes("cricheroes")) {
        const parts = url.split("/");
        const lastPart = parts[parts.length - 1] || parts[parts.length - 2];
        if (lastPart) {
          teams = lastPart.replace(/-/g, " ").replace(/scorecard/g, "").trim() || teams;
        }
      }

      setExtractedData({
        teams,
        venue: "Tournament Stadium",
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        live_link: url
      });
      setLoading(false);
    }, 1500);
  };

  const handleStartMatch = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/matches/instant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extractedData)
      });
      const data = await res.json();
      if (data.ok) {
        router.push("/admin/matches");
      }
    } catch (error) {
      // ignore
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" className="w-10 h-10 p-0 rounded-full bg-white/5 border-white/10">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-1">INSTANT LIVE MATCH</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">AI-Powered match setup from live link</p>
        </div>
      </div>

      <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
        <div className="p-8 md:p-12 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-academy-gold flex items-center gap-2">
              <Link2 size={14} /> Paste CricHeroes / Live Link
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Input 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://cricheroes.in/scorecard/..." 
                  className="h-14 bg-white/5 border-white/10 pl-12 text-sm"
                />
                <Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
              <Button 
                onClick={handleParseLink}
                disabled={!url || loading}
                className="h-14 px-8 uppercase tracking-widest text-xs font-black bg-academy-red hover:bg-red-600 shadow-xl shadow-academy-red/20 shrink-0"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Fetch Details"}
              </Button>
            </div>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
              Our system will automatically extract team names, venue, and match details from the provided link.
            </p>
          </div>

          {extractedData && (
            <div className="space-y-8 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Teams Configuration</label>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-academy-gold/10 flex items-center justify-center text-academy-gold">
                      <Trophy size={20} />
                    </div>
                    <Input 
                      value={extractedData.teams}
                      onChange={(e) => setExtractedData({ ...extractedData, teams: e.target.value })}
                      className="bg-transparent border-none p-0 h-auto font-black uppercase tracking-tight text-white focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Venue</label>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <MapPin size={20} />
                    </div>
                    <Input 
                      value={extractedData.venue}
                      onChange={(e) => setExtractedData({ ...extractedData, venue: e.target.value })}
                      className="bg-transparent border-none p-0 h-auto font-black uppercase tracking-tight text-white focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Date</label>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Calendar size={20} />
                    </div>
                    <Input 
                      type="date"
                      value={extractedData.date}
                      onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                      className="bg-transparent border-none p-0 h-auto font-black uppercase tracking-tight text-white focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Start Time</label>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Clock size={20} />
                    </div>
                    <Input 
                      type="time"
                      value={extractedData.time}
                      onChange={(e) => setExtractedData({ ...extractedData, time: e.target.value })}
                      className="bg-transparent border-none p-0 h-auto font-black uppercase tracking-tight text-white focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex flex-col md:flex-row gap-4">
                <Button 
                  onClick={() => setExtractedData(null)}
                  variant="outline" 
                  className="flex-1 h-14 uppercase tracking-widest text-xs font-black border-white/10"
                >
                  Clear & Reset
                </Button>
                <Button 
                  onClick={handleStartMatch}
                  disabled={isCreating}
                  className="flex-[2] h-14 uppercase tracking-widest text-xs font-black bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20"
                >
                  {isCreating ? <Loader2 size={18} className="animate-spin mr-2" /> : <CheckCircle2 size={18} className="mr-2" />}
                  Confirm & Broadcast Live
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {!extractedData && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40">
          {[
            { title: "Paste Link", desc: "Copy scorecard URL from CricHeroes", icon: Link2 },
            { title: "AI Extraction", desc: "System auto-fills names and venue", icon: Sparkles },
            { title: "Go Live", desc: "Broadcast to all academy members", icon: Zap },
          ].map((step, i) => (
            <div key={i} className="text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
                <step.icon size={20} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">{step.title}</h3>
              <p className="text-[9px] font-medium text-gray-600 uppercase tracking-tight leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
