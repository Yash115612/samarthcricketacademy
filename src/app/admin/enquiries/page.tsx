"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Phone, Mail, Clock, User, ArrowRight, MessageSquare, Trophy, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";

export default function EnquiriesPage() {
  const { branchName } = useAdminBranch();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/admin/enquiries", { signal });
      const data = await res.json();
      if (data.ok) setEnquiries(data.enquiries);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Failed to load enquiries");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.ok) {
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      }
    } catch (err) {
      console.error("Failed to update enquiry status");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [branchName]);

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">ADMISSION ENQUIRIES</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Track and manage prospective player leads for {branchName}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 uppercase tracking-widest text-[10px] font-black bg-white/5 border-white/10 hover:bg-white/10">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-black uppercase tracking-widest">Loading Enquiries...</div>
        ) : enquiries.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-black uppercase tracking-widest">No enquiries found for this branch</div>
        ) : enquiries.map((item) => (
          <Card key={item.id} className="border-white/5 bg-academy-gray/30 backdrop-blur-md group hover:border-academy-red/30 transition-all duration-500">
            <div className="p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-white/10",
                item.type === "personal_training" ? "bg-academy-gold/10 text-academy-gold" :
                item.type === "admission" ? "bg-academy-red/10 text-academy-red" :
                "bg-blue-500/10 text-blue-500"
              )}>
                {item.type === "personal_training" ? <Trophy size={32} /> : 
                 item.type === "admission" ? <User size={32} /> : 
                 <MessageSquare size={32} />}
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-1">{item.name}</h3>
                    <div className="flex flex-wrap gap-4">
                      {item.email && (
                        <span className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <Mail size={12} className="text-academy-gold" /> {item.email}
                        </span>
                      )}
                      <span className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <Phone size={12} className="text-academy-gold" /> {item.phone}
                      </span>
                      <span className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <Clock size={12} className="text-academy-gold" /> {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={cn(
                      "text-[10px] font-black uppercase px-4 py-2 rounded-xl border self-start",
                      item.status === "normal" ? "bg-academy-red/10 text-academy-red border-academy-red/20" :
                      item.status === "assigned" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}>
                      {item.status}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">Type: {item.type.replace("_", " ")}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 italic whitespace-pre-line">
                  &quot;{item.message}&quot;
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Branch: {item.branch_id === "samarth" ? "Samarth Academy" : "AIMS Academy"}</span>
                  <div className="flex gap-3">
                    {item.status !== "contacted" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="uppercase tracking-widest text-[9px] font-black"
                        onClick={() => updateStatus(item.id, "contacted")}
                      >
                        Mark as Contacted
                      </Button>
                    )}
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="uppercase tracking-widest text-[9px] font-black group-hover:bg-academy-gold group-hover:text-academy-dark"
                      onClick={() => updateStatus(item.id, "assigned")}
                    >
                      {item.status === "assigned" ? "Assigned" : "Follow Up"} <ArrowRight size={12} className="ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

