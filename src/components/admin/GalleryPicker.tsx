"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { X, Search, Image as ImageIcon, Check } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface GalleryPickerProps {
  onSelect: (src: string) => void;
  onClose: () => void;
  currentSrc?: string;
}

export function GalleryPicker({ onSelect, onClose, currentSrc }: GalleryPickerProps) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/public/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setImages(data.settings.gallery_images || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredImages = images.filter((img) =>
    img.alt.toLowerCase().includes(search.toLowerCase()) ||
    (img.category && img.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-academy-dark/95 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-4xl border-white/10 bg-academy-gray shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/8 shrink-0">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Select from Gallery</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
              Choose an image from your existing academy gallery
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 border-b border-white/8 bg-white/3 shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input
              placeholder="Search gallery by title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 bg-white/5 border-white/10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-academy-red border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Loading your gallery...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
              <ImageIcon size={48} className="mb-4 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">No matching images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => onSelect(img.src)}
                  className={cn(
                    "group relative aspect-square rounded-2xl overflow-hidden border transition-all duration-300",
                    currentSrc === img.src 
                      ? "border-academy-gold ring-2 ring-academy-gold/50 scale-[0.98]" 
                      : "border-white/10 hover:border-white/30"
                  )}
                >
                  <Image 
                    src={img.src} 
                    alt={img.alt} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all duration-300",
                    currentSrc === img.src ? "bg-academy-gold/40" : "bg-black/0 group-hover:bg-black/20"
                  )}>
                    {currentSrc === img.src && (
                      <div className="w-10 h-10 rounded-full bg-white text-academy-gold flex items-center justify-center shadow-2xl scale-110 animate-in zoom-in-50 duration-200">
                        <Check size={24} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-[9px] font-black text-white uppercase tracking-tight truncate">{img.alt}</p>
                    <p className="text-[8px] font-bold text-academy-gold uppercase tracking-widest">{img.category || "General"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/8 bg-white/3 flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={onClose} className="h-11 px-8 uppercase tracking-widest text-[10px] font-black">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
