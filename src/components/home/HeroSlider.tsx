"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { DbHeroSlide } from "@/server/db/inMemoryDb";

const FALLBACK_SLIDES: DbHeroSlide[] = [
  { id: "hs1", img: "https://images.unsplash.com/photo-1531415074968-036ba1b575da", tag: "Professional Cricket Coaching", title: "WHERE CHAMPIONS", accent: "ARE FORGED", sub: "Mira Bhayander's Premier Cricket Academy — building champions since 2011." },
  { id: "hs2", img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e", tag: "Match Exposure", title: "COMPETE AT", accent: "EVERY LEVEL", sub: "From local tournaments to state competitions — real match experience every season." },
  { id: "hs3", img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e", tag: "Elite Training Facilities", title: "TRAIN LIKE", accent: "A PRO", sub: "International-grade turf pitches, video analysis, and certified coaches." },
];

interface HeroSliderProps {
  slides?: DbHeroSlide[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const SLIDES = (slides && slides.length > 0) 
    ? slides.filter(s => s.img && s.img.trim() !== "") 
    : FALLBACK_SLIDES;
  const [current, setCurrent] = useState(0);
  const [locked, setLocked] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (locked) return;
      setLocked(true);
      setCurrent(idx);
      setTimeout(() => setLocked(false), 900);
    },
    [locked]
  );

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo, SLIDES.length]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo, SLIDES.length]);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section className="relative h-screen overflow-hidden bg-academy-dark">
      {/* Background slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === current ? "opacity-100 z-[1]" : "opacity-0 z-0"
          )}
        >
          <Image
            src={slide.img}
            alt={slide.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-academy-dark/40 via-academy-dark/55 to-academy-dark z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-r from-academy-dark/50 to-transparent z-[1]" />
        </div>
      ))}

      {/* Ambient glow blobs */}
      <div className="absolute -top-32 left-0 w-[700px] h-[700px] bg-academy-gold/6 blur-[250px] rounded-full pointer-events-none z-[2]" />
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-academy-red/6 blur-[250px] rounded-full pointer-events-none z-[2]" />

      {/* Centre content */}
      <div className="relative z-[3] h-full flex flex-col items-center justify-center text-center px-6">
        <div key={current} className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/5 border border-white/15 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-8 text-academy-gold">
            <span className="w-2 h-2 rounded-full bg-academy-red animate-pulse" />
            {SLIDES[current].tag}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[0.88] tracking-tight mb-5 text-white">
            {SLIDES[current].title}
            <br />
            <span className="text-academy-gold italic">{SLIDES[current].accent}</span>
          </h1>

          {/* Sub-heading */}
          <p className="text-sm md:text-base text-gray-300/90 mb-10 font-medium max-w-lg mx-auto leading-relaxed">
            {SLIDES[current].sub}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-52 h-14 text-sm uppercase tracking-widest font-black shadow-2xl shadow-academy-red/30"
              >
                Join Now <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-52 h-14 text-sm uppercase tracking-widest font-black bg-white/5 border-white/10 hover:bg-white/10"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress dots */}
        <div className="absolute bottom-24 flex items-center gap-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === current ? "w-10 bg-academy-gold" : "w-5 bg-white/25 hover:bg-white/50"
              )}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-[88px] right-6 md:right-10 text-[10px] font-black uppercase tracking-widest text-gray-600 select-none">
          <span className="text-white">{String(current + 1).padStart(2, "0")}</span> /{" "}
          {String(SLIDES.length).padStart(2, "0")}
        </div>
      </div>

      {/* Prev / Next arrows */}
      {(["prev", "next"] as const).map((dir) => (
        <button
          key={dir}
          onClick={dir === "prev" ? prev : next}
          aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-[4] w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 hover:border-white/25 transition-all group",
            dir === "prev" ? "left-4 md:left-8" : "right-4 md:right-8"
          )}
        >
          {dir === "prev" ? (
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>
      ))}

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[4] flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-academy-gold/50 to-transparent" />
      </div>
    </section>
  );
}
