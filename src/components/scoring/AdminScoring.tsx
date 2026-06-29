"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X, RotateCcw, CheckCircle, ArrowLeftRight, PlayCircle, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScorecardResult, OverBall } from "@/lib/cricket";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Match {
  id: string;
  teams: string;
  branch_id?: string;
}

interface Props {
  match: Match;
  onClose: () => void;
}

type WicketType = "bowled" | "caught" | "lbw" | "run_out" | "stumped" | "hit_wicket" | "retired";
type Phase = "loading" | "setup" | "scoring" | "over_complete" | "wicket_entry" | "new_batsman" | "completed";

const WICKET_TYPES: { value: WicketType; label: string; needsFielder: boolean }[] = [
  { value: "bowled", label: "Bowled", needsFielder: false },
  { value: "caught", label: "Caught", needsFielder: true },
  { value: "lbw", label: "LBW", needsFielder: false },
  { value: "run_out", label: "Run Out", needsFielder: true },
  { value: "stumped", label: "Stumped", needsFielder: true },
  { value: "hit_wicket", label: "Hit Wicket", needsFielder: false },
  { value: "retired", label: "Retired Hurt", needsFielder: false },
];

// ── Ball bubble (mini) ────────────────────────────────────────────────────────

function BallBubble({ ball }: { ball: OverBall }) {
  const color =
    ball.type === "wicket" ? "bg-academy-red text-white" :
    ball.type === "four" ? "bg-blue-500 text-white" :
    ball.type === "six" ? "bg-emerald-500 text-white" :
    ball.type === "wide" || ball.type === "no_ball" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" :
    ball.type === "dot" ? "bg-white/10 text-gray-400" : "bg-white/20 text-white";
  return (
    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black", color)}>
      {ball.display}
    </div>
  );
}

// ── Run button ────────────────────────────────────────────────────────────────

