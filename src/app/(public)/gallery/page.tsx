"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { Play, Maximize2, ArrowRight, Camera, Instagram } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const TABS = ["All", "Photos", "Videos", "Tournaments", "Training"];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await fetch("/api/public/site-settings", { cache: "no-store" });
        const data = await res.json();
        if (data.ok) {
          // Map gallery_images and homepage_videos to the format expected by the page
          const images = (data.settings.gallery_images || []).map((img: any) => ({
            id: img.id,
            type: "Photos",
            category: img.category || "General",
            url: img.src,
            title: img.alt,
          }));

          const videos = (data.settings.homepage_videos || [])
            .filter((v: any) => v.enabled)
            .map((v: any) => ({
              id: v.id,
              type: "Videos",
              category: "Highlights",
              url: v.thumbnail_url || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e",
              videoUrl: v.url,
              title: v.title,
            }));

          setGalleryItems([...images, ...videos]);
        }
      } catch (err) {
        console.error("Failed to load gallery:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const filtered = galleryItems.filter(
    (item) => activeTab === "All" || item.type === activeTab || item.category === activeTab
  );

  const lightboxItem = lightbox !== null ? galleryItems.find((i) => i.id === lightbox) : null;

  return (
    <main className="min-h-screen bg-academy-dark text-white pt-24">
      <Navbar />

      {/* ── Hero header ─────────────────────────────────────────── */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2070&auto=format&fit=crop"
            alt="Gallery header"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-academy-dark/60 to-academy-dark" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-academy-gold text-[11px] font-black uppercase tracking-[0.25em] mb-6">
            <Camera size={14} /> Visual Archive
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tight mb-6 leading-none">
            ACADEMY<br /><span className="text-academy-gold italic">GALLERY</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            A visual journey through our training sessions, tournaments, and championship moments.
          </p>
        </div>
      </section>

      {/* ── Filter tabs ─────────────────────────────────────────── */}
      <section className="py-10 px-6 sticky top-[72px] z-40 bg-academy-dark/90 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                activeTab === tab
                  ? "bg-academy-red text-white shadow-lg shadow-academy-red/25"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* ── Masonry-style grid ──────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-24 text-gray-500 font-black uppercase tracking-widest animate-pulse">
              Loading visuals...
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
              {filtered.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => setLightbox(item.id)}
                  className="relative group overflow-hidden rounded-[1.5rem] border border-white/8 cursor-pointer transition-all duration-500 hover:border-academy-gold/40 break-inside-avoid mb-5"
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-auto block grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-academy-dark via-academy-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                  {/* Type badge */}
                  <div className="absolute top-5 left-5 flex gap-2 translate-y-[-0.5rem] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                    <span className="text-[10px] font-black uppercase tracking-widest text-academy-gold bg-academy-gold/15 border border-academy-gold/25 px-3 py-1 rounded-full">
                      {item.type}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 bg-white/8 border border-white/15 px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>

                  {/* Title and action */}
                  <div className="absolute bottom-5 left-5 right-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-between gap-3">
                    <h4 className="text-base md:text-lg font-black uppercase tracking-tight text-white leading-tight truncate">{item.title}</h4>
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 hover:bg-academy-gold hover:border-academy-gold transition-colors">
                      {item.type === "Videos" ? (
                        <Play size={16} fill="white" className="ml-0.5 text-white" />
                      ) : (
                        <Maximize2 size={16} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-24 text-gray-600 font-black uppercase tracking-widest">
              No items in this category.
            </div>
          )}
        </div>
      </section>

      {/* ── Social CTA ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 text-academy-gold text-[11px] font-black uppercase tracking-[0.25em]">
            <Instagram size={14} /> Follow Along
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
            STAY CONNECTED<br />
            <span className="text-academy-gold italic">WITH OUR JOURNEY</span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-lg mx-auto leading-relaxed font-medium">
            Behind-the-scenes clips, match day moments, and exclusive academy updates —
            follow us on social media.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            {["Instagram", "YouTube", "Facebook", "Twitter"].map((platform) => (
              <button
                key={platform}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all"
              >
                {platform}
              </button>
            ))}
          </div>
          <div className="pt-4">
            <Link href="/contact">
              <Button variant="primary" className="h-13 px-8 uppercase tracking-widest font-black">
                Get In Touch <ArrowRight className="ml-2" size={15} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lightbox ────────────────────────────────────────────── */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-academy-dark/95"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            ✕
          </button>
          <div
            className="relative max-w-5xl w-full max-h-[85vh] aspect-video rounded-2xl overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxItem.type === "Videos" && lightboxItem.videoUrl ? (
              <video 
                src={lightboxItem.videoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <Image src={lightboxItem.url} alt={lightboxItem.title} fill className="object-cover" />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-academy-dark to-transparent">
              <p className="text-[10px] font-black uppercase tracking-widest text-academy-gold mb-1">{lightboxItem.category}</p>
              <h4 className="text-xl font-black text-white">{lightboxItem.title}</h4>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
