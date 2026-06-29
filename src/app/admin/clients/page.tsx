"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Plus, Search, Filter, X, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";
import { MEMBERSHIP_PLANS } from "@/data/plans";
import { BulkUploadModal } from "@/components/admin/BulkUploadModal";

export default function ClientsPage() {
  const { currentBranchId, branchName } = useAdminBranch();
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    membership_status: "none",
    plan_name: "none"
  });
  const [formError, setFormError] = useState<string | null>(null);

  const loadPlayers = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { signal });
      const data = await res.json();
      if (data.ok) setAllPlayers(data.users);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Failed to load players");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadPlayers(controller.signal);
    return () => controller.abort();
  }, [currentBranchId]);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedPlayer(null);
    setFormData({ name: "", email: "", phone: "", membership_status: "none", plan_name: "none" });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (player: any) => {
    setIsEditMode(true);
    setSelectedPlayer(player);
    setFormData({
      name: player.name,
      email: player.email,
      phone: player.phone || "",
      membership_status: player.membership_status,
      plan_name: "none"
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setDeleteConfirmId(null);
        loadPlayers();
      }
    } catch (err) {
      console.error("Failed to delete player");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const url = isEditMode ? `/api/admin/users/${selectedPlayer.id}` : "/api/admin/users";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditMode ? formData : { ...formData, password: "password123" })
      });

      const data = await res.json();
      if (data.ok) {
        setIsModalOpen(false);
        loadPlayers();
      } else {
        setFormError(data.message || "Failed to save. Please try again.");
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.");
    }
  };

  const [filterBatch, setFilterBatch] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const filteredPlayers = allPlayers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (p.phone && p.phone.includes(searchQuery));
    const matchesStatus = filterStatus === "all" || p.membership_status === filterStatus;
    const matchesBranch = currentBranchId === "all" ? (filterLocation === "all" || p.branch_id === filterLocation) : true;
    const matchesBatch = filterBatch === "all" || p.batch === filterBatch;
    
    const joinDate = p.created_at ? new Date(p.created_at) : null;
    const dateMatch = !joinDate || (
      (!dateRange.start || joinDate >= new Date(dateRange.start)) &&
      (!dateRange.end || joinDate <= new Date(dateRange.end))
    );

    return matchesSearch && matchesStatus && matchesBranch && matchesBatch && dateMatch;
  });

  return (
    <div className="space-y-8 md:space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">CLIENT MANAGEMENT</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">Manage your academy members and their subscriptions for {branchName}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setIsBulkModalOpen(true)}
            className="w-full sm:w-auto h-12 uppercase tracking-widest text-[10px] font-black border-white/10 hover:bg-white/5"
          >
            Bulk Upload
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10"
          >
            <Plus size={14} className="mr-2" /> Register Client
          </Button>
        </div>
      </div>

      <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input 
              placeholder="Search clients..." 
              className="pl-12 h-12 bg-white/5 border-white/10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {currentBranchId === "all" && (
              <select 
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-[10px] font-black uppercase tracking-widest text-gray-400 focus:outline-none focus:ring-2 focus:ring-academy-gold/50"
              >
                <option value="all">All Locations</option>
                <option value="samarth">Mira Bhayander</option>
                <option value="aims">Mumbai</option>
              </select>
            )}
            <select 
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-[10px] font-black uppercase tracking-widest text-gray-400 focus:outline-none focus:ring-2 focus:ring-academy-gold/50"
            >
              <option value="all">All Batches</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Weekend">Weekend</option>
            </select>
            <div className="flex items-center gap-2">
              <Input 
                type="date" 
                className="h-12 bg-white/5 border-white/10 text-[10px] w-32"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <span className="text-gray-600">—</span>
              <Input 
                type="date" 
                className="h-12 bg-white/5 border-white/10 text-[10px] w-32"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            {["all", "active", "none", "expired", "pending"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                  filterStatus === status 
                    ? "bg-academy-gold text-black border-academy-gold" 
                    : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                )}
              >
                {status === "none" ? "No Plan" : status}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Loading Clients...</div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredPlayers.map((player) => (
                <div key={player.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs uppercase text-academy-gold shrink-0">
                    {player.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-tight truncate">{player.name}</p>
                    <p className="text-[10px] font-bold text-gray-500 truncate">{player.email}</p>
                    <span className={cn(
                      "inline-block mt-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                      player.membership_status === "active" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                      player.membership_status === "pending" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                      "bg-red-500/10 text-red-500 border border-red-500/20"
                    )}>{player.membership_status}</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="uppercase tracking-widest text-[9px] font-black" onClick={() => handleOpenEditModal(player)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="uppercase tracking-widest text-[9px] font-black border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => setDeleteConfirmId(player.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredPlayers.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
                  No clients found matching the filters
                </div>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Client Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Joined On</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs uppercase text-academy-gold">
                            {player.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <span className="text-xs font-black uppercase tracking-tight block">{player.name}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{player.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-xs font-bold text-gray-400">
                          {player.created_at ? new Date(player.created_at).toLocaleDateString() : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-1 rounded-full",
                          player.membership_status === "active" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                          player.membership_status === "pending" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                          "bg-red-500/10 text-red-500 border border-red-500/20"
                        )}>
                          {player.membership_status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" className="uppercase tracking-widest text-[9px] font-black" onClick={() => handleOpenEditModal(player)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="uppercase tracking-widest text-[9px] font-black border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => setDeleteConfirmId(player.id)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPlayers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        No clients found matching the filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* Delete Confirm Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setDeleteConfirmId(null)} />
          <Card className="relative w-full max-w-sm bg-academy-gray border-red-500/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-8 space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Delete Client?</h3>
              <p className="text-gray-400 text-sm">This will permanently remove the client and their membership. This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                disabled={isDeleting}
                onClick={() => handleDelete(deleteConfirmId)}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Register/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <Card className="relative w-full max-w-lg bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                {isEditMode ? "Edit Client" : "Register New Client"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Name</label>
                <Input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="h-12 bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address</label>
                <Input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="h-12 bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Phone Number</label>
                <Input 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="h-12 bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Membership Status</label>
                <select 
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-academy-gold/50"
                  value={formData.membership_status}
                  onChange={(e) => setFormData({ ...formData, membership_status: e.target.value as any })}
                >
                  <option value="none" className="bg-academy-gray">No Plan</option>
                  <option value="active" className="bg-academy-gray">Active</option>
                  <option value="expired" className="bg-academy-gray">Expired</option>
                  <option value="pending" className="bg-academy-gray">Pending</option>
                </select>
              </div>

              {!isEditMode && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Assign Membership Plan</label>
                  <select 
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-academy-gold/50"
                    value={formData.plan_name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ 
                        ...formData, 
                        plan_name: val,
                        membership_status: val !== "none" ? "active" : formData.membership_status
                      });
                    }}
                  >
                    <option value="none" className="bg-academy-gray">No Plan Assigned</option>
                    {MEMBERSHIP_PLANS.map(plan => (
                      <option key={plan.id} value={plan.label} className="bg-academy-gray">{plan.label} (₹{plan.price})</option>
                    ))}
                  </select>
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest ml-1">
                    Assigning a plan will automatically set status to Active
                  </p>
                </div>
              )}
              
              {formError && (
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {formError}
                </p>
              )}

              <div className="pt-4 flex gap-4">
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
                  className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/20"
                >
                  <Save size={14} className="mr-2" />
                  {isEditMode ? "Update Client" : "Register Client"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          loadPlayers();
        }}
        branchId={currentBranchId}
      />
    </div>
  );
}
