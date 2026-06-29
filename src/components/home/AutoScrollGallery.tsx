"use client";

import Image from "next/image";
import type { DbGalleryImage } from "@/server/db/inMemoryDb";

const FALLBACK_IMAGES: DbGalleryImage[] = [
  { id: "gi1", src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da", alt: "Cricket Stadium" },
  { id: "gi2", src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e", alt: "Match Action" },
  { id: "gi3", src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da", alt: "Net Practice" },
  { id: "gi4", src: "https://images.unsplash.com/photo-1593341646782-e0b495cff86d", alt: "Victory Celebration" },
  { id: "gi5", src: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972", alt: "Cricket Ground" },
  { id: "gi6", src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da", alt: "Stadium Lights" },
  { id: "gi7", src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e", alt: "Batting" },
  { id: "gi8", src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da", alt: "Bowling Practice" },
];

interface AutoScrollGalleryProps {
  images?: DbGalleryImage[];
}

export function AutoScrollGallery({ images: propImages }: AutoScrollGalleryProps) {
  const source = (propImages && propImages.length > 0) 
    ? propImages.filter(img => img.src && img.src.trim() !== "") 
    : FALLBACK_IMAGES;
  const images = [...source, ...source];

  return (
    <div className="relative overflow-hidden py-2">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-academy-dark to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-academy-dark to-transparent z-10 pointer-events-none" />

      <div
        className="flex gap-4"
        style={{
          width: "max-content",
          animation: "gallery-scroll 40s linear infinite",
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="relative w-64 h-44 md:w-80 md:h-56 rounded-2xl overflow-hidden shrink-0 border border-white/8 group bg-academy-dark/40"
          >
            {/* Blurred background for "Auto Frame" effect */}
            <Image 
              src={img.src} 
              alt="" 
              fill 
              className="object-cover blur-xl opacity-30" 
            />
            {/* Contained image to show full content */}
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 256px, 320px"
              className="object-contain transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-academy-dark/50 to-transparent opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
}
