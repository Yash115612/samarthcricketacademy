"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw, Radio, ChevronDown, ChevronUp, Maximize2, ExternalLink, LayoutPanelLeft, ListOrdered, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScorecardResult, OverBall } from "@/lib/cricket";
import { Button } from "@/components/ui/Button";

// ── Ball bubble ───────────────────────────────────────────────────────────────

function BallBubble({ ball, size = "md" }: { ball: OverBall; size?: "sm" | "md" }) {
  const base =
    size === "sm"
      ? "w-6 h-6 text-[9px] font-black rounded-full flex items-center justify-center"
      : "w-8 h-8 text-[10px] font-black rounded-full flex items-center justify-center";
  const color =
    ball.type === "wicket"
      ? "bg-academy-red text-white"
      : ball.type === "four"
      ? "bg-blue-500 text-white"
      : ball.type === "six"
      ? "bg-emerald-500 text-white"
      : ball.type === "wide" || ball.type === "no_ball"
      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
      : ball.type === "bye" || ball.type === "leg_bye"
      ? "bg-purple-500/20 text-purple-400"
      : ball.type === "dot"
      ? "bg-white/10 text-gray-400"
      : "bg-white/20 text-white";
  return <div className={cn(base, color)}>{ball.display}</div>;
}

// ── Collapsible section ───────────────────────────────────────────────────────

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
          {title}
        </span>
        {open ? (
          <ChevronUp size={14} className="text-gray-500" />
        ) : (
          <ChevronDown size={14} className="text-gray-500" />
        )}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface InningsScore {
  team: string;
  runs: number;
  wickets: number;
  overs: string;
  isCurrent: boolean;
}

interface LiveScoreData {
  ok: boolean;
  status: string;
  innings: InningsScore[];
  result: string | null;
  fetched_at: string;
}

interface Props {
  matchId: string;
  liveLink?: string;
}

