"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Users, Phone, MessageSquare, CheckCircle2, Clock, ShieldCheck, UserPlus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAdminBranch } from "@/context/AdminBranchContext";

export default function PTAdminPage() {
  const { branchName } = useAdminBranch();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 10, used: 2 });
  const [loading, setLoading] = useState(true);

  const loadData = async (signal?: AbortSignal) => {
    try {
      const [enqRes, settingsRes] = await Promise.all([
        fetch("/api/admin/enquiries", { signal }),
        fetch("/api/admin/settings/pt", { signal })
      ]);
      const enqData = await enqRes.json();
      const settingsData = await settingsRes.json();
      
      if (enqData.ok) setEnquiries(enqData.enquiries);
      if (settingsData.ok) setStats(settingsData.settings);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Failed to load admin data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [branchName]); // Reload when branch changes

  const updateSlots = async (total: number) => {
    try {
      const res = await fetch("/api/admin/settings/pt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_pt_slots: total })
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error("Failed to update slots");
    }
  };

  const assignPT = async (enq: any) => {
    const coach_name = prompt("Enter Coach Name", "Head Coach");
    if (!coach_name) return;

    try {
      const res = await fetch("/api/admin/pt/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: enq.phone,
          branch_id: enq.branch_id,
          coach_name,
          enquiry_id: enq.id
        })
      });
      if (res.ok) {
        alert("Personal Training assigned successfully!");
        loadData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to assign PT");
      }
    } catch (err) {
      console.error("Failed to assign PT");
    }
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">PERSONAL TRAINING</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Manage premium 1-on-1 coaching and enquiries for {branchName}</p>
        </div>
        <div className="flex gap-4">
          <Card className="flex items-center gap-4 px-6 py-3 border-white/5 bg-academy-gray/30">
            <div className="w-10 h-10 rounded-full bg-academy-gold/20 flex items-center justify-center text-academy-gold">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Available Slots</p>
              <p className="text-xl font-black text-white">{stats.total - stats.used} / {stats.total}</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Slot Management */}
        <Card className="p-8 border-white/5 bg-academy-gray/30 backdrop-blur-md h-fit">
          <div className="flex items-center gap-3 mb-6">
            <Settings2 size={18} className="text-academy-gold" />
            <h3 className="text-lg font-black uppercase tracking-widest">Slot Settings</h3>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Total PT Slots</label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={stats.total} 
                  onChange={(e) => setStats(s => ({ ...s, total: parseInt(e.target.value) }))}
                  className="bg-white/5"
                />
                <Button 
                  onClick={() => updateSlots(stats.total)}
                  variant="outline" 
                  className="uppercase tracking-widest text-[10px] font-black"
                >
                  Update
                </Button>
              </div>
            </div>
            <div className="pt-6 border-t border-white/5">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                <span className="text-gray-500">Used Slots</span>
                <span className="text-white">{stats.used}</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-academy-gold transition-all duration-1000" 
                  style={{ width: `${(stats.used / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Enquiries */}
        <Card className="lg:col-span-2 border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MessageSquare size={18} className="text-academy-red" />
              <h3 className="text-lg font-black uppercase tracking-widest">Recent Enquiries</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Player</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Branch</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">No enquiries found for {branchName}</td>
                  </tr>
                ) : enquiries.map((enq) => (
                  <tr key={enq.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black uppercase tracking-tight">{enq.name}</span>
                        <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                          <Phone size={10} /> {enq.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-academy-gold bg-academy-gold/10 px-2 py-1 rounded border border-academy-gold/20">
                        {enq.branch_id === "samarth" ? "Samarth" : "AIMS"}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-1 rounded-full border",
                        enq.status === "normal" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        enq.status === "waiting" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        enq.status === "assigned" ? "bg-academy-gold/10 text-academy-gold border-academy-gold/20" :
                        "bg-white/10 text-white border-white/20"
                      )}>
                        {enq.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`https://wa.me/${enq.phone.replace(/\D/g, "")}`} target="_blank">
                          <Button variant="outline" size="sm" className="uppercase tracking-widest text-[9px] font-black">
                            Contact
                          </Button>
                        </Link>
                        {enq.status !== "assigned" && (
                          <Button 
                            onClick={() => assignPT(enq)}
                            variant="secondary" 
                            size="sm" 
                            className="uppercase tracking-widest text-[9px] font-black"
                          >
                            Assign PT
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
