"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { BarChart3, Search, TrendingUp, Users, Star, Plus, X, Edit2, Trash2, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";

export default function PlayerRecordsPage() {
  const { currentBranchId, branchName } = useAdminBranch();
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Performance modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [playerRecords, setPlayerRecords] = useState<any[]>([]);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [formData, setFormData] = useState({ runs: 0, wickets: 0, match_id: "m1" });

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.ok) {
        // Fetch all performance records to aggregate
        const perfRes = await fetch("/api/admin/records");
        const perfData = await perfRes.json();
        
        const allRecords = perfData.records || [];
        
        const aggregated = data.users.filter((u: any) => u.role === "player").map((p: any) => {
          const userRecords = allRecords.filter((r: any) => r.user_id === p.id);
          return {
            ...p,
            matches: userRecords.length,
            runs: userRecords.reduce((s: number, r: any) => s + r.runs, 0),
            wickets: userRecords.reduce((s: number, r: any) => s + r.wickets, 0),
          };
        });
        setPlayers(aggregated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, [currentBranchId]);

  const openPlayerRecords = async (player: any) => {
    setSelectedPlayer(player);
    try {
      const res = await fetch(`/api/admin/records?userId=${player.id}`);
      const data = await res.json();
      if (data.ok) {
        setPlayerRecords(data.records);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          user_id: selectedPlayer.id,
          runs: Number(formData.runs),
          wickets: Number(formData.wickets)
        })
      });
      const data = await res.json();
      if (data.ok) {
        setIsAddingRecord(false);
        setFormData({ runs: 0, wickets: 0, match_id: "m1" });
        openPlayerRecords(selectedPlayer);
        loadPlayers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    try {
      const res = await fetch(`/api/admin/records?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        openPlayerRecords(selectedPlayer);
        loadPlayers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRuns = players.reduce((sum, p) => sum + p.runs, 0);
  const totalWickets = players.reduce((sum, p) => sum + p.wickets, 0);

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">PLAYER RECORDS</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Analyze and manage player performance statistics for {branchName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Players", value: players.length.toString(), icon: Users, color: "text-blue-500" },
          { label: "Total Runs", value: totalRuns.toLocaleString(), icon: TrendingUp, color: "text-emerald-500" },
          { label: "Total Wickets", value: totalWickets.toString(), icon: Star, color: "text-academy-gold" },
          { label: "Avg. Runs/Player", value: players.length > 0 ? (totalRuns / players.length).toFixed(1) : "0", icon: BarChart3, color: "text-academy-red" },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-white/5 bg-academy-gray/30 backdrop-blur-md">
            <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4", stat.color)}>
              <stat.icon size={20} />
            </div>
            <h3 className="text-2xl font-black mb-1">{stat.value}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input 
              placeholder="Search player records..." 
              className="pl-12 h-12 bg-white/5 border-white/10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Loading Records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Player</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Matches</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Runs</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Wickets</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Avg</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPlayers.map((record) => (
                  <tr key={record.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-[10px] text-academy-gold">
                          {record.name.charAt(0)}
                        </div>
                        <span className="text-xs font-black uppercase tracking-tight">{record.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-xs font-bold text-gray-400">{record.matches}</td>
                    <td className="px-6 py-6 text-xs font-bold text-white">{record.runs}</td>
                    <td className="px-6 py-6 text-xs font-bold text-white">{record.wickets}</td>
                    <td className="px-6 py-6 text-xs font-bold text-academy-gold">
                      {record.matches > 0 ? (record.runs / record.matches).toFixed(1) : "0.0"}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openPlayerRecords(record)}
                        className="uppercase tracking-widest text-[9px] font-black"
                      >
                        Manage Records
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Manage Records Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <Card className="relative w-full max-w-2xl bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">{selectedPlayer?.name}</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Manage individual match performance</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-8">
              {!isAddingRecord ? (
                <Button 
                  onClick={() => setIsAddingRecord(true)}
                  variant="secondary" 
                  className="w-full h-12 uppercase tracking-widest text-[10px] font-black"
                >
                  <Plus size={14} className="mr-2" /> Add New Match Performance
                </Button>
              ) : (
                <form onSubmit={handleAddRecord} className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4 animate-in slide-in-from-top-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Runs Scored</label>
                      <Input type="number" required value={formData.runs} onChange={(e) => setFormData({ ...formData, runs: Number(e.target.value) })} className="bg-white/5 border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Wickets Taken</label>
                      <Input type="number" required value={formData.wickets} onChange={(e) => setFormData({ ...formData, wickets: Number(e.target.value) })} className="bg-white/5 border-white/10" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddingRecord(false)} className="flex-1 h-10 text-[9px] font-black uppercase tracking-widest">Cancel</Button>
                    <Button type="submit" variant="secondary" className="flex-1 h-10 text-[9px] font-black uppercase tracking-widest">Save Record</Button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Performance History</h3>
                {playerRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group">
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 bg-academy-gold/10 rounded-xl flex items-center justify-center text-academy-gold">
                        <Trophy size={18} />
                      </div>
                      <div>
                        <div className="flex gap-4">
                          <span className="text-xs font-black text-white">{record.runs} Runs</span>
                          <span className="text-xs font-black text-academy-red">{record.wickets} Wickets</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">Match ID: {record.match_id}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteRecord(record.id)}
                      className="p-2 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {playerRecords.length === 0 && (
                  <p className="text-center py-8 text-[10px] font-black uppercase tracking-widest text-gray-600">No performance records yet</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