export function LiveScorecard({ matchId, liveLink }: Props) {
  const [activeTab, setActiveTab] = useState<"summary" | "scorecard" | "commentary">("summary");
  const [data, setData] = useState<ScorecardResult | null>(null);
  const [scrapedData, setScrapedData] = useState<LiveScoreData | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [iframeKey, setIframeKey] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeTabRef = useRef(activeTab);

  const POLL_MS = 10_000;

  useEffect(() => {
    setIsClient(true);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchScore = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setFetching(true);
    setError(null);
    try {
      // 1. Try in-app scoring first
      const res = await fetch(`/api/public/match-score?matchId=${matchId}`, {
        cache: "no-store",
        signal
      });
      const json = await res.json();
      
      if (json.ok && json.has_scoring) {
        setData(json.scorecard);
        setScrapedData(null);
        setLastUpdated(new Date());
        return;
      } 
      
      if (liveLink) {
        // 2. Fallback to CricHeroes scraping if no in-app scoring
        const scrapeRes = await fetch(
          `/api/public/live-score?url=${encodeURIComponent(liveLink)}`,
          { cache: "no-store", signal }
        );
        const scrapeJson: LiveScoreData = await scrapeRes.json();
        if (scrapeJson.ok) {
          setScrapedData(scrapeJson);
          setData(null);
          setLastUpdated(new Date());
        } else {
          setError("Could not load score from CricHeroes");
        }
      } else {
        setError("No scoring data available for this match");
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Fetch error:", err);
        setError("Connection error while loading score");
      }
    } finally {
      setFetching(false);
    }
  };

  // Keep ref in sync with state so polling closure reads latest tab without restarting
  useEffect(() => {
    activeTabRef.current = activeTab;
    // Refresh iframe immediately when switching to scorecard/commentary
    if (isClient && activeTab !== "summary") {
      setIframeKey(prev => prev + 1);
    }
  }, [activeTab, isClient]);

  useEffect(() => {
    if (!isClient) return;

    fetchScore();

    const pollId = setInterval(() => {
      fetchScore();
      if (activeTabRef.current !== "summary") {
        setIframeKey(k => k + 1);
      }
      setCountdown(POLL_MS / 1000);
    }, POLL_MS);

    const countdownId = setInterval(() => {
      setCountdown((c) => (c <= 1 ? POLL_MS / 1000 : c - 1));
    }, 1000);

    return () => {
      clearInterval(pollId);
      clearInterval(countdownId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, liveLink, isClient]);

  if (!isClient) return null;

  if (!data && !scrapedData) {
    return (
      <div className="flex flex-col gap-6 py-10 bg-white/5 rounded-3xl border border-white/10 items-center justify-center text-center">
        <div className="w-16 h-16 bg-academy-gold/10 rounded-full flex items-center justify-center mb-2">
          <RefreshCw size={24} className={cn("text-academy-gold", fetching ? "animate-spin" : "")} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black uppercase tracking-widest text-white">
            {fetching ? "Syncing Live Score" : "Waiting for Data"}
          </h3>
          <p className="text-sm text-gray-500 font-medium max-w-[250px] mx-auto">
            {fetching 
              ? (liveLink ? "Connecting to CricHeroes for real-time updates…" : "Loading match data…") 
              : error || "Scoring has not started for this match yet."}
          </p>
        </div>
        {!fetching && error && liveLink && (
          <Button 
            variant="outline" 
            className="mt-4 border-white/10 hover:bg-white/5"
            onClick={() => window.open(liveLink, '_blank')}
          >
            <ExternalLink size={14} className="mr-2" /> Open CricHeroes Directly
          </Button>
        )}
      </div>
    );
  }

  const renderTabs = () => (
    <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 mb-6">
      <button
        onClick={() => setActiveTab("summary")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
          activeTab === "summary" 
            ? "bg-academy-gold text-black shadow-lg shadow-academy-gold/20" 
            : "text-gray-500 hover:text-white hover:bg-white/5"
        )}
      >
        <LayoutPanelLeft size={14} /> Summary
      </button>
      <button
        onClick={() => setActiveTab("scorecard")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
          activeTab === "scorecard" 
            ? "bg-academy-gold text-black shadow-lg shadow-academy-gold/20" 
            : "text-gray-500 hover:text-white hover:bg-white/5"
        )}
      >
        <ListOrdered size={14} /> Scorecard
      </button>
      <button
        onClick={() => setActiveTab("commentary")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
          activeTab === "commentary" 
            ? "bg-academy-gold text-black shadow-lg shadow-academy-gold/20" 
            : "text-gray-500 hover:text-white hover:bg-white/5"
        )}
      >
        <MessageSquare size={14} /> Commentary
      </button>
    </div>
  );

  const renderIframe = (view: 'scorecard' | 'commentary') => {
    if (!liveLink) return null;
    
    // Construct URLs for specific views if possible, or use base liveLink
    // CricHeroes usually has /scorecard, /commentary, /live suffixes
    let url = liveLink;
    if (view === 'scorecard') {
      url = liveLink.replace(/\/live$/, '/scorecard').replace(/\/commentary$/, '/scorecard');
    } else if (view === 'commentary') {
      url = liveLink.replace(/\/live$/, '/commentary').replace(/\/scorecard$/, '/commentary');
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Radio size={12} className="text-academy-red animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-academy-red">
              Live from CricHeroes
            </span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
              Next Sync in {countdown}s
            </span>
            <button 
              onClick={() => setIframeKey(k => k + 1)}
              className="text-gray-500 hover:text-white transition-colors"
              title="Refresh Scoreboard"
            >
              <RefreshCw size={14} className={fetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="relative w-full aspect-[9/16] md:aspect-video bg-black/20 rounded-2xl border border-white/10 overflow-hidden group">
          <iframe 
            key={iframeKey}
            src={url} 
            className="w-full h-full border-none"
            title="CricHeroes Scoreboard"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="sm" 
              className="bg-academy-gold text-black hover:bg-yellow-500 shadow-xl"
              onClick={() => window.open(url, '_blank')}
            >
              <Maximize2 size={14} className="mr-2" /> Open Fullscreen
            </Button>
          </div>
        </div>
        
        <p className="text-[9px] text-gray-500 text-center font-medium italic">
          Scoreboard provided by CricHeroes. Scroll inside the box to see more stats.
        </p>
      </div>
    );
  };

  // ── Scraped View ────────────────────────────────────────────────────────────
  if (scrapedData && activeTab === "summary") {
    const freshnessLabel = lastUpdated
      ? `Updated ${lastUpdated.toLocaleTimeString()}`
      : "Waiting for data…";

    return (
      <div className="space-y-6">
        {renderTabs()}
        
        <div className="space-y-4">
          {/* Live status bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={12} className="text-academy-red animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-academy-red">
                Live CricHeroes Summary
              </span>
            </div>
            <div className="flex items-center gap-2">
              {fetching && <RefreshCw size={10} className="text-gray-500 animate-spin" />}
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                {freshnessLabel} · Next in {countdown}s
              </span>
            </div>
          </div>

          {/* Score cards */}
          {scrapedData.innings.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {scrapedData.innings.map((inn, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between px-6 py-4 rounded-2xl border transition-all",
                    inn.isCurrent
                      ? "bg-academy-red/10 border-academy-red/30 ring-1 ring-academy-red/20"
                      : "bg-white/5 border-white/5 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {inn.isCurrent && (
                      <div className="w-2 h-2 bg-academy-red rounded-full animate-pulse shadow-lg shadow-academy-red/50" />
                    )}
                    <span className="text-sm font-black uppercase tracking-tight text-white">
                      {inn.team}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-2xl font-black text-academy-gold block leading-none">
                        {inn.runs}/{inn.wickets}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {inn.overs} overs
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 bg-white/5 border border-white/5 rounded-3xl text-center space-y-3">
              <RefreshCw size={24} className="text-gray-600 animate-spin" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Waiting for match to begin…
              </p>
            </div>
          )}

          {/* Match result */}
          {scrapedData.result && (
            <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400 text-center">
                {scrapedData.result}
              </p>
            </div>
          )}
          
          <Button 
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest h-12"
            onClick={() => setActiveTab("scorecard")}
          >
            <ListOrdered size={14} className="mr-2" /> View Detailed Scorecard
          </Button>
        </div>
      </div>
    );
  }

  if (activeTab === "scorecard") {
    return (
      <div className="space-y-6">
        {renderTabs()}
        {renderIframe('scorecard')}
      </div>
    );
  }

  if (activeTab === "commentary") {
    return (
      <div className="space-y-6">
        {renderTabs()}
        {renderIframe('commentary')}
      </div>
    );
  }

  // ── In-App View ─────────────────────────────────────────────────────────────
  if (!data) return null;
  const sc = data;
  const isChasingNeeded =
    sc.innings === 2 && sc.target !== undefined && sc.runs_required !== undefined;

  return (
    <div className="space-y-6">
      {renderTabs()}
      
      <div className="space-y-4">
        {/* Live indicator bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={12} className="text-academy-red animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-academy-red">
              Live In-App Score
            </span>
          </div>
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
            {fetching && <RefreshCw size={9} className="inline mr-1 animate-spin" />}
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString()} · Next in ${countdown}s`
              : "Connecting…"}
          </span>
        </div>

        {/* ── Score header ───────────────────────────────────────────────────── */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 shadow-2xl">
          {/* Teams + score */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                {sc.innings === 1 ? "1st Innings" : "2nd Innings"}
              </p>
              <h3 className="text-xl font-black uppercase tracking-tight text-white leading-tight">
                {sc.batting_team}
              </h3>
              <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">
                vs {sc.bowling_team}
              </p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-black text-academy-gold leading-none tracking-tighter">
                {sc.runs}/{sc.wickets}
              </p>
              <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">
                {sc.overs} / {sc.total_overs} <span className="text-[10px]">ov</span>
              </p>
            </div>
          </div>

          {/* CRR / Target line */}
          <div className="flex flex-wrap items-center gap-6 py-4 border-y border-white/5">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">CRR</span>
              <span className="text-sm font-black text-white">{sc.crr.toFixed(2)}</span>
            </div>
            {isChasingNeeded && (
              <>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Target</span>
                  <span className="text-sm font-black text-academy-gold">{sc.target}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Required</span>
                  <span className="text-sm font-black text-white">
                    {sc.runs_required} <span className="text-[10px] text-gray-500">runs off</span> {sc.balls_remaining} <span className="text-[10px] text-gray-500">balls</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">RRR</span>
                  <span className="text-sm font-black text-academy-red">{sc.rrr?.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Last ball commentary */}
          {sc.last_ball_summary && (
            <div className="px-4 py-3 bg-academy-red/10 border border-academy-red/20 rounded-2xl">
              <p className="text-xs font-bold text-academy-red flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-academy-red rounded-full animate-pulse" />
                {sc.last_ball_summary}
              </p>
            </div>
          )}
        </div>

        {/* ── Current over ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">
            This Over
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {sc.current_over.length > 0 ? (
              sc.current_over.map((ball, i) => <BallBubble key={i} ball={ball} />)
            ) : (
              <span className="text-[10px] text-gray-600 font-bold">New over starting…</span>
            )}
          </div>
        </div>

        {/* ── At the crease ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
            At The Crease
          </p>
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 pr-2">
                  Batsman
                </th>
                <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">R</th>
                <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">B</th>
                <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">4s</th>
                <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">6s</th>
                <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-14">SR</th>
              </tr>
            </thead>
            <tbody>
              {sc.batting
                .filter((b) => b.status === "batting")
                .map((b) => (
                  <tr key={b.name}>
                    <td className="py-1 pr-2">
                      <span
                        className={cn(
                          "text-xs font-black",
                          b.is_striker ? "text-white" : "text-gray-400"
                        )}
                      >
                        {b.is_striker && (
                          <span className="text-academy-gold mr-1">*</span>
                        )}
                        {b.name}
                      </span>
                    </td>
                    <td className="py-1 text-right">
                      <span className="text-sm font-black text-academy-gold">{b.runs}</span>
                    </td>
                    <td className="py-1 text-right">
                      <span className="text-xs font-bold text-gray-400">{b.balls}</span>
                    </td>
                    <td className="py-1 text-right">
                      <span className="text-xs font-bold text-gray-400">{b.fours}</span>
                    </td>
                    <td className="py-1 text-right">
                      <span className="text-xs font-bold text-gray-400">{b.sixes}</span>
                    </td>
                    <td className="py-1 text-right">
                      <span className="text-xs font-bold text-gray-500">{b.sr.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Partnership */}
          {sc.partnership.balls > 0 && (
            <p className="text-[9px] font-bold text-gray-500 pt-1 border-t border-white/5">
              Partnership: {sc.partnership.runs} runs off {sc.partnership.balls} balls
            </p>
          )}
        </div>

        {/* ── Current bowler ─────────────────────────────────────────────────── */}
        {sc.bowling.find((b) => b.is_current) && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
              Bowling
            </p>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 pr-2">Bowler</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">O</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">M</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">R</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">W</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-14">ECO</th>
                </tr>
              </thead>
              <tbody>
                {sc.bowling
                  .filter((b) => b.is_current)
                  .map((b) => (
                    <tr key={b.name}>
                      <td className="py-1 pr-2 text-xs font-black text-white">{b.name}</td>
                      <td className="py-1 text-right text-xs font-bold text-gray-400">{b.overs}</td>
                      <td className="py-1 text-right text-xs font-bold text-gray-400">{b.maidens}</td>
                      <td className="py-1 text-right text-xs font-bold text-gray-400">{b.runs}</td>
                      <td className="py-1 text-right text-xs font-black text-academy-red">{b.wickets}</td>
                      <td className="py-1 text-right text-xs font-bold text-gray-500">{b.economy.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Extras ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 text-[9px] font-bold text-gray-500 px-1">
          <span>Extras: <span className="text-white font-black">{sc.extras.total}</span></span>
          {sc.extras.wides > 0 && <span>W: {sc.extras.wides}</span>}
          {sc.extras.no_balls > 0 && <span>NB: {sc.extras.no_balls}</span>}
          {sc.extras.byes > 0 && <span>B: {sc.extras.byes}</span>}
          {sc.extras.leg_byes > 0 && <span>LB: {sc.extras.leg_byes}</span>}
        </div>

        {/* ── Batting scorecard (collapsible) ────────────────────────────────── */}
        <Section title={`Batting — ${sc.batting_team}`} defaultOpen={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[420px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 pr-2">Batsman</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">R</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">B</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">4s</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">6s</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-14">SR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sc.batting
                  .filter((b) => b.status !== "yet_to_bat")
                  .map((b) => (
                    <tr key={b.name} className={b.status === "batting" ? "bg-white/5" : ""}>
                      <td className="py-2 pr-2">
                        <div className="flex flex-col">
                          <span className={cn("text-xs font-black", b.is_striker ? "text-white" : b.status === "batting" ? "text-white" : "text-gray-400")}>
                            {b.is_striker && <span className="text-academy-gold mr-1">*</span>}
                            {b.name}
                            {b.status === "batting" && !b.is_striker && (
                              <span className="ml-1 text-[8px] text-gray-500">(not out)</span>
                            )}
                          </span>
                          {b.status === "dismissed" && (
                            <span className="text-[9px] text-gray-600 font-medium">{b.how_out}</span>
                          )}
                          {b.status === "not_out" && (
                            <span className="text-[9px] text-emerald-500 font-bold">not out</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 text-right font-black text-sm text-white">{b.runs}</td>
                      <td className="py-2 text-right font-bold text-xs text-gray-400">{b.balls}</td>
                      <td className="py-2 text-right font-bold text-xs text-gray-400">{b.fours}</td>
                      <td className="py-2 text-right font-bold text-xs text-gray-400">{b.sixes}</td>
                      <td className="py-2 text-right font-bold text-xs text-gray-500">{b.sr.toFixed(1)}</td>
                    </tr>
                  ))}
                {/* Extras row */}
                <tr>
                  <td colSpan={2} className="py-2 text-xs font-bold text-gray-500">
                    Extras ({sc.extras.total})
                    <span className="ml-2 text-[9px] text-gray-600">
                      {sc.extras.wides > 0 && `w ${sc.extras.wides} `}
                      {sc.extras.no_balls > 0 && `nb ${sc.extras.no_balls} `}
                      {sc.extras.byes > 0 && `b ${sc.extras.byes} `}
                      {sc.extras.leg_byes > 0 && `lb ${sc.extras.leg_byes}`}
                    </span>
                  </td>
                  <td colSpan={4} />
                </tr>
                {/* Total row */}
                <tr className="border-t border-white/10">
                  <td className="py-2 text-xs font-black text-white uppercase tracking-widest">Total</td>
                  <td className="py-2 text-right font-black text-white" colSpan={5}>
                    {sc.runs}/{sc.wickets} ({sc.overs} ov)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Bowling scorecard (collapsible) ────────────────────────────────── */}
        <Section title={`Bowling — ${sc.bowling_team}`} defaultOpen={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[360px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 pr-2">Bowler</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">O</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">M</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">R</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-10">W</th>
                  <th className="text-[8px] font-black uppercase tracking-widest text-gray-600 pb-2 text-right w-14">ECO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sc.bowling.map((b) => (
                  <tr key={b.name} className={b.is_current ? "bg-white/5" : ""}>
                    <td className="py-2 pr-2 text-xs font-black text-white">
                      {b.name}
                      {b.is_current && (
                        <span className="ml-1 text-[8px] text-academy-gold">▶</span>
                      )}
                    </td>
                    <td className="py-2 text-right text-xs font-bold text-gray-400">{b.overs}</td>
                    <td className="py-2 text-right text-xs font-bold text-gray-400">{b.maidens}</td>
                    <td className="py-2 text-right text-xs font-bold text-gray-400">{b.runs}</td>
                    <td className="py-2 text-right text-xs font-black text-academy-red">{b.wickets}</td>
                    <td className="py-2 text-right text-xs font-bold text-gray-500">{b.economy.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Fall of wickets ─────────────────────────────────────────────────── */}
        {sc.fow.length > 0 && (
          <Section title="Fall of Wickets" defaultOpen={false}>
            <div className="flex flex-wrap gap-3">
              {sc.fow.map((f) => (
                <div
                  key={f.wicket_number}
                  className="px-3 py-2 bg-white/5 rounded-xl border border-white/10"
                >
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    {f.wicket_number}-{f.score}
                  </p>
                  <p className="text-[10px] font-black text-white">{f.batsman}</p>
                  <p className="text-[9px] font-bold text-gray-600">{f.at_overs} ov</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Ball-by-ball (recent overs) ─────────────────────────────────────── */}
        {sc.recent_overs.length > 0 && (
          <Section title="Ball by Ball (Recent Overs)" defaultOpen={false}>
            <div className="space-y-4">
              {[...sc.recent_overs].reverse().map((ov) => (
                <div key={ov.over}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                      Over {ov.over + 1}
                    </span>
                    <span className="text-[9px] font-bold text-gray-600">
                      {ov.runs} run{ov.runs !== 1 ? "s" : ""}
                      {ov.wickets > 0 && `, ${ov.wickets} wkt${ov.wickets > 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ov.balls.map((ball, i) => (
                      <BallBubble key={i} ball={ball} size="sm" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

