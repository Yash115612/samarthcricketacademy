"use client";

import React, { useRef, memo, useState } from "react";
import { cn } from "@/lib/utils";
import { Play, Loader2 } from "lucide-react";

interface Base64VideoPlayerProps {
  base64Url: string;
  className?: string;
  title?: string;
  description?: string;
}

export const Base64VideoPlayer = memo(function Base64VideoPlayer({ base64Url, className, title, description }: Base64VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!base64Url) return null;

  const handlePlay = () => {
    if (videoRef.current) {
      setIsLoading(true);
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <div className={cn("relative w-full h-full bg-black flex items-center justify-center group", className)}>
      <video
        ref={videoRef}
        src={base64Url}
        loop
        playsInline
        controls={isPlaying}
        preload="metadata"
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isPlaying ? "opacity-100" : "opacity-40"
        )}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Initial Play Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <button
            onClick={handlePlay}
            disabled={isLoading}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-academy-red flex items-center justify-center shadow-2xl shadow-academy-red/40 hover:scale-110 transition-transform disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={32} className="text-white animate-spin" />
            ) : (
              <Play size={32} fill="white" className="ml-1 text-white" />
            )}
          </button>
          {!isLoading && (
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 animate-pulse">
              Click to load video
            </p>
          )}
        </div>
      )}

      {/* Caption overlay - only show when not playing */}
      {!isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-academy-dark/90 to-transparent pointer-events-none z-10">
          <p className="text-[9px] font-black uppercase tracking-widest text-academy-gold mb-1">{title || "Academy in Action"}</p>
          <p className="text-sm md:text-base font-black text-white">{description || "Samarth Cricket Academy — Training Highlights"}</p>
        </div>
      )}
    </div>
  );
});