function RunBtn({
  label, onClick, variant = "normal", disabled = false,
}: {
  label: string; onClick: () => void; variant?: "normal" | "four" | "six" | "danger" | "extra"; disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
        variant === "four" && "bg-blue-600 hover:bg-blue-500 text-white",
        variant === "six" && "bg-emerald-600 hover:bg-emerald-500 text-white",
        variant === "danger" && "bg-academy-red/20 hover:bg-academy-red/40 border border-academy-red/40 text-academy-red",
        variant === "extra" && "bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400",
        variant === "normal" && "bg-white/10 hover:bg-white/20 border border-white/10 text-white",
      )}
    >
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdminScoring({ match, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [scorecard, setScorecard] = useState<ScorecardResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Setup form
  const teams = match.teams.split(" vs ");
  const [setup, setSetup] = useState({
    batting_team: teams[0]?.trim() || "",
    bowling_team: teams[1]?.trim() || "",
    total_overs: "20",
    striker: "",
    non_striker: "",
    current_bowler: "",
    target: "",
    innings: "1" as "1" | "2",
  });

  // Extras toggles
  const [extras, setExtras] = useState({ wide: false, no_ball: false, bye: false, leg_bye: false });
  const [extraRuns, setExtraRuns] = useState(0);

  // Wicket entry
  const [wicket, setWicket] = useState<{ type: WicketType; fielder: string }>({
    type: "caught",
    fielder: "",
  });

  // New bowler / batsman
  const [newBowler, setNewBowler] = useState("");
  const [newBatsman, setNewBatsman] = useState({ name: "", is_striker: true });

  // ── Data fetching ──────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/scoring?matchId=${match.id}`);
    const data = await res.json();
    if (data.ok && data.session && data.scorecard) {
      setScorecard(data.scorecard);
      if (data.scorecard.status === "completed") {
        setPhase("completed");
      } else if (data.scorecard.awaiting_new_batsman) {
        setPhase("new_batsman");
      } else if (data.scorecard.awaiting_new_bowler) {
        setPhase("over_complete");
      } else {
        setPhase("scoring");
      }
    } else {
      setPhase("setup");
    }
  }, [match.id]);

  useEffect(() => { load(); }, [load]);

  // ── API helpers ────────────────────────────────────────────────────────────

  const post = async (body: object) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error || "Error"); return null; }
      setScorecard(data.scorecard);
      return data;
    } catch (e) {
      setError("Network error");
      return null;
    } finally {
      setSaving(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const setupValid =
    setup.striker.trim().length > 0 &&
    setup.non_striker.trim().length > 0 &&
    setup.current_bowler.trim().length > 0 &&
    setup.striker.trim().toLowerCase() !== setup.non_striker.trim().toLowerCase() &&
    Number(setup.total_overs) >= 1;

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupValid) return;
    const data = await post({
      action: "start",
      matchId: match.id,
      branch_id: match.branch_id || "samarth",
      innings: Number(setup.innings),
      batting_team: setup.batting_team,
      bowling_team: setup.bowling_team,
      total_overs: Number(setup.total_overs),
      target: setup.target ? Number(setup.target) : undefined,
      batting_lineup: [setup.striker, setup.non_striker],
      striker: setup.striker,
      non_striker: setup.non_striker,
      current_bowler: setup.current_bowler,
    });
    if (data) setPhase("scoring");
  };

  const recordBall = async (runs: number, isWicket = false) => {
    const body: any = {
      action: "ball",
      matchId: match.id,
      runs: extras.bye || extras.leg_bye ? 0 : runs,
      wide: extras.wide,
      no_ball: extras.no_ball,
      bye: extras.bye ? runs : 0,
      leg_bye: extras.leg_bye ? runs : 0,
    };
    if (isWicket) {
      body.wicket = { type: wicket.type, fielder: wicket.fielder || undefined };
    }
    const data = await post(body);
    if (data) {
      setExtras({ wide: false, no_ball: false, bye: false, leg_bye: false });
      setExtraRuns(0);
      if (data.scorecard.awaiting_new_batsman) {
        setPhase("new_batsman");
      } else if (data.scorecard.awaiting_new_bowler) {
        setPhase("over_complete");
      } else {
        setPhase("scoring");
      }
    }
  };

  const handleWicket = () => {
    setPhase("wicket_entry");
  };

  const handleConfirmWicket = async () => {
    await recordBall(0, true);
  };

  const handleNewBowler = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await post({ action: "new_bowler", matchId: match.id, bowler: newBowler });
    if (data) { setNewBowler(""); setPhase("scoring"); }
  };

  const handleNewBatsman = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await post({
      action: "new_batsman",
      matchId: match.id,
      batsman: newBatsman.name,
      is_striker: newBatsman.is_striker,
    });
    if (data) {
      setNewBatsman({ name: "", is_striker: true });
      if (data.scorecard.awaiting_new_bowler) {
        setPhase("over_complete");
      } else {
        setPhase("scoring");
      }
    }
  };

  const handleUndo = async () => {
    const data = await post({ action: "undo", matchId: match.id });
    if (data) setPhase("scoring");
  };

  const handleSwapStriker = async () => {
    const data = await post({ action: "swap_striker", matchId: match.id });
    if (data) setPhase("scoring");
  };

  const handleCompleteInnings = async () => {
    const data = await post({ action: "complete_innings", matchId: match.id });
    if (data) setPhase("completed");
  };

  const sc = scorecard;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-academy-dark/95 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-academy-gray border border-white/10 rounded-none md:rounded-3xl shadow-2xl h-full md:h-auto md:max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-academy-gray border-b border-white/10">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">Live Scorer</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{match.teams}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-bold text-red-400">
              {error}
            </div>
          )}

          {/* ── LOADING ────────────────────────────────────────────────────── */}
          {phase === "loading" && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-gray-500" />
            </div>
          )}

          {/* ── SETUP ──────────────────────────────────────────────────────── */}
          {phase === "setup" && (
            <form onSubmit={handleStart} className="space-y-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-academy-gold">
                Setup New Innings
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Innings</label>
                  <select
                    value={setup.innings}
                    onChange={(e) => setSetup({ ...setup, innings: e.target.value as "1" | "2" })}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-semibold text-white outline-none focus:border-academy-gold/50 transition-colors"
                  >
                    <option value="1">1st Innings</option>
                    <option value="2">2nd Innings</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Total Overs</label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={50}
                    value={setup.total_overs}
                    onChange={(e) => setSetup({ ...setup, total_overs: e.target.value })}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-semibold text-white outline-none focus:border-academy-gold/50 transition-colors"
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Batting Team</label>
                  <input
                    required
                    value={setup.batting_team}
                    onChange={(e) => setSetup({ ...setup, batting_team: e.target.value })}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-semibold text-white outline-none focus:border-academy-gold/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Bowling Team</label>
                  <input
                    required
                    value={setup.bowling_team}
                    onChange={(e) => setSetup({ ...setup, bowling_team: e.target.value })}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-semibold text-white outline-none focus:border-academy-gold/50 transition-colors"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Opening Batsmen
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="label-xs text-academy-gold">★ Striker (On Strike)</label>
                    <input
                      required
                      value={setup.striker}
                      onChange={(e) => setSetup({ ...setup, striker: e.target.value })}
                      className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-semibold text-white outline-none focus:border-academy-gold/50 transition-colors"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Non-Striker</label>
                    <input
                      required
                      value={setup.non_striker}
                      onChange={(e) => setSetup({ ...setup, non_striker: e.target.value })}
                      className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-semibold text-white outline-none focus:border-academy-gold/50 transition-colors"
                      placeholder="e.g. Priya Kumar"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Opening Bowler</label>
                <input
                  required
                  value={setup.current_bowler}
                  onChange={(e) => setSetup({ ...setup, current_bowler: e.target.value })}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-semibold text-white outline-none focus:border-academy-gold/50 transition-colors"
                  placeholder="e.g. Vikram Singh"
                />
              </div>

              {setup.innings === "2" && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Target (1st innings total)</label>
                  <input
                    type="number"
                    min={1}
                    value={setup.target}
                    onChange={(e) => setSetup({ ...setup, target: e.target.value })}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-semibold text-white outline-none focus:border-academy-gold/50 transition-colors"
                    placeholder="e.g. 145"
                  />
                </div>
              )}

              {setup.striker.trim() && setup.non_striker.trim() &&
                setup.striker.trim().toLowerCase() === setup.non_striker.trim().toLowerCase() && (
                <p className="text-xs font-bold text-academy-red text-center">
                  Striker and non-striker cannot be the same player.
                </p>
              )}
              <button
                type="submit"
                disabled={saving || !setupValid}
                className="w-full h-12 bg-academy-red hover:bg-academy-red/80 text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
                Start Innings
              </button>
            </form>
          )}

          {/* ── SCORING PANEL ───────────────────────────────────────────────── */}
          {(phase === "scoring" || phase === "wicket_entry") && sc && (
            <div className="space-y-5">
              {/* Score display */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-black uppercase text-gray-500">{sc.batting_team}</p>
                    <p className="text-3xl font-black text-academy-gold">
                      {sc.runs}/{sc.wickets}
                    </p>
                    <p className="text-xs font-bold text-gray-400">{sc.overs} / {sc.total_overs} ov</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      CRR {sc.crr.toFixed(2)}
                    </p>
                    {sc.target && (
                      <p className="text-[10px] font-black text-academy-red">
                        Need {sc.runs_required} • RRR {sc.rrr?.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Current over */}
                {sc.current_over.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 mr-1">
                      Over:
                    </span>
                    {sc.current_over.map((b, i) => <BallBubble key={i} ball={b} />)}
                  </div>
                )}
              </div>

              {/* Current batsmen */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">At Crease</p>
                  <button
                    onClick={handleSwapStriker}
                    disabled={saving}
                    className="flex items-center gap-1 text-[9px] font-black text-academy-gold hover:underline disabled:opacity-40"
                  >
                    <ArrowLeftRight size={10} /> Swap Strike
                  </button>
                </div>
                {sc.batting.filter((b) => b.status === "batting").map((b) => (
                  <div key={b.name} className="flex items-center justify-between">
                    <span className={cn("text-sm font-black", b.is_striker ? "text-white" : "text-gray-400")}>
                      {b.is_striker && <span className="text-academy-gold mr-1">*</span>}
                      {b.name}
                    </span>
                    <span className="text-sm font-black text-academy-gold">
                      {b.runs} <span className="text-xs text-gray-500">({b.balls})</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Bowler */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Bowling</p>
                {sc.bowling.filter((b) => b.is_current).map((b) => (
                  <div key={b.name} className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">{b.name}</span>
                    <span className="text-xs font-bold text-gray-400">
                      {b.overs}-{b.maidens}-{b.runs}-{b.wickets}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── WICKET ENTRY ─────────────────────────────────────────── */}
              {phase === "wicket_entry" && (
                <div className="rounded-2xl border border-academy-red/30 bg-academy-red/5 p-4 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-academy-red">
                    Wicket — {sc.striker}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {WICKET_TYPES.map((wt) => (
                      <button
                        key={wt.value}
                        onClick={() => setWicket({ ...wicket, type: wt.value })}
                        className={cn(
                          "py-2 px-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all",
                          wicket.type === wt.value
                            ? "bg-academy-red text-white border-academy-red"
                            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                        )}
                      >
                        {wt.label}
                      </button>
                    ))}
                  </div>

                  {WICKET_TYPES.find((wt) => wt.value === wicket.type)?.needsFielder && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {wicket.type === "caught" ? "Caught by" :
                         wicket.type === "stumped" ? "Stumped by (WK)" :
                         wicket.type === "run_out" ? "Run out by" : "Fielder"}
                      </label>
                      <input
                        value={wicket.fielder}
                        onChange={(e) => setWicket({ ...wicket, fielder: e.target.value })}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-semibold text-white outline-none focus:border-academy-gold/50 transition-colors"
                        placeholder="Fielder name"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPhase("scoring")}
                      className="flex-1 h-10 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmWicket}
                      disabled={saving}
                      className="flex-1 h-10 rounded-xl bg-academy-red text-white text-xs font-black uppercase tracking-widest hover:bg-academy-red/80 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                      Confirm Wicket
                    </button>
                  </div>
                </div>
              )}

              {/* ── BALL ENTRY (only when not in wicket entry) ───────────── */}
              {phase === "scoring" && (
                <div className="space-y-4">
                  {/* Extras toggles */}
                  <div className="flex flex-wrap gap-2">
                    {(["wide", "no_ball", "bye", "leg_bye"] as const).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          const newExtras = { wide: false, no_ball: false, bye: false, leg_bye: false };
                          if (!extras[key]) newExtras[key] = true;
                          setExtras(newExtras);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                          extras[key]
                            ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                            : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"
                        )}
                      >
                        {key === "no_ball" ? "No Ball" :
                         key === "leg_bye" ? "Leg Bye" :
                         key.charAt(0).toUpperCase() + key.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Run buttons */}
                  {extras.wide ? (
                    <div className="grid grid-cols-4 gap-2">
                      <RunBtn label="Wd+0" onClick={() => recordBall(0)} variant="extra" disabled={saving} />
                      <RunBtn label="Wd+1" onClick={() => recordBall(1)} variant="extra" disabled={saving} />
                      <RunBtn label="Wd+2" onClick={() => recordBall(2)} variant="extra" disabled={saving} />
                      <RunBtn label="Wd+3" onClick={() => recordBall(3)} variant="extra" disabled={saving} />
                      <RunBtn label="Wd+4" onClick={() => recordBall(4)} variant="extra" disabled={saving} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 1, 2, 3].map((r) => (
                        <RunBtn key={r} label={String(r)} onClick={() => recordBall(r)} disabled={saving} />
                      ))}
                      <RunBtn label="4" onClick={() => recordBall(4)} variant="four" disabled={saving} />
                      <RunBtn label="5" onClick={() => recordBall(5)} disabled={saving} />
                      <RunBtn label="6" onClick={() => recordBall(6)} variant="six" disabled={saving} />
                    </div>
                  )}

                  {/* Wicket + undo */}
                  <div className="grid grid-cols-2 gap-3">
                    <RunBtn label="⚡ WICKET" onClick={handleWicket} variant="danger" disabled={saving} />
                    <button
                      onClick={handleUndo}
                      disabled={saving}
                      className="h-14 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                    >
                      <RotateCcw size={13} /> Undo
                    </button>
                  </div>

                  {/* End innings */}
                  <button
                    onClick={handleCompleteInnings}
                    disabled={saving}
                    className="w-full h-10 rounded-xl border border-white/10 text-gray-600 hover:text-gray-400 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    End Innings
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── NEW BOWLER ───────────────────────────────────────────────────── */}
          {phase === "over_complete" && sc && (
            <form onSubmit={handleNewBowler} className="space-y-5">
              <div className="text-center space-y-2">
                <CheckCircle size={32} className="text-emerald-500 mx-auto" />
                <p className="text-sm font-black uppercase tracking-widest text-white">
                  Over Complete!
                </p>
                {sc.recent_overs.length > 0 && (() => {
                  const last = sc.recent_overs[sc.recent_overs.length - 1];
                  return (
                    <p className="text-[10px] font-bold text-gray-500">
                      Over {last.over + 1}: {last.runs} run{last.runs !== 1 ? "s" : ""}{last.wickets > 0 ? `, ${last.wickets} wkt` : ""}
                    </p>
                  );
                })()}
                <p className="text-2xl font-black text-academy-gold">
                  {sc.runs}/{sc.wickets} ({sc.overs} ov)
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">New Bowler</label>
                <input
                  required
                  autoFocus
                  value={newBowler}
                  onChange={(e) => setNewBowler(e.target.value)}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-semibold text-white outline-none focus:border-academy-gold/50 transition-colors"
                  placeholder="Enter bowler name"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full h-12 bg-academy-gold text-academy-dark font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                Continue Scoring
              </button>
            </form>
          )}

          {/* ── NEW BATSMAN ──────────────────────────────────────────────────── */}
          {phase === "new_batsman" && sc && (
            <form onSubmit={handleNewBatsman} className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-academy-red/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-xl">🏏</span>
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-academy-red">
                  Wicket!
                </p>
                {sc.fow.length > 0 && (
                  <p className="text-[10px] font-bold text-gray-500">
                    {sc.fow[sc.fow.length - 1].batsman} is out •{" "}
                    {sc.wickets}/{sc.fow.length > 1 ? `${sc.fow.length - 1} wickets` : "1 wicket"}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">New Batsman</label>
                <input
                  required
                  autoFocus
                  value={newBatsman.name}
                  onChange={(e) => setNewBatsman({ ...newBatsman, name: e.target.value })}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-semibold text-white outline-none focus:border-academy-gold/50 transition-colors"
                  placeholder="Enter batsman name"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">
                  Who faces next ball?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewBatsman({ ...newBatsman, is_striker: true })}
                    className={cn(
                      "py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all",
                      newBatsman.is_striker
                        ? "bg-academy-gold/20 border-academy-gold text-academy-gold"
                        : "bg-white/5 border-white/10 text-gray-500"
                    )}
                  >
                    New Batsman
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBatsman({ ...newBatsman, is_striker: false })}
                    className={cn(
                      "py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all",
                      !newBatsman.is_striker
                        ? "bg-academy-gold/20 border-academy-gold text-academy-gold"
                        : "bg-white/5 border-white/10 text-gray-500"
                    )}
                  >
                    {sc.non_striker}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full h-12 bg-academy-red text-white font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                Continue
              </button>
            </form>
          )}

          {/* ── COMPLETED ───────────────────────────────────────────────────── */}
          {phase === "completed" && sc && (
            <div className="text-center space-y-5 py-8">
              <CheckCircle size={48} className="text-emerald-500 mx-auto" />
              <div>
                <p className="text-2xl font-black text-white">Innings Complete</p>
                <p className="text-4xl font-black text-academy-gold mt-2">
                  {sc.runs}/{sc.wickets}
                </p>
                <p className="text-sm font-bold text-gray-400 mt-1">
                  {sc.overs} overs · {sc.batting_team}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-8 h-12 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Close Scorer
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
