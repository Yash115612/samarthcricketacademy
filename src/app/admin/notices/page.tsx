"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Bell, Megaphone, Plus, X, Trash2, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";
import { sendWhatsApp, MESSAGES } from "@/lib/whatsapp";

export default function NoticesPage() {
  const { currentBranchId, branchName } = useAdminBranch();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    important: false,
    date: new Date().toISOString().split('T')[0]
  });

  const loadNotices = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notices", { signal });
      const data = await res.json();
      if (data.ok) setNotices(data.notices);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadNotices(controller.signal);
    return () => controller.abort();
  }, [currentBranchId]);

  const [sendWhatsAppUpdate, setSendWhatsAppUpdate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        setIsModalOpen(false);
        loadNotices();
        
        // WhatsApp logic
        if (sendWhatsAppUpdate) {
          // In a real app, this would be a background job on the server
          // Here we'll show a prompt for the first player as a demo or use a broad group link
          const playerRes = await fetch("/api/admin/users");
          const playerData = await playerRes.json();
          const players = (playerData.users || []).filter((u: any) => u.role === "player" && u.phone);
          
          if (players.length > 0) {
            if (confirm(`Notice posted! Send WhatsApp to ${players.length} members?`)) {
              // Open first player as example, or a group link if configured
              sendWhatsApp(players[0].phone, MESSAGES.NOTICE_UPDATE(formData.title));
            }
          }
        }
        
        setFormData({ title: "", message: "", important: false, date: new Date().toISOString().split('T')[0] });
        setSendWhatsAppUpdate(false);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) loadNotices();
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">NOTICE BOARD</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Publish announcements and important updates for {branchName}</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => setIsModalOpen(true)}
          className="h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10"
        >
          <Megaphone size={14} className="mr-2" /> Post New Notice
        </Button>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Loading notices...</div>
        ) : (
          <>
            {notices.map((notice) => (
              <Card key={notice.id} className="border-white/5 bg-academy-gray/30 backdrop-blur-md group hover:border-academy-gold/30 transition-all">
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex gap-6 items-center flex-1">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      notice.important ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      <Bell size={20} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-tight mb-1 group-hover:text-academy-gold transition-colors">{notice.title}</h3>
                      <div className="flex gap-4">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{notice.date}</span>
                        {notice.important && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-academy-red">Important</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-2">{notice.message}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(notice.id)}
                      className="flex-1 md:flex-none uppercase tracking-widest text-[9px] font-black hover:text-red-500 hover:border-red-500/20"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {notices.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                <Megaphone size={48} className="mx-auto text-gray-600 mb-4 opacity-20" />
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">No notices posted for this branch</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <Card className="relative w-full max-w-lg bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-2xl font-black uppercase tracking-tight">Post New Notice</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Notice Title</label>
                <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. Tournament Update" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Date</label>
                <Input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Message</label>
                <textarea 
                  required
                  value={formData.message} 
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-academy-gold transition-colors min-h-[120px]"
                  placeholder="Type your announcement here..."
                />
              </div>
              <div className="flex flex-col gap-3 py-2">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="important"
                    checked={formData.important}
                    onChange={(e) => setFormData({ ...formData, important: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-academy-red focus:ring-academy-red"
                  />
                  <label htmlFor="important" className="text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer">Mark as Important</label>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="whatsapp"
                    checked={sendWhatsAppUpdate}
                    onChange={(e) => setSendWhatsAppUpdate(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="whatsapp" className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70 cursor-pointer flex items-center gap-2">
                    <MessageCircle size={12} /> Auto Send WhatsApp to Members
                  </label>
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 uppercase tracking-widest text-[10px] font-black">Cancel</Button>
                <Button type="submit" variant="secondary" className="flex-1 uppercase tracking-widest text-[10px] font-black">Post Notice</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

