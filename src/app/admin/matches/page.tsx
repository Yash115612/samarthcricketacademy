"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { Plus, Search, Calendar, MapPin, X, Save, Link2, Trash2, AlertTriangle, Radio, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";
import { AdminScoring } from "@/components/scoring/AdminScoring";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type MatchStatus = "Upcoming" | "Live" | "Completed";

interface FormData {
  teams: string;
  date: string;
  time: string;
  venue: string;
  fee: number;
  status: MatchStatus;
  live_link: string;
}

const EMPTY_FORM: FormData = {
  teams: "",
  date: new Date().toISOString().split('T')[0],
  time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
  venue: "",
  fee: 0,
  status: "Upcoming",
  live_link: "",
};

export default function AdminMatchesPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Loading Matches...</div>}>
      <AdminMatchesContent />
    </Suspense>
  );
}

function AdminMatchesContent() {
  const { currentBranchId, branchName } = useAdminBranch();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const [matchList, setMatchList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Match edit modal
  const [isModalOpen, setIsModalOpen] = useState(mode === "live");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    ...EMPTY_FORM,
    status: mode === "live" ? "Live" : "Upcoming"
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Live scoring modal
  const [scoringMatch, setScoringMatch] = useState<any>(null);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/matches");
      const data = await res.json();
      if (data.ok) setMatchList(data.matches);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [currentBranchId]);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedMatch(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (match: any) => {
    setIsEditMode(true);
    setSelectedMatch(match);
    setFormData({
      teams: match.teams,
      date: match.date,
      time: match.time,
      venue: match.venue,
      fee: match.fee,
      status: match.status,
      live_link: match.live_link || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = isEditMode ? "PATCH" : "POST";
      const body = isEditMode ? { id: selectedMatch.id, ...formData } : formData;

      const res = await fetch("/api/admin/matches", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        setIsModalOpen(false);
        loadMatches();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMatch?.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/matches?id=${selectedMatch.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setShowDeleteConfirm(false);
        setIsModalOpen(false);
        loadMatches();
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  // Stats
  const liveCount = matchList.filter((m) => m.status === "Live").length;
  const upcomingCount = matchList.filter((m) => m.status === "Upcoming").length;
  const completedCount = matchList.filter((m) => m.status === "Completed").length;

  const filteredMatches = matchList.filter(
    (m) =>
      m.teams.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-24">
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">MATCH MANAGEMENT</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Schedule and track all academy matches for {branchName}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Link href="/admin/matches/instant">
            <Button
              variant="outline"
              className="h-12 w-full sm:w-auto uppercase tracking-widest text-[10px] font-black border-academy-red/30 text-academy-red hover:bg-academy-red/10"
            >
              <Zap size={14} className="mr-2 animate-pulse" /> Instant Live Match
            </Button>
          </Link>
          <Button
            variant="secondary"
            onClick={handleOpenAddModal}
            className="h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10"
          >
            <Plus size={14} className="mr-2" /> Schedule New Match
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Live Matches", value: liveCount.toString(), color: "text-academy-red" },
          { label: "Upcoming Matches", value: upcomingCount.toString(), color: "text-academy-gold" },
          { label: "Completed Matches", value: completedCount.toString(), color: "text-emerald-500" },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-white/5 bg-academy-gray/30 backdrop-blur-md text-center">
            <h3 className={cn("text-4xl font-black mb-1", stat.color)}>{stat.value}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Match Table */}
      <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search matches..."
              className="pl-12 h-12 bg-white/5 border-white/10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
            Loading Matches...
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
            No matches found for this branch
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredMatches.map((match) => (
                <div key={match.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black uppercase tracking-tight leading-tight">{match.teams}</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-1">
                        <Calendar size={10} className="inline mr-1" />{match.date} · {match.time}
                      </p>
                      <p className="text-[10px] font-bold text-gray-500">
                        <MapPin size={10} className="inline mr-1 text-academy-gold" />{match.venue}
                      </p>
                    </div>
                    <span className={cn(
                      "shrink-0 text-[9px] font-black uppercase px-2.5 py-1 rounded-full",
                      match.status === "Live" ? "bg-academy-red/10 text-academy-red animate-pulse" :
                      match.status === "Upcoming" ? "bg-blue-500/10 text-blue-500" :
                      "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {match.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {match.status === "Live" && (
                      <Button variant="outline" size="sm"
                        className="flex-1 h-9 uppercase tracking-widest text-[9px] font-black border-academy-red/40 text-academy-red hover:bg-academy-red/10"
                        onClick={() => setScoringMatch(match)}>
                        <Radio size={10} className="mr-1 animate-pulse" /> Score
                      </Button>
                    )}
                    <Button variant="outline" size="sm"
                      className="flex-1 h-9 uppercase tracking-widest text-[9px] font-black"
                      onClick={() => handleOpenEditModal(match)}>
                      Edit
                    </Button>
                    {match.live_link && (
                      <a href={match.live_link} target="_blank" rel="noopener noreferrer"
                        className="flex-1 h-9 flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest text-academy-gold border border-academy-gold/30 rounded-xl hover:bg-academy-gold/10">
                        <Link2 size={10} /> CricHeroes
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Match Details</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Venue</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">CricHeroes</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMatches.map((match) => (
                    <tr key={match.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5">
                        <span className="text-xs font-black uppercase tracking-tight block mb-1">{match.teams}</span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                          <Calendar size={10} className="inline mr-1" /> {match.date} | {match.time}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <MapPin size={12} className="text-academy-gold" /> {match.venue}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "text-[10px] font-black uppercase px-3 py-1 rounded-full",
                          match.status === "Live" ? "bg-academy-red/10 text-academy-red animate-pulse" :
                          match.status === "Upcoming" ? "bg-blue-500/10 text-blue-500" :
                          "bg-emerald-500/10 text-emerald-500"
                        )}>
                          {match.result || match.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {match.live_link ? (
                          <a href={match.live_link} target="_blank" rel="noopener noreferrer"
                            className="text-[9px] font-black uppercase tracking-widest text-academy-gold hover:underline flex items-center gap-1">
                            <Link2 size={10} /> View
                          </a>
                        ) : (
                          <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {match.status === "Live" && (
                            <Button variant="outline" size="sm"
                              className="uppercase tracking-widest text-[9px] font-black border-academy-red/40 text-academy-red hover:bg-academy-red/10 flex items-center gap-1"
                              onClick={() => setScoringMatch(match)}>
                              <Radio size={10} className="animate-pulse" /> Score
                            </Button>
                          )}
                          <Button variant="outline" size="sm"
                            className="uppercase tracking-widest text-[9px] font-black"
                            onClick={() => handleOpenEditModal(match)}>
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* ── Live Scoring Modal ───────────────────────────────────────────────── */}
      {scoringMatch && (
        <AdminScoring
          match={{ id: scoringMatch.id, teams: scoringMatch.teams, branch_id: currentBranchId }}
          onClose={() => setScoringMatch(null)}
        />
      )}

      {/* ── Add / Edit Modal ──────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />
          <Card className="relative w-full max-w-xl bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 sticky top-0 z-10">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                {isEditMode ? "Edit Match" : "Schedule Match"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* Teams */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Teams</label>
                <Input
                  required
                  value={formData.teams}
                  onChange={(e) => setFormData({ ...formData, teams: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="Team A vs Team B"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Date</label>
                  <Input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Time</label>
                  <Input
                    required
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              {/* Venue */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Venue</label>
                <Input
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="e.g. Main Ground"
                />
              </div>

              {/* Fee & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Match Fee (₹)</label>
                  <Input
                    required
                    type="number"
                    min={0}
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status</label>
                  <select
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-academy-gold/50"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MatchStatus })}
                  >
                    <option value="Upcoming" className="bg-academy-gray">Upcoming</option>
                    <option value="Live" className="bg-academy-gray">Live</option>
                    <option value="Completed" className="bg-academy-gray">Completed</option>
                  </select>
                </div>
              </div>

              {/* CricHeroes Link */}
              <div className="space-y-2 rounded-2xl border border-academy-gold/20 bg-academy-gold/5 p-5">
                <label className="text-[10px] font-black uppercase tracking-widest text-academy-gold flex items-center gap-2">
                  <Link2 size={11} /> CricHeroes Match Link
                </label>
                <input
                  type="url"
                  value={formData.live_link}
                  onChange={(e) => setFormData({ ...formData, live_link: e.target.value })}
                  placeholder="https://cricheroes.com/scorecard/..."
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-academy-gold/40 transition-all"
                />
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                  Paste the CricHeroes scorecard URL. Live matches will embed this page with auto-refresh for viewers.
                </p>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex gap-4">
                {isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving || deleting}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={14} className="mr-2" /> Delete
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={saving || deleting}
                  className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black"
                >
                  <Save size={14} className="mr-2" />
                  {saving ? "Saving…" : "Save Match"}
                </Button>
              </div>
            </form>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="p-6 border-t border-red-500/20 bg-red-500/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={16} className="text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">Delete this match permanently?</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                      This action cannot be undone. All match records and registrations will be removed.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    disabled={deleting}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest border-white/10"
                  >
                    Keep Match
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 border-none"
                  >
                    {deleting ? "Deleting…" : "Yes, Delete"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
