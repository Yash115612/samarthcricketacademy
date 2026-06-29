"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Edit2, Check, X, Image as ImageIcon, Layers, Save, RefreshCw, Eye, Video, Play, Power, ToggleLeft, ToggleRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { GalleryPicker } from "@/components/admin/GalleryPicker";
import type { DbHeroSlide, DbGalleryImage, DbHomepageVideo } from "@/server/db/inMemoryDb";

type Tab = "hero" | "gallery" | "videos";

const EMPTY_SLIDE: Omit<DbHeroSlide, "id"> = { img: "", tag: "", title: "", accent: "", sub: "" };
const EMPTY_IMAGE: Omit<DbGalleryImage, "id"> = { src: "", alt: "" };
const EMPTY_VIDEO: Omit<DbHomepageVideo, "id"> = { url: "", title: "", description: "", thumbnail_url: "", enabled: true, order: 0 };

const SUPPORTED_VIDEO_FORMATS = ["mp4", "webm", "mov", "avi"];
const MAX_FILE_SIZE_MB = 100;

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext && !SUPPORTED_VIDEO_FORMATS.includes(ext)) {
    return { valid: false, error: `Unsupported format. Use: ${SUPPORTED_VIDEO_FORMATS.join(", ")}` };
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `File too large. Max size: ${MAX_FILE_SIZE_MB}MB` };
  }
  return { valid: true };
}

