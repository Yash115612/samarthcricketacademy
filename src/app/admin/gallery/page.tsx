"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Camera, Plus, X, Trash2, Search, Image as ImageIcon, Edit2, Upload } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";

export default function GalleryPage() {
  const { currentBranchId, branchName } = useAdminBranch();
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    src: "",
    alt: "",
    category: "General"
  });

  const loadGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/public/site-settings");
      const data = await res.json();
      if (data.ok) {
        setGalleryImages(data.settings.gallery_images || []);
      }
    } catch (err) {
      // Failed to load
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let updatedImages;
      if (editId) {
        updatedImages = galleryImages.map(img => 
          img.id === editId ? { ...img, ...formData } : img
        );
      } else {
        updatedImages = [...galleryImages, { id: Date.now().toString(), ...formData }];
      }

      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gallery_images: updatedImages })
      });
      const data = await res.json();
      if (data.ok) {
        setIsModalOpen(false);
        setEditId(null);
        setGalleryImages(updatedImages);
        setFormData({ src: "", alt: "", category: "General" });
      }
    } catch (err) {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    try {
      const updatedImages = galleryImages.filter(img => img.id !== id);
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gallery_images: updatedImages })
      });
      const data = await res.json();
      if (data.ok) {
        setGalleryImages(updatedImages);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setFormData({
      src: item.src,
      alt: item.alt,
      category: item.category || "General"
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, src: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ src: "", alt: "", category: "General" });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">GALLERY MANAGEMENT</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Manage academy photos and media content for {branchName}</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <label className="flex-1 md:flex-none">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            <div className="h-12 w-full md:px-8 flex items-center justify-center gap-2 rounded-xl border border-academy-gold/30 text-academy-gold hover:bg-academy-gold/10 uppercase tracking-widest text-[10px] font-black cursor-pointer transition-all">
              <Upload size={14} /> Quick Upload
            </div>
          </label>
          <Button 
            variant="secondary" 
            onClick={openAddModal}
            className="flex-1 md:flex-none h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10"
          >
            <Plus size={14} className="mr-2" /> Add New Photo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Loading gallery...</div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {galleryImages.map((item) => (
            <Card key={item.id} className="group overflow-hidden border-white/5 bg-academy-gray/30 backdrop-blur-md rounded-[2rem] break-inside-avoid mb-8">
              <div className="relative overflow-hidden bg-black/20">
                {/* Auto-frame Image Container */}
                <img 
                  src={item.src} 
                  alt={item.alt} 
                  className="w-full h-auto block transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-academy-dark/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40"></div>
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-academy-dark/40 backdrop-blur-[2px]">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-3 bg-academy-gold text-academy-dark rounded-xl shadow-xl hover:scale-110 transition-transform flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-3 bg-red-500 text-white rounded-xl shadow-xl hover:scale-110 transition-transform flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                  <span className="text-[9px] font-black uppercase tracking-widest text-academy-gold bg-academy-gold/10 px-3 py-1.5 rounded-full border border-academy-gold/20 backdrop-blur-md">
                    {item.category || "General"}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xs font-black uppercase tracking-widest mb-1 group-hover:text-academy-gold transition-colors truncate">{item.alt}</h3>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">SCA-{item.id.slice(-6)}</p>
              </div>
            </Card>
          ))}
          {galleryImages.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
              <ImageIcon size={48} className="mx-auto text-gray-600 mb-4 opacity-20" />
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">No gallery images found</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Media Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <Card className="relative w-full max-w-lg bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 rounded-[2.5rem]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-academy-gold/10 flex items-center justify-center text-academy-gold">
                  <Camera size={20} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight">{editId ? "Update Media" : "Upload New Media"}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <ImageIcon size={12} className="text-academy-gold" /> Image Source
                </label>
                {formData.src ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
                    <img src={formData.src} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-academy-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="p-3 bg-white text-academy-dark rounded-xl cursor-pointer hover:scale-110 transition-transform">
                        <Upload size={18} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, src: "" })}
                        className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input 
                      value={formData.src} 
                      onChange={(e) => setFormData({ ...formData, src: e.target.value })} 
                      className="bg-white/5 border-white/10 h-12 text-white" 
                      placeholder="Paste image URL here..." 
                    />
                    <div className="relative h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center group hover:border-academy-gold/30 transition-all cursor-pointer bg-white/5">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileUpload} />
                      <Upload size={24} className="text-gray-500 group-hover:text-academy-gold transition-colors mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-gray-400">Click or Drag to Upload</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Image Alt Title</label>
                <Input required value={formData.alt} onChange={(e) => setFormData({ ...formData, alt: e.target.value })} className="bg-white/5 border-white/10 h-12 text-white" placeholder="e.g. Training Session 2026" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                <Input required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="bg-white/5 border-white/10 h-12 text-white" placeholder="e.g. Matches" />
              </div>
              
              <div className="pt-6 flex gap-4 border-t border-white/5">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 uppercase tracking-widest text-[10px] font-black h-12 rounded-2xl">Cancel</Button>
                <Button type="submit" variant="secondary" className="flex-1 uppercase tracking-widest text-[10px] font-black h-12 shadow-xl shadow-academy-gold/10 rounded-2xl">
                  {editId ? "Update Photo" : "Upload Photo"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

