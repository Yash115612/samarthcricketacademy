"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Zap, Shield, Crown, Plus, CheckCircle, Search, Filter, X, Save, Edit2, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";
import { sendWhatsApp, MESSAGES } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

export default function MembershipPage() {
  const { currentBranchId, branchName } = useAdminBranch();
  const [allMemberships, setAllMemberships] = useState<any[]>([]);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states for plan editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planFormData, setPlanFormData] = useState({
    name: "",
    price: 0,
    duration_days: 30,
    duration_label: "",
    features: ""
  });

  // Modal states for subscription editing
  const [isEditSubModalOpen, setIsEditSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [subFormData, setSubFormData] = useState({
    plan_name: "",
    expiry_date: "",
    status: "Active" as any
  });

  const loadData = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const [memRes, planRes] = await Promise.all([
        fetch("/api/admin/memberships", { signal }),
        fetch("/api/admin/plans", { signal })
      ]);
      const memData = await memRes.json();
      const planData = await planRes.json();
      
      if (memData.ok) setAllMemberships(memData.memberships);
      if (planData.ok) setAvailablePlans(planData.plans);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [currentBranchId]);

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setPlanFormData({
      name: plan.name,
      price: plan.price,
      duration_days: plan.duration_days,
      duration_label: plan.duration_label,
      features: plan.features.join("\n")
    });
    setIsEditModalOpen(true);
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPlan.id,
          name: planFormData.name,
          price: planFormData.price,
          duration_days: planFormData.duration_days,
          duration_label: planFormData.duration_label,
          features: planFormData.features.split("\n").filter(f => f.trim() !== "")
        })
      });
      const data = await res.json();
      if (data.ok) {
        setIsEditModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error("Failed to update plan");
    }
  };

  const handleEditSub = (sub: any) => {
    setEditingSub(sub);
    setSubFormData({
      plan_name: sub.plan_name,
      expiry_date: sub.expiry_date,
      status: sub.status
    });
    setIsEditSubModalOpen(true);
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/membership/${editingSub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subFormData)
      });
      const data = await res.json();
      if (data.ok) {
        setIsEditSubModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error("Failed to update subscription");
    }
  };

  const handleDeleteSub = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    try {
      const res = await fetch(`/api/admin/membership/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Failed to delete subscription");
    }
  };

  const activeSubs = allMemberships.filter(m => m.status === "Active").length;
  const expiredCount = allMemberships.filter(m => m.status === "Expired").length;

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");

  const filteredMemberships = allMemberships.filter(m => {
    const userName = m.userName?.toLowerCase() || "";
    const searchMatch = userName.includes(searchQuery.toLowerCase()) || m.plan_name.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = filterStatus === "all" || m.status === filterStatus;
    const planMatch = filterPlan === "all" || m.plan_name === filterPlan;
    return searchMatch && statusMatch && planMatch;
  });

  const handleSendExpiryReminder = (m: any) => {
    if (!m.phone) {
      alert("No phone number found for this user");
      return;
    }
    const daysLeft = Math.ceil((new Date(m.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    sendWhatsApp(m.phone, MESSAGES.MEMBERSHIP_EXPIRY(m.userName || "Player", daysLeft));
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">MEMBERSHIP PLANS</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Configure and manage academy membership tiers for {branchName}</p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        {availablePlans.map((plan) => (
          <Card key={plan.id} className="relative overflow-hidden border-white/5 bg-academy-gray/30 backdrop-blur-md group hover:border-academy-gold/30 transition-all duration-500">
            <div className="p-8 space-y-8">
              <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform", 
                plan.type === "monthly" ? "text-academy-gold" : "text-blue-500")}>
                {plan.type === "monthly" ? <Crown size={28} /> : <Zap size={28} />}
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{plan.name}</h3>
                <p className="text-3xl font-black text-white">
                  {plan.price > 0 ? `₹${plan.price.toLocaleString()}` : "Contact Base"}
                  {plan.price > 0 && <span className="text-xs text-gray-500 ml-2">/ {plan.duration_label}</span>}
                </p>
              </div>
              <ul className="space-y-4">
                {plan.features.slice(0, 4).map((feature: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle size={14} className="text-emerald-500" /> {feature}
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                className="w-full h-12 uppercase tracking-widest text-[10px] font-black group-hover:bg-white/10"
                onClick={() => handleEditPlan(plan)}
              >
                Edit Plan Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Subscriptions Summary */}
      <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-lg uppercase tracking-widest">Subscription Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center mb-12">
            {[
              { label: "Active Subs", value: activeSubs.toString() },
              { label: "Expired", value: expiredCount.toString() },
              { label: "Total Records", value: allMemberships.length.toString() },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Recent Member Subscriptions</h3>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 h-10 text-[10px] font-black uppercase tracking-widest text-gray-400 focus:outline-none focus:ring-2 focus:ring-academy-gold/50"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                </select>
                <div className="relative w-full md:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input 
                    placeholder="Search members..." 
                    className="pl-10 h-10 bg-white/5 border-white/10 text-[10px]" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Loading Memberships...</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-500">Player</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-500">Plan</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-500">Expiry</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-500">Status</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-500 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredMemberships.map((m) => {
                      return (
                        <tr key={m.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4">
                            <span className="text-xs font-black uppercase text-white">{m.userName || "Unknown"}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-[10px] font-bold text-academy-gold uppercase">{m.plan_name}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-[10px] font-medium text-gray-400">{m.expiry_date}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={cn(
                              "text-[8px] font-black uppercase px-2 py-1 rounded-full",
                              m.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                            )}>
                              {m.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-gray-400 hover:text-academy-gold"
                                onClick={() => handleSendExpiryReminder(m)}
                                title="Send WhatsApp Reminder"
                              >
                                <MessageCircle size={14} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-gray-400 hover:text-academy-gold"
                                onClick={() => handleEditSub(m)}
                              >
                                <Edit2 size={14} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                onClick={() => handleDeleteSub(m.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMemberships.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
                          No subscription records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Plan Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>
          <Card className="relative w-full max-w-lg bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-2xl font-black uppercase tracking-tight">Edit {editingPlan?.name}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePlanSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Plan Name</label>
                <Input 
                  required
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                  className="h-12 bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Price (₹)</label>
                <Input 
                  required
                  type="number"
                  value={planFormData.price}
                  onChange={(e) => setPlanFormData({ ...planFormData, price: Number(e.target.value) })}
                  className="h-12 bg-white/5 border-white/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Duration (Days)</label>
                  <Input 
                    required
                    type="number"
                    value={planFormData.duration_days}
                    onChange={(e) => setPlanFormData({ ...planFormData, duration_days: Number(e.target.value) })}
                    className="h-12 bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Duration Label</label>
                  <Input 
                    required
                    value={planFormData.duration_label}
                    onChange={(e) => setPlanFormData({ ...planFormData, duration_label: e.target.value })}
                    className="h-12 bg-white/5 border-white/10"
                    placeholder="e.g. 1 Month, 2 Months"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Features (one per line)</label>
                <textarea 
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-academy-gold/50"
                  value={planFormData.features}
                  onChange={(e) => setPlanFormData({ ...planFormData, features: e.target.value })}
                />
              </div>
              
              <div className="pt-4 flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="secondary"
                  className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/20"
                >
                  <Save size={14} className="mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {isEditSubModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setIsEditSubModalOpen(false)}></div>
          <Card className="relative w-full max-w-md bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-black uppercase tracking-tight">Edit Subscription</h2>
              <button onClick={() => setIsEditSubModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Player Name</label>
                <div className="text-sm font-bold text-white uppercase">{editingSub?.userName}</div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Plan Name</label>
                <Input 
                  required
                  value={subFormData.plan_name}
                  onChange={(e) => setSubFormData({ ...subFormData, plan_name: e.target.value })}
                  className="h-12 bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Expiry Date</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input 
                    required
                    type="date"
                    value={subFormData.expiry_date}
                    onChange={(e) => setSubFormData({ ...subFormData, expiry_date: e.target.value })}
                    className="h-12 bg-white/5 border-white/10 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status</label>
                <select 
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-academy-gold/50 appearance-none"
                  value={subFormData.status}
                  onChange={(e) => setSubFormData({ ...subFormData, status: e.target.value as any })}
                >
                  <option value="Active" className="bg-academy-gray">Active</option>
                  <option value="Expired" className="bg-academy-gray">Expired</option>
                  <option value="Pending" className="bg-academy-gray">Pending</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditSubModalOpen(false)}
                  className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="secondary"
                  className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/20"
                >
                  <Save size={14} className="mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