export default function HomepageMediaPage() {
  const [tab, setTab] = useState<Tab>("hero");
  const [heroSlides, setHeroSlides] = useState<DbHeroSlide[]>([]);
  const [galleryImages, setGalleryImages] = useState<DbGalleryImage[]>([]);
  const [homepageVideos, setHomepageVideos] = useState<DbHomepageVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Slide edit modal
  const [editSlide, setEditSlide] = useState<DbHeroSlide | null>(null);
  const [editSlideData, setEditSlideData] = useState<DbHeroSlide | null>(null);

  // Video edit modal
  const [editVideo, setEditVideo] = useState<DbHomepageVideo | null>(null);
  const [editVideoData, setEditVideoData] = useState<DbHomepageVideo | null>(null);

  // Add new image
  const [newImg, setNewImg] = useState<Omit<DbGalleryImage, "id">>(EMPTY_IMAGE);
  const [addingImg, setAddingImg] = useState(false);
  const [editImg, setEditImg] = useState<DbGalleryImage | null>(null);
  const [editImgData, setEditImgData] = useState<DbGalleryImage | null>(null);
  const [addingVideo, setAddingVideo] = useState(false);
  const [newVideo, setNewVideo] = useState<Omit<DbHomepageVideo, "id">>(EMPTY_VIDEO);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null);

  // Gallery Picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"new-gallery" | "edit-gallery" | "edit-slide" | "edit-video-thumb" | "new-video-thumb" | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: typeof pickerTarget) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotice("error", "Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const src = reader.result as string;
      if (target === "new-gallery") setNewImg({ ...newImg, src });
      if (target === "edit-gallery" && editImgData) setEditImgData({ ...editImgData, src });
      if (target === "edit-slide" && editSlideData) setEditSlideData({ ...editSlideData, img: src });
      if (target === "new-video-thumb") setNewVideo({ ...newVideo, thumbnail_url: src });
      if (target === "edit-video-thumb" && editVideoData) setEditVideoData({ ...editVideoData, thumbnail_url: src });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetch("/api/public/site-settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings ?? data;
        setHeroSlides(s.hero_slides ?? []);
        setGalleryImages(s.gallery_images ?? []);
        setHomepageVideos(s.homepage_videos ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const showNotice = (type: "success" | "error", msg: string) => {
    setNotice({ type, msg });
    setTimeout(() => setNotice(null), 3500);
  };

  const save = async (patch: { hero_slides?: DbHeroSlide[]; gallery_images?: DbGalleryImage[]; homepage_videos?: DbHomepageVideo[] }) => {
    // Check if we're likely on Netlify and the payload is too big
    // We only check if there's a video in the patch to avoid heavy stringify on simple text updates
    if (patch.homepage_videos && window.location.hostname.includes("netlify.app")) {
      const videoSize = JSON.stringify(patch.homepage_videos).length;
      if (videoSize > 5 * 1024 * 1024) {
        showNotice("error", "Video is too large for Netlify (max 6MB). Please use a smaller video.");
        return false;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      if (!res.ok) {
        if (res.status === 413) {
          showNotice("error", "The video file is too large for the server. Try a shorter video.");
        } else {
          showNotice("error", `Server error (${res.status}). Please try again.`);
        }
        return false;
      }

      const data = await res.json();
      if (!data.ok) { 
        showNotice("error", data.error || "Failed to save. Please try again."); 
        return false; 
      }

      showNotice("success", "Saved successfully!");
      return true;
    } catch (err) {
      showNotice("error", "Network timeout or connection lost. The video might be too large to upload.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ── Hero slide actions ────────────────────────────────────────────────────────

  const openEditSlide = (slide: DbHeroSlide) => {
    setEditSlide(slide);
    setEditSlideData({ ...slide });
  };

  const closeEditSlide = () => { setEditSlide(null); setEditSlideData(null); };

  const saveEditSlide = async () => {
    if (!editSlideData) return;
    const updated = heroSlides.map((s) => s.id === editSlideData.id ? editSlideData : s);
    const ok = await save({ hero_slides: updated });
    if (ok) { setHeroSlides(updated); closeEditSlide(); }
  };

  const addSlide = async () => {
    const newSlide: DbHeroSlide = { id: genId(), ...EMPTY_SLIDE };
    const updated = [...heroSlides, newSlide];
    const ok = await save({ hero_slides: updated });
    if (ok) { setHeroSlides(updated); openEditSlide(newSlide); }
  };

  const deleteSlide = async (id: string) => {
    if (heroSlides.length <= 1) { showNotice("error", "At least one slide is required."); return; }
    const updated = heroSlides.filter((s) => s.id !== id);
    const ok = await save({ hero_slides: updated });
    if (ok) setHeroSlides(updated);
  };

  const moveSlide = async (idx: number, dir: -1 | 1) => {
    const to = idx + dir;
    if (to < 0 || to >= heroSlides.length) return;
    const arr = [...heroSlides];
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    const ok = await save({ hero_slides: arr });
    if (ok) setHeroSlides(arr);
  };

  // ── Gallery image actions ─────────────────────────────────────────────────────

  const addGalleryImage = async () => {
    if (!newImg.src.trim()) { showNotice("error", "Image URL is required."); return; }
    const img: DbGalleryImage = { id: genId(), src: newImg.src.trim(), alt: newImg.alt.trim() || "Gallery image" };
    const updated = [...galleryImages, img];
    const ok = await save({ gallery_images: updated });
    if (ok) { setGalleryImages(updated); setNewImg(EMPTY_IMAGE); setAddingImg(false); }
  };

  const deleteGalleryImage = async (id: string) => {
    const updated = galleryImages.filter((img) => img.id !== id);
    const ok = await save({ gallery_images: updated });
    if (ok) setGalleryImages(updated);
  };

  const openEditGallery = (img: DbGalleryImage) => {
    setEditImg(img);
    setEditImgData({ ...img });
  };

  const closeEditGallery = () => {
    setEditImg(null);
    setEditImgData(null);
  };

  const saveEditGallery = async () => {
    if (!editImgData) return;
    const updated = galleryImages.map((img) => img.id === editImgData.id ? editImgData : img);
    const ok = await save({ gallery_images: updated });
    if (ok) {
      setGalleryImages(updated);
      closeEditGallery();
    }
  };

  // ── Video actions ─────────────────────────────────────────────────────────────

  const openEditVideo = (video: DbHomepageVideo) => {
    setEditVideo(video);
    setEditVideoData({ ...video });
  };

  const closeEditVideo = () => { setEditVideo(null); setEditVideoData(null); };

  const saveEditVideo = async () => {
    if (!editVideoData) return;
    const updated = homepageVideos.map((v) => v.id === editVideoData.id ? editVideoData : v);
    const ok = await save({ homepage_videos: updated });
    if (ok) { setHomepageVideos(updated); closeEditVideo(); }
  };

  const addVideo = async () => {
    try {
      if (!newVideo.url) { showNotice("error", "Please select a video file first."); return; }
      const video: DbHomepageVideo = { id: genId(), ...newVideo, order: homepageVideos.length };
      const updated = [...homepageVideos, video];
      const ok = await save({ homepage_videos: updated });
      if (ok) { 
        setHomepageVideos(updated); 
        setNewVideo(EMPTY_VIDEO); 
        setAddingVideo(false); 
      }
    } catch (err) {
      showNotice("error", "An unexpected error occurred while adding the video.");
    }
  };

  const deleteVideo = async (id: string) => {
    const updated = homepageVideos.filter((v) => v.id !== id);
    const ok = await save({ homepage_videos: updated });
    if (ok) setHomepageVideos(updated);
  };

  const toggleVideoEnabled = async (video: DbHomepageVideo) => {
    const updated = homepageVideos.map((v) => v.id === video.id ? { ...v, enabled: !v.enabled } : v);
    const ok = await save({ homepage_videos: updated });
    if (ok) setHomepageVideos(updated);
  };

  const moveVideo = async (idx: number, dir: -1 | 1) => {
    const to = idx + dir;
    if (to < 0 || to >= homepageVideos.length) return;
    const arr = [...homepageVideos];
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    arr.forEach((v, i) => v.order = i);
    const ok = await save({ homepage_videos: arr });
    if (ok) setHomepageVideos(arr);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-academy-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Homepage Media</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
            Manage hero slides, gallery images, and videos shown on the public homepage
          </p>
        </div>
        <Link href="/" target="_blank">
          <Button variant="outline" className="h-10 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 gap-2">
            <Eye size={14} /> Preview Homepage
          </Button>
        </Link>
      </div>

      {/* Notice */}
      {notice && (
        <div className={cn(
          "p-4 rounded-2xl border text-sm font-bold uppercase tracking-widest text-center",
          notice.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
        )}>
          {notice.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        {([
          ["hero", "Hero Slides", Layers],
          ["gallery", "Gallery", ImageIcon],
          ["videos", "Videos", Video],
        ] as const).map(([t, label, Icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              tab === t ? "bg-academy-red text-white shadow-lg" : "text-gray-500 hover:text-white"
            )}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── HERO SLIDES TAB ──────────────────────────────────────── */}
      {tab === "hero" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">
              {heroSlides.length} slide{heroSlides.length !== 1 ? "s" : ""} · auto-advances every 6 seconds
            </p>
            <Button
              variant="primary"
              onClick={addSlide}
              disabled={saving}
              className="h-9 text-[10px] font-black uppercase tracking-widest gap-2"
            >
              <Plus size={13} /> Add Slide
            </Button>
          </div>

          <div className="space-y-3">
            {heroSlides.map((slide, idx) => (
              <Card key={slide.id} className="flex items-center gap-4 p-4 border-white/8 bg-white/3 hover:border-white/15 transition-all">
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0 || saving} className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[10px] font-black">▲</button>
                  <button onClick={() => moveSlide(idx, 1)} disabled={idx === heroSlides.length - 1 || saving} className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[10px] font-black">▼</button>
                </div>

                <div className="w-6 h-6 rounded-full bg-academy-red/20 border border-academy-red/30 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-academy-red">{idx + 1}</span>
                </div>

                <div className="relative w-20 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-white/5">
                  {slide.img ? (
                    <Image src={slide.img} alt={slide.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={16} /></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-academy-gold font-black uppercase tracking-widest truncate">{slide.tag || "—"}</p>
                  <p className="text-sm font-black text-white truncate">{slide.title ? `${slide.title} ${slide.accent}` : "Untitled slide"}</p>
                  <p className="text-[11px] text-gray-500 truncate">{slide.sub || "No subtitle"}</p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" onClick={() => openEditSlide(slide)} className="h-8 w-8 p-0 bg-white/5 border-white/10 hover:bg-white/10"><Edit2 size={13} /></Button>
                  <Button variant="outline" onClick={() => deleteSlide(slide.id)} disabled={saving} className="h-8 w-8 p-0 bg-red-500/5 border-red-500/20 hover:bg-red-500/10 text-red-400"><Trash2 size={13} /></Button>
                </div>
              </Card>
            ))}

            {heroSlides.length === 0 && (
              <div className="text-center py-16 text-gray-600 font-black uppercase tracking-widest text-xs">No slides yet. Add one to get started.</div>
            )}
          </div>
        </div>
      )}

      {/* ── GALLERY IMAGES TAB ───────────────────────────────────── */}
      {tab === "gallery" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">
              {galleryImages.length} image{galleryImages.length !== 1 ? "s" : ""} · auto-scrolls on homepage
            </p>
            <Button variant="primary" onClick={() => setAddingImg(true)} className="h-9 text-[10px] font-black uppercase tracking-widest gap-2">
              <Plus size={13} /> Add Image
            </Button>
          </div>

          {addingImg && (
            <Card className="p-6 border-academy-gold/20 bg-academy-gold/5 space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-academy-gold">New Gallery Image</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input label="Image URL" placeholder="https://images.unsplash.com/..." value={newImg.src} onChange={(e) => setNewImg({ ...newImg, src: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => { setPickerTarget("new-gallery"); setPickerOpen(true); }}
                      className="h-9 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 gap-2"
                    >
                      <ImageIcon size={13} /> Gallery
                    </Button>
                    <label className="cursor-pointer">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "new-gallery")} />
                      <div className="h-9 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-white/10 transition-all">
                        <Upload size={13} /> Device
                      </div>
                    </label>
                  </div>
                </div>
                <Input label="Alt Text" placeholder="e.g. Morning Practice Session" value={newImg.alt} onChange={(e) => setNewImg({ ...newImg, alt: e.target.value })} />
              </div>
              {newImg.src && (
                <div className="relative h-32 w-full rounded-xl overflow-hidden border border-white/10">
                  <Image src={newImg.src} alt="preview" fill className="object-cover" onError={() => {}} />
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="primary" onClick={addGalleryImage} disabled={saving} className="h-9 text-[10px] font-black uppercase tracking-widest gap-2"><Save size={13} /> {saving ? "Saving…" : "Save Image"}</Button>
                <Button variant="outline" onClick={() => { setAddingImg(false); setNewImg(EMPTY_IMAGE); }} className="h-9 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10">Cancel</Button>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {galleryImages.map((img) => (
              <div key={img.id} className="group relative aspect-video rounded-2xl overflow-hidden border border-white/8 bg-academy-dark/40">
                {img.src ? (
                  <>
                    {/* Blurred background for "Auto Frame" effect */}
                    <Image src={img.src} alt="" fill className="object-cover blur-xl opacity-30" />
                    {/* Contained image to show full content */}
                    <Image src={img.src} alt={img.alt} fill className="object-contain transition-transform duration-500 group-hover:scale-105" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={24} /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-academy-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={() => openEditGallery(img)} 
                    disabled={saving}
                    className="w-8 h-8 rounded-lg bg-academy-gold text-academy-dark flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    title="Edit image"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => deleteGalleryImage(img.id)} 
                    disabled={saving}
                    className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    title="Delete image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <p className="text-[9px] font-black text-white truncate">{img.alt}</p>
                </div>
              </div>
            ))}

            {galleryImages.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-600 font-black uppercase tracking-widest text-xs">No images yet. Add one to get started.</div>
            )}
          </div>
        </div>
      )}

      {/* ── VIDEOS TAB ───────────────────────────────────────────── */}
      {tab === "videos" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white mb-1">Training Videos</h2>
              <p className="text-xs text-gray-400 font-medium">
                The first enabled video will be shown prominently in the &quot;Academy in Action&quot; section.
              </p>
            </div>
            <Button variant="primary" onClick={() => setAddingVideo(true)} className="h-9 text-[10px] font-black uppercase tracking-widest gap-2">
              <Plus size={13} /> Add Video
            </Button>
          </div>

          {/* Add video form */}
          {addingVideo && (
            <Card className="p-6 border-academy-red/20 bg-academy-red/5 space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-academy-red">New Homepage Video</p>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="flex-1 w-full">
                    <Input
                      label="Title *"
                      placeholder="e.g. Training Highlights 2024"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    />
                  </div>
                  <div className="shrink-0">
                    <input
                      type="file"
                      id="video-upload"
                      className="hidden"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const validation = validateVideoFile(file);
                        if (!validation.valid) { showNotice("error", validation.error!); return; }
                        
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          setNewVideo({ ...newVideo, url: result, title: newVideo.title || file.name.split('.')[0] });
                          setVideoUploadProgress(null);
                          showNotice("success", "Video ready! Now click 'Save Video'");
                        };
                        reader.onerror = () => {
                          setVideoUploadProgress(null);
                          showNotice("error", "Could not read the video file.");
                        };
                        reader.onprogress = (event) => {
                          if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 100);
                            setVideoUploadProgress(percent);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('video-upload')?.click()}
                      className="h-10 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 gap-2 whitespace-nowrap"
                    >
                      <Upload size={14} /> {newVideo.url ? "Change Video" : "Select Video"}
                    </Button>
                  </div>
                </div>

                {videoUploadProgress !== null && (
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-academy-red transition-all duration-300" 
                      style={{ width: `${videoUploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <Input
                label="Description (optional)"
                placeholder="Brief description of the video content"
                value={newVideo.description}
                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
              />

              <div className="flex gap-3">
                <Button variant="primary" onClick={addVideo} disabled={saving || videoUploadProgress !== null} className="h-9 text-[10px] font-black uppercase tracking-widest gap-2">
                  <Save size={13} /> {saving ? "Uploading..." : "Save Video"}
                </Button>
                <Button variant="outline" onClick={() => { setAddingVideo(false); setNewVideo(EMPTY_VIDEO); }} className="h-9 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10">
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Videos list */}
          <div className="space-y-3">
            {homepageVideos
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((video, idx) => (
                <Card key={video.id} className={cn(
                  "flex items-center gap-4 p-4 border transition-all",
                  video.enabled ? "border-white/8 bg-white/3 hover:border-white/15" : "border-white/5 bg-white/1 opacity-60"
                )}>
                  {/* Order controls */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => moveVideo(idx, -1)} disabled={idx === 0 || saving} className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[10px] font-black">▲</button>
                    <button onClick={() => moveVideo(idx, 1)} disabled={idx === homepageVideos.length - 1 || saving} className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[10px] font-black">▼</button>
                  </div>

                  {/* Video number */}
                  <div className="w-6 h-6 rounded-full bg-academy-red/20 border border-academy-red/30 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-academy-red">{idx + 1}</span>
                  </div>

                  {/* Video icon */}
                  <div className="w-14 h-14 rounded-xl bg-academy-red/10 border border-academy-red/20 flex items-center justify-center shrink-0">
                    <Video size={24} className="text-academy-red" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-academy-gold font-black uppercase tracking-widest truncate">
                      {video.enabled ? "ENABLED" : "DISABLED"}
                    </p>
                    <p className="text-sm font-black text-white truncate">{video.title || "Untitled video"}</p>
                    <p className="text-[11px] text-gray-500 truncate">{video.description || video.url || "No URL set"}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => toggleVideoEnabled(video)}
                      disabled={saving}
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                        video.enabled ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" : "bg-white/5 border border-white/10 text-gray-500 hover:bg-white/10"
                      )}
                      title={video.enabled ? "Disable video" : "Enable video"}
                    >
                      {video.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <Button variant="outline" onClick={() => openEditVideo(video)} className="h-8 w-8 p-0 bg-white/5 border-white/10 hover:bg-white/10">
                      <Edit2 size={13} />
                    </Button>
                    <Button variant="outline" onClick={() => deleteVideo(video.id)} disabled={saving} className="h-8 w-8 p-0 bg-red-500/5 border-red-500/20 hover:bg-red-500/10 text-red-400">
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </Card>
              ))}

            {homepageVideos.length === 0 && !addingVideo && (
              <div className="text-center py-16 text-gray-600 font-black uppercase tracking-widest text-xs">
                No videos yet. Add your first training video to display on the homepage.
              </div>
            )}
          </div>

          {/* Info box */}
          {homepageVideos.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Video Display Info</p>
              <ul className="text-[11px] text-gray-400 space-y-1">
                <li>&bull; Videos are shown in the &quot;Training Video&quot; section of the homepage</li>
                <li>&bull; Only enabled videos will appear on the public homepage</li>
                <li>&bull; Drag &Delta;/&nabla; to reorder video display sequence</li>
                <li>&bull; Direct upload limit: {MAX_FILE_SIZE_MB}MB (enough for ~2-3 minutes of video)</li>
                <li>&bull; Supported formats: mp4, webm, mov, avi</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── SLIDE EDIT MODAL ─────────────────────────────────────── */}
      {editSlide && editSlideData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-academy-dark/90" onClick={closeEditSlide} />
          <Card className="relative z-10 w-full max-w-2xl border-white/10 bg-academy-gray shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="text-sm font-black uppercase tracking-widest">Edit Slide</h2>
              <button onClick={closeEditSlide} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {editSlideData.img && (
                <div className="relative h-40 rounded-2xl overflow-hidden border border-white/10">
                  <Image src={editSlideData.img} alt="preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-academy-dark/30 to-academy-dark/70 flex flex-col items-center justify-center text-center px-4">
                    {editSlideData.tag && <p className="text-[10px] text-academy-gold font-black uppercase tracking-widest mb-1">{editSlideData.tag}</p>}
                    {editSlideData.title && <p className="text-lg font-black text-white leading-tight">{editSlideData.title} <span className="text-academy-gold italic">{editSlideData.accent}</span></p>}
                    {editSlideData.sub && <p className="text-[11px] text-gray-300 mt-1">{editSlideData.sub}</p>}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Input label="Background Image URL" placeholder="https://images.unsplash.com/..." value={editSlideData.img} onChange={(e) => setEditSlideData({ ...editSlideData, img: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => { setPickerTarget("edit-slide"); setPickerOpen(true); }}
                    className="h-10 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 gap-2"
                  >
                    <ImageIcon size={14} /> From Gallery
                  </Button>
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "edit-slide")} />
                    <div className="h-10 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-white/10 transition-all">
                      <Upload size={14} /> From Device
                    </div>
                  </label>
                </div>
              </div>
              
              <Input label="Tag / Badge Text" placeholder="e.g. Professional Cricket Coaching" value={editSlideData.tag} onChange={(e) => setEditSlideData({ ...editSlideData, tag: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Headline (line 1)" placeholder="e.g. WHERE CHAMPIONS" value={editSlideData.title} onChange={(e) => setEditSlideData({ ...editSlideData, title: e.target.value })} />
                <Input label="Headline (line 2 — gold italic)" placeholder="e.g. ARE FORGED" value={editSlideData.accent} onChange={(e) => setEditSlideData({ ...editSlideData, accent: e.target.value })} />
              </div>
              <Input label="Sub-text" placeholder="e.g. Mira Bhayander's Premier Cricket Academy" value={editSlideData.sub} onChange={(e) => setEditSlideData({ ...editSlideData, sub: e.target.value })} />
            </div>

            <div className="flex gap-3 p-6 border-t border-white/8">
              <Button variant="primary" onClick={saveEditSlide} disabled={saving} className="h-10 text-[10px] font-black uppercase tracking-widest gap-2">
                {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                {saving ? "Saving…" : "Save Slide"}
              </Button>
              <Button variant="outline" onClick={closeEditSlide} className="h-10 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10">Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── VIDEO EDIT MODAL ─────────────────────────────────────── */}
      {editVideo && editVideoData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-academy-dark/90" onClick={closeEditVideo} />
          <Card className="relative z-10 w-full max-w-2xl border-white/10 bg-academy-gray shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="text-sm font-black uppercase tracking-widest">Edit Video</h2>
              <button onClick={closeEditVideo} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="flex-1 w-full">
                    <Input
                      label="Title *"
                      placeholder="e.g. Training Highlights 2024"
                      value={editVideoData.title}
                      onChange={(e) => setEditVideoData({ ...editVideoData, title: e.target.value })}
                    />
                  </div>
                  <div className="shrink-0">
                    <input
                      type="file"
                      id="video-edit-upload"
                      className="hidden"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const validation = validateVideoFile(file);
                        if (!validation.valid) { showNotice("error", validation.error!); return; }
                        
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          setEditVideoData({ ...editVideoData, url: result });
                          setVideoUploadProgress(null);
                          showNotice("success", "Video ready! Now click 'Save Video'");
                        };
                        reader.onerror = () => {
                          setVideoUploadProgress(null);
                          showNotice("error", "Could not read the video file.");
                        };
                        reader.onprogress = (event) => {
                          if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 100);
                            setVideoUploadProgress(percent);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('video-edit-upload')?.click()}
                      className="h-10 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 gap-2 whitespace-nowrap"
                    >
                      <RefreshCw size={14} /> Replace Video File
                    </Button>
                  </div>
                </div>

                {videoUploadProgress !== null && (
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-academy-red transition-all duration-300" 
                      style={{ width: `${videoUploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <Input
                label="Description"
                placeholder="Brief description of the video content"
                value={editVideoData.description}
                onChange={(e) => setEditVideoData({ ...editVideoData, description: e.target.value })}
              />

              {/* Enable/disable toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white">Video Status</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {editVideoData.enabled ? "Video is visible on homepage" : "Video is hidden from homepage"}
                  </p>
                </div>
                <button
                  onClick={() => setEditVideoData({ ...editVideoData, enabled: !editVideoData.enabled })}
                  className={cn(
                    "h-10 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                    editVideoData.enabled ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400" : "bg-white/5 border border-white/20 text-gray-500"
                  )}
                >
                  {editVideoData.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {editVideoData.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-white/8">
              <Button variant="primary" onClick={saveEditVideo} disabled={saving || videoUploadProgress !== null} className="h-10 text-[10px] font-black uppercase tracking-widest gap-2">
                {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                {saving ? "Saving…" : "Save Video"}
              </Button>
              <Button variant="outline" onClick={closeEditVideo} className="h-10 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10">Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── GALLERY EDIT MODAL ───────────────────────────────────── */}
      {editImg && editImgData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-academy-dark/90" onClick={closeEditGallery} />
          <Card className="relative z-10 w-full max-w-xl border-white/10 bg-academy-gray shadow-2xl overflow-hidden rounded-[2rem]">
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="text-sm font-black uppercase tracking-widest">Edit Gallery Image</h2>
              <button onClick={closeEditGallery} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <ImageIcon size={12} className="text-academy-gold" /> Image Source
                </label>
                {editImgData.src ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
                    <img src={editImgData.src} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-academy-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="p-3 bg-white text-academy-dark rounded-xl cursor-pointer hover:scale-110 transition-transform shadow-xl">
                        <Upload size={18} />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "edit-gallery")} />
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setEditImgData({ ...editImgData, src: "" })}
                        className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform shadow-xl"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input 
                      value={editImgData.src} 
                      onChange={(e) => setEditImgData({ ...editImgData, src: e.target.value })} 
                      className="bg-white/5 border-white/10 h-12 text-white" 
                      placeholder="Paste image URL here..." 
                    />
                    <div className="relative h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center group hover:border-academy-gold/30 transition-all cursor-pointer bg-white/5">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleImageUpload(e, "edit-gallery")} />
                      <Upload size={24} className="text-gray-500 group-hover:text-academy-gold transition-colors mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-gray-400">Click or Drag to Upload</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => { setPickerTarget("edit-gallery"); setPickerOpen(true); }}
                  className="h-10 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 gap-2"
                >
                  <ImageIcon size={14} /> From Gallery
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Image Alt Title</label>
                <Input 
                  required 
                  value={editImgData.alt} 
                  onChange={(e) => setEditImgData({ ...editImgData, alt: e.target.value })} 
                  className="bg-white/5 border-white/10 h-12 text-white" 
                  placeholder="e.g. Training Session 2026" 
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-white/8">
              <Button variant="primary" onClick={saveEditGallery} disabled={saving} className="flex-1 h-11 text-[10px] font-black uppercase tracking-widest gap-2 shadow-xl shadow-academy-red/20">
                {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                {saving ? "Saving…" : "Update Image"}
              </Button>
              <Button variant="outline" onClick={closeEditGallery} className="h-11 px-8 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10">Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── GALLERY PICKER ───────────────────────────────────────── */}
      {pickerOpen && (
        <GalleryPicker
          currentSrc={
            pickerTarget === "new-gallery" ? newImg.src :
            pickerTarget === "edit-gallery" ? editImgData?.src :
            pickerTarget === "edit-slide" ? editSlideData?.img :
            pickerTarget === "new-video-thumb" ? newVideo.thumbnail_url :
            pickerTarget === "edit-video-thumb" ? editVideoData?.thumbnail_url :
            undefined
          }
          onClose={() => { setPickerOpen(false); setPickerTarget(null); }}
          onSelect={(src) => {
            if (pickerTarget === "new-gallery") setNewImg({ ...newImg, src });
            if (pickerTarget === "edit-gallery" && editImgData) setEditImgData({ ...editImgData, src });
            if (pickerTarget === "edit-slide" && editSlideData) setEditSlideData({ ...editSlideData, img: src });
            if (pickerTarget === "new-video-thumb") setNewVideo({ ...newVideo, thumbnail_url: src });
            if (pickerTarget === "edit-video-thumb" && editVideoData) setEditVideoData({ ...editVideoData, thumbnail_url: src });
            setPickerOpen(false);
            setPickerTarget(null);
          }}
        />
      )}
    </div>
  );
}
