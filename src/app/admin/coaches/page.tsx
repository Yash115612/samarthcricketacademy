"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Trophy, Phone, Plus, Search, Star, X, Save, Trash2, Edit2, Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";

export default function CoachesPage() {
  const { currentBranchId, branchName } = useAdminBranch();
  const [coachesList, setCoachesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "Coach",
    email: "",
    phone: "",
    experience: "",
    bio: "",
    image: "",
    status: "Active"
  });

  const loadCoaches = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coaches", { signal });
      const data = await res.json();
      if (data.ok) setCoachesList(data.coaches);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Failed to load coaches");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadCoaches(controller.signal);
    return () => controller.abort();
  }, [currentBranchId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit for base64 storage
      alert("Image is too large. Please upload an image smaller than 2MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result as string }));
      setUploading(false);
    };
    reader.onerror = () => {
      alert("Failed to read file.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedCoach(null);
    setFormData({ name: "", role: "Coach", email: "", phone: "", experience: "", bio: "", image: "", status: "Active" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coach: any) => {
    setIsEditMode(true);
    setSelectedCoach(coach);
    setFormData({
      name: coach.name,
      role: coach.role,
      email: coach.email,
      phone: coach.phone,
      experience: coach.experience,
      bio: coach.bio || "",
      image: coach.image || "",
      status: coach.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode ? `/api/admin/coaches/${selectedCoach.id}` : "/api/admin/coaches";
      const method = isEditMode ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        setIsModalOpen(false);
        loadCoaches();
      }
    } catch (err) {
      console.error("Failed to save coach");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coach?")) return;
    try {
      const res = await fetch(`/api/admin/coaches/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.ok) {
        loadCoaches();
      }
    } catch (err) {
      console.error("Failed to delete coach");
    }
  };

  const filteredCoaches = coachesList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-24 h-full overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">COACHES MANAGEMENT</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Manage your elite coaching team for {branchName}</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={handleOpenAddModal}
          className="h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10"
        >
          <Plus size={14} className="mr-2" /> Add New Coach
        </Button>
      </div>

      {/* Coaches List */}
      <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-6 justify-between items-center shrink-0">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input 
              placeholder="Search coaches..." 
              className="pl-12 h-12 bg-white/5 border-white/10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[400px]">
          {loading ? (
            <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Loading Coaches...</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-academy-gray/95 backdrop-blur-md">
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Coach</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Role</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Experience</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Contact</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCoaches.map((member) => (
                      <tr key={member.id} className="group hover:bg-white/5 transition-colors">
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-academy-gold/10 flex items-center justify-center text-academy-gold font-black overflow-hidden border border-white/5 relative">
                              {member.image ? (
                                <Image 
                                  src={member.image} 
                                  alt={member.name} 
                                  fill 
                                  className="object-cover"
                                />
                              ) : (
                                member.name.split(' ').map((n: string) => n[0]).join('')
                              )}
                            </div>
                            <div>
                              <span className="text-xs font-black uppercase tracking-tight block">{member.name}</span>
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{member.email}</span>
                              {member.bio && (
                                <p className="text-[9px] text-gray-400 mt-1 italic line-clamp-1 max-w-[200px]">{member.bio}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[10px] font-black uppercase tracking-widest text-academy-red bg-academy-red/10 px-3 py-1 rounded-full border border-academy-red/20">
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-xs font-black text-white">{member.experience}</span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            <Phone size={10} /> {member.phone}
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(member)} className="hover:text-academy-gold">
                              <Edit2 size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)} className="hover:text-red-500">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCoaches.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
                          No coaches found for this branch
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Add/Edit Coach Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <Card className="relative w-full max-w-2xl bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
              <h2 className="text-2xl font-black uppercase tracking-tight">{isEditMode ? "Edit Coach" : "Add New Coach"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
              {/* Profile Image Upload Section */}
              <div className="flex flex-col items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/5 mb-4">
                <div className="relative w-32 h-32 rounded-3xl bg-academy-dark border-2 border-white/10 overflow-hidden group">
                  {formData.image ? (
                    <Image src={formData.image} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                      <Camera size={32} className="mb-2" />
                      <span className="text-[8px] font-black uppercase tracking-widest">No Photo</span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Upload size={24} className="text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-academy-gold mb-1">
                    {uploading ? "Processing..." : "Profile Photo"}
                  </p>
                  <p className="text-[8px] text-gray-500 uppercase tracking-widest">JPG, PNG or WebP (Max 2MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Name</label>
                  <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Role</label>
                  <Input required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. Batting Coach" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email</label>
                  <Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Phone</label>
                  <Input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Experience</label>
                  <Input required value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. 5 Years" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Coach Bio</label>
                <textarea 
                  value={formData.bio} 
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
                  className="flex min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all" 
                  placeholder="Write a professional bio about the coach's career and expertise..."
                />
              </div>
            </form>

            <div className="p-8 border-t border-white/5 bg-white/5 shrink-0 flex gap-4">
              <Button type="button" variant="secondary" onClick={handleSubmit} className="flex-1 h-14 uppercase tracking-widest text-xs font-black shadow-2xl" disabled={uploading}>
                <Save size={16} className="mr-2" /> {isEditMode ? "Save Changes" : "Add Coach"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 uppercase tracking-widest text-xs font-black">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
