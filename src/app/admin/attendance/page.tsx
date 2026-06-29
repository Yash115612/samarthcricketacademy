"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Calendar, CheckCircle, XCircle, Save, Search, Filter, Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";

export default function AttendancePage() {
  const { currentBranchId } = useAdminBranch();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [players, setPlayers] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, "Present" | "Absent">>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "Present" | "Absent" | "unmarked">("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance?date=${date}`);
      const data = await res.json();
      if (data.ok) {
        setPlayers(data.players);
        setBatches(data.batches || []);
        const records: Record<string, "Present" | "Absent"> = {};
        data.attendance.forEach((att: any) => {
          records[att.user_id] = att.status;
        });
        setAttendanceRecords(records);
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [date, currentBranchId]);

  const handleMark = (userId: string, status: "Present" | "Absent") => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [userId]: prev[userId] === status ? (undefined as any) : status,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendanceRecords)
        .filter(([_, status]) => status !== undefined)
        .map(([user_id, status]) => ({ user_id, status }));

      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, records }),
      });
      const data = await res.json();
      if (data.ok) {
        // Show success notification if available
        alert("Attendance saved successfully!");
      }
    } catch (err) {
      alert("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          player.phone?.includes(searchQuery);
    
    const status = attendanceRecords[player.id];
    const matchesFilter = 
      filter === "all" || 
      (filter === "Present" && status === "Present") ||
      (filter === "Absent" && status === "Absent") ||
      (filter === "unmarked" && !status);

    const matchesBatch = selectedBatch === "all" || player.batch_id === selectedBatch;

    return matchesSearch && matchesFilter && matchesBatch;
  });

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">DAILY ATTENDANCE</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Mark and track daily presence of academy players
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-academy-gold" size={18} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 pl-12 pr-4 bg-academy-gray/50 border border-white/10 rounded-xl text-white font-bold uppercase tracking-widest text-[10px] focus:outline-none focus:border-academy-gold transition-colors"
            />
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="h-12 px-8 bg-academy-red hover:bg-red-600 text-white uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-red/20"
          >
            {saving ? "Saving..." : <><Save size={16} className="mr-2" /> Save Changes</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <Input
            placeholder="Search players by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-academy-gray/30 border-white/5 uppercase tracking-widest text-[10px] font-bold"
          />
        </div>
        <div className="relative">
          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-academy-gray/30 border border-white/5 rounded-xl text-white font-bold uppercase tracking-widest text-[10px] appearance-none focus:outline-none focus:border-academy-gold"
          >
            <option value="all">All Batches</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>{batch.name}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-full h-12 pl-12 pr-4 bg-academy-gray/30 border border-white/5 rounded-xl text-white font-bold uppercase tracking-widest text-[10px] appearance-none focus:outline-none focus:border-academy-gold"
          >
            <option value="all">All Status</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
            <option value="unmarked">Unmarked</option>
          </select>
        </div>
        <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 lg:col-span-1">
          <span>Total: {filteredPlayers.length}</span>
          <span className="text-academy-gold">Present: {Object.values(attendanceRecords).filter(v => v === "Present").length}</span>
        </div>
      </div>

      <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Player Details</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Membership</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-2 border-academy-gold border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Loading Players...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                    No players found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                  <tr key={player.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-academy-red/20 flex items-center justify-center text-academy-red font-black">
                          {player.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-tight">{player.name}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{player.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-1 rounded-full",
                        player.membership_status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-500"
                      )}>
                        {player.membership_status || "none"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3 min-h-[40px]">
                        {(attendanceRecords[player.id] === "Present" || !attendanceRecords[player.id]) && (
                          <button
                            onClick={() => handleMark(player.id, "Present")}
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border",
                              attendanceRecords[player.id] === "Present"
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-110"
                                : "border-white/10 text-gray-500 hover:border-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/5"
                            )}
                            title={attendanceRecords[player.id] === "Present" ? "Click to unmark" : "Mark Present"}
                          >
                            <CheckCircle size={20} strokeWidth={attendanceRecords[player.id] === "Present" ? 3 : 2} />
                          </button>
                        )}
                        
                        {(attendanceRecords[player.id] === "Absent" || !attendanceRecords[player.id]) && (
                          <button
                            onClick={() => handleMark(player.id, "Absent")}
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border",
                              attendanceRecords[player.id] === "Absent"
                                ? "bg-academy-red border-academy-red text-white shadow-lg shadow-academy-red/40 scale-110"
                                : "border-white/10 text-gray-500 hover:border-academy-red/50 hover:text-academy-red hover:bg-academy-red/5"
                            )}
                            title={attendanceRecords[player.id] === "Absent" ? "Click to unmark" : "Mark Absent"}
                          >
                            <XCircle size={20} strokeWidth={attendanceRecords[player.id] === "Absent" ? 3 : 2} />
                          </button>
                        )}

                        {attendanceRecords[player.id] && (
                          <button
                            onClick={() => setAttendanceRecords(prev => ({ ...prev, [player.id]: undefined as any }))}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-gray-500 hover:text-academy-gold hover:border-academy-gold/30 hover:bg-academy-gold/5 transition-all ml-1 animate-in fade-in slide-in-from-left-2 duration-300"
                            title="Change Status"
                          >
                            <Pencil size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
