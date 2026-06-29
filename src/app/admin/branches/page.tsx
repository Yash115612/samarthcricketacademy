"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import {
  Globe, MapPin, Users, Plus, X, Save, Trash2,
  Phone, Mail, Link2, CheckCircle2, Loader2, Building2, CalendarDays,
} from "lucide-react";

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
  google_maps_link: string;
  description: string;
  head_coach: string;
  established: string;
  player_count?: number;
}

const EMPTY: Omit<Branch, "id" | "player_count"> = {
  name: "", address: "", city: "", phone: "", email: "",
  status: "Active", google_maps_link: "", description: "",
  head_coach: "", established: "",
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Omit<Branch, "id" | "player_count">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/branches");
      const data = await res.json();
      if (data.ok) setBranches(data.branches);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditBranch(null);
    setFormData(EMPTY);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (b: Branch) => {
    setEditBranch(b);
    setFormData({ name: b.name, address: b.address, city: b.city, phone: b.phone,
      email: b.email, status: b.status, google_maps_link: b.google_maps_link,
      description: b.description, head_coach: b.head_coach, established: b.established });
    setFormError(null);
    setModalOpen(true);
  };

  const set = (k: keyof typeof EMPTY, v: string) =>
    setFormData((p) => ({ ...p, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const url = editBranch ? `/api/admin/branches/${editBranch.id}` : "/api/admin/branches";
      const method = editBranch ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.ok) {
        setModalOpen(false);
        load();
      } else {
        setFormError(data.message || "Failed to save. Please try again.");
      }
    } catch {
      setFormError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/branches/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setDeleteConfirmId(null);
        load();
      } else {
        setDeleteError(data.message || "Failed to delete.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const totalPlayers = branches.reduce((s, b) => s + (b.player_count ?? 0), 0);
  const activeBranches = branches.filter((b) => b.status === "Active").length;

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">BRANCH MANAGEMENT</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Add, edit, and manage all academy locations</p>
        </div>
        <Button variant="secondary" onClick={openAdd}
          className="w-full md:w-auto h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10">
          <Plus size={14} className="mr-2" /> Add New Branch
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Branches", value: branches.length, icon: Globe, color: "text-blue-500" },
          { label: "Active Branches", value: activeBranches, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Total Players", value: totalPlayers, icon: Users, color: "text-academy-gold" },
        ].map((s, i) => (
          <Card key={i} className="p-6 border-white/5 bg-academy-gray/30">
            <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4", s.color)}>
              <s.icon size={20} />
            </div>
            <h3 className="text-2xl font-black mb-1">{loading ? "—" : s.value}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Branch Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-academy-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {branches.map((b) => (
            <Card key={b.id} className="border-white/5 bg-academy-gray/30 overflow-hidden">
              {/* Card header */}
              <div className="p-6 border-b border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-academy-red/10 border border-academy-red/20 flex items-center justify-center text-academy-red font-black text-lg shrink-0">
                  {b.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black uppercase tracking-tight text-white text-sm">{b.name}</h3>
                    <span className={cn(
                      "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                      b.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>{b.status}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{b.city}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-black text-white">{b.player_count ?? 0}</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Players</p>
                </div>
              </div>

              {/* Card body */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {[
                  { icon: MapPin, label: b.address || "—" },
                  { icon: Phone, label: b.phone || "—" },
                  { icon: Mail, label: b.email || "—" },
                  { icon: CalendarDays, label: b.established ? `Est. ${b.established}` : "—" },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-400">
                    <Icon size={14} className="text-academy-gold shrink-0" />
                    <span className="truncate">{label}</span>
                  </div>
                ))}
                {b.description && (
                  <div className="sm:col-span-2 flex items-start gap-2 text-gray-500">
                    <Building2 size={14} className="text-gray-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{b.description}</span>
                  </div>
                )}
                {/* Google Maps link */}
                {b.google_maps_link && (
                  <div className="sm:col-span-2 pt-2 border-t border-white/5">
                    <a href={b.google_maps_link} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest">
                      <Link2 size={13} /> Open in Google Maps
                    </a>
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className="px-6 pb-6 flex gap-3">
                <Button variant="outline" className="flex-1 h-10 uppercase tracking-widest text-[10px] font-black" onClick={() => openEdit(b)}>
                  Edit Branch
                </Button>
                <Button variant="outline"
                  className="h-10 px-4 uppercase tracking-widest text-[10px] font-black border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => { setDeleteError(null); setDeleteConfirmId(b.id); }}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
          {branches.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500 font-black uppercase tracking-widest text-sm">
              No branches found. Add your first branch.
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setModalOpen(false)} />
          <Card className="relative w-full max-w-2xl bg-academy-gray border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-black uppercase tracking-tight">
                {editBranch ? "Edit Branch" : "Add New Branch"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 pb-2 border-b border-white/5">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input label="Branch Name *" placeholder="e.g. Samarth Cricket Academy" required
                      value={formData.name} onChange={(e) => set("name", e.target.value)} />
                  </div>
                  <Input label="City *" placeholder="e.g. Mira Bhayander, Mumbai" required
                    value={formData.city} onChange={(e) => set("city", e.target.value)} />
                  <Input label="Year Established" placeholder="e.g. 2011"
                    value={formData.established} onChange={(e) => set("established", e.target.value)} />
                  <div className="md:col-span-2">
                    <Input label="Full Address" placeholder="Building, Street, City, PIN"
                      value={formData.address} onChange={(e) => set("address", e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-300 mb-2">Description</label>
                    <textarea rows={3} placeholder="Brief description of this branch..."
                      value={formData.description}
                      onChange={(e) => set("description", e.target.value)}
                      className="flex w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Status</label>
                    <select value={formData.status} onChange={(e) => set("status", e.target.value as any)}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <Input label="Head Coach" placeholder="Coach name"
                    value={formData.head_coach} onChange={(e) => set("head_coach", e.target.value)} />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 pb-2 border-b border-white/5">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Phone Number" placeholder="+91 XXXXX XXXXX"
                    value={formData.phone} onChange={(e) => set("phone", e.target.value)} />
                  <Input label="Email Address" type="email" placeholder="branch@academy.com"
                    value={formData.email} onChange={(e) => set("email", e.target.value)} />
                </div>
              </div>

              {/* Google Maps */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 pb-2 border-b border-white/5">Location</h3>
                <Input label="Google Maps Link" placeholder="https://maps.google.com/..."
                  value={formData.google_maps_link} onChange={(e) => set("google_maps_link", e.target.value)} />
              </div>

              {formError && (
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {formError}
                </p>
              )}

              <div className="flex gap-4 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}
                  className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black">
                  Cancel
                </Button>
                <Button type="submit" variant="secondary" disabled={saving}
                  className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/20">
                  {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
                  {editBranch ? "Save Changes" : "Create Branch"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setDeleteConfirmId(null)} />
          <Card className="relative w-full max-w-sm bg-academy-gray border-red-500/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-8 space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Delete Branch?</h3>
              <p className="text-gray-400 text-sm">This will permanently remove the branch. Branches with registered players cannot be deleted.</p>
            </div>
            {deleteError && (
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {deleteError}
              </p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black"
                onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
              <Button variant="outline" disabled={deleting}
                className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                onClick={() => handleDelete(deleteConfirmId)}>
                {deleting ? <Loader2 size={14} className="mr-2 animate-spin" /> : null}
                {deleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
