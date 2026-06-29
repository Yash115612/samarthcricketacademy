import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Trophy, Users, Star, Calendar, Target, Dumbbell, Video, ArrowRight, Check, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { cn } from "@/lib/utils";
import { MEMBERSHIP_PLANS } from "@/data/plans";
import { siteSettings, ensureDbSynced } from "@/server/db/inMemoryDb";
import { HeroSlider } from "@/components/home/HeroSlider";
import { AutoScrollGallery } from "@/components/home/AutoScrollGallery";
import { Base64VideoPlayer } from "@/components/home/Base64VideoPlayer";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureDbSynced();
  const settings = siteSettings.get();

  return (
    <main className="min-h-screen bg-academy-dark text-white overflow-x-hidden">
      <Navbar />

      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <HeroSlider slides={settings.hero_slides} />

      {/* ── 2. STATS STRIP ──────────────────────────────────────── */}
      <section id="explore-section" className="relative z-20 py-0">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 -mt-1 border-t border-white/5">
            {[
              { label: "Players Trained", value: settings.players_trained, icon: Users, color: "text-blue-400" },
              { label: "Tournament Wins", value: settings.tournament_wins, icon: Trophy, color: "text-academy-gold" },
              { label: "Certified Coaches", value: settings.certified_coaches, icon: Star, color: "text-academy-red" },
              { label: "Matches Played", value: settings.matches_played, icon: Calendar, color: "text-emerald-400" },
            ].map((stat, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center justify-center py-10 px-6 gap-3 border-white/5",
                  i < 3 ? "border-r" : "",
                  i < 2 ? "border-b md:border-b-0" : "",
                  "bg-academy-gray/20"
                )}
              >
                <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/8", stat.color)}>
                  <stat.icon size={22} />
                </div>
                <span className="text-3xl md:text-4xl font-black text-white tabular-nums">{stat.value}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. ABOUT PREVIEW ────────────────────────────────────── */}
      <section className="py-28 md:py-36 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image side */}
          <FadeIn direction="right">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-academy-red/20 to-academy-gold/10 rounded-[2.5rem] blur-2xl opacity-60" />
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] border border-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e"
                  alt="Academy training"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-academy-dark/60 to-transparent" />
              </div>
              {/* Badge */}
              <div className="absolute -bottom-6 -right-6 md:-right-8 bg-academy-gold text-academy-dark p-5 rounded-2xl font-black text-center shadow-2xl shadow-academy-gold/30 z-10">
                <span className="text-3xl md:text-4xl block leading-none">15</span>
                <span className="text-[9px] uppercase tracking-widest">Years of Excellence</span>
              </div>
            </div>
          </FadeIn>

          {/* Text side */}
          <FadeIn direction="left" delay={0.15}>
            <div className="space-y-7 mt-8 lg:mt-0">
              <div className="inline-flex items-center gap-2 text-academy-red text-[11px] font-black uppercase tracking-[0.25em]">
                <span className="w-8 h-px bg-academy-red" /> Mira Bhayander&apos;s Academy
              </div>
              <h2 className="text-3xl md:text-5xl font-black leading-[0.95] tracking-tight">
                BUILT FOR<br />
                <span className="text-academy-gold">SERIOUS</span><br />
                CRICKETERS.
              </h2>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Founded in 2011, Samarth Cricket Academy has been building disciplined, skilled, and
                confident cricketers from Mira Bhayander. Our structured methodology and experienced
                coaches give every player the tools to compete at the highest level.
              </p>
              <ul className="space-y-3">
                {[
                  "International Standard Turf Pitches",
                  "Advanced Video Analysis Systems",
                  "Certified Strength & Conditioning",
                  "Pathways to District, State & National Teams",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-xs font-bold text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-academy-gold/15 border border-academy-gold/30 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-academy-gold" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/about">
                <Button variant="primary" size="lg" className="mt-2 uppercase tracking-widest font-black h-13 px-8">
                  Learn More <ArrowRight className="ml-2" size={16} />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 4. TRAINING VIDEO ────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 bg-academy-gray/20 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 text-academy-gold text-[11px] font-black uppercase tracking-[0.25em]">
                <Video size={14} /> Academy in Action
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">SEE US TRAIN</h2>
              <p className="text-gray-400 max-w-xl mx-auto text-sm">
                Watch how our coaches bring out the best in every player &mdash; from technique to temperament.
              </p>
            </div>
          </FadeIn>

          {settings.homepage_videos && settings.homepage_videos.filter(v => v.enabled).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {settings.homepage_videos
                .filter(v => v.enabled)
                .sort((a, b) => a.order - b.order)
                .map((video) => (
                  <FadeIn key={video.id} direction="up" delay={0.1}>
                    <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/40 aspect-video group">
                      <Base64VideoPlayer 
                        base64Url={video.url} 
                        title={video.title} 
                        description={video.description} 
                      />
                    </div>
                  </FadeIn>
                ))}
            </div>
          ) : (
            <FadeIn direction="up" delay={0.1}>
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/40 aspect-video group cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e"
                  alt="Training video preview"
                  fill
                  className="object-cover grayscale-[30%] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-academy-dark/50 group-hover:bg-academy-dark/40 transition-colors" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-academy-red flex items-center justify-center shadow-2xl shadow-academy-red/50 group-hover:scale-110 transition-transform">
                    <Play size={32} fill="white" className="ml-1 text-white" />
                  </div>
                </div>

                {/* Caption strip */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-academy-dark to-transparent">
                  <p className="text-[9px] font-black uppercase tracking-widest text-academy-gold mb-1">Watch Now</p>
                  <p className="text-sm md:text-base font-black text-white">Samarth Cricket Academy — Training Highlights</p>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ── 5. AUTO-SCROLL GALLERY ───────────────────────────────── */}
      <section className="py-20 md:py-28 overflow-hidden">
        <FadeIn direction="up">
          <div className="text-center mb-12 px-6 space-y-3">
            <div className="inline-flex items-center gap-2 text-academy-gold text-[11px] font-black uppercase tracking-[0.25em]">
              <Star size={12} fill="currentColor" /> Gallery
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">MOMENTS THAT MATTER</h2>
          </div>
        </FadeIn>
        <AutoScrollGallery images={settings.gallery_images} />
        <div className="text-center mt-10 px-6">
          <Link href="/gallery">
            <Button variant="outline" className="uppercase tracking-widest text-xs font-black h-12 px-8 bg-white/5 border-white/15 hover:bg-white/10">
              View Full Gallery <ArrowRight className="ml-2" size={14} />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── 6. TRAINING PROGRAMS ────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 bg-academy-gray/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 text-academy-gold text-[11px] font-black uppercase tracking-[0.25em]">
                <Calendar size={14} /> Training Programs
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">CHOOSE YOUR BATCH</h2>
              <p className="text-gray-400 max-w-lg mx-auto text-sm">
                Flexible schedules for students, professionals, and serious athletes.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Morning Stars",
                time: "06:00 – 09:00 AM",
                days: "Mon – Fri",
                desc: "Technical drills & fitness for early risers",
                img: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=800&auto=format&fit=crop",
              },
              {
                name: "Afternoon Elite",
                time: "04:00 – 07:00 PM",
                days: "Mon – Fri",
                desc: "High-intensity sessions with match-play focus",
                img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop",
              },
              {
                name: "Evening Pro",
                time: "07:00 – 09:00 PM",
                days: "Mon – Fri",
                desc: "Advanced coaching under stadium lights",
                img: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=800&auto=format&fit=crop",
              },
              {
                name: "Weekend Warrior",
                time: "08:00 – 11:00 AM",
                days: "Sat – Sun",
                desc: "Intensive weekends for busy schedules",
                img: "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?q=80&w=800&auto=format&fit=crop",
              },
            ].map((batch, i) => (
              <FadeIn key={i} direction="up" delay={i * 0.08}>
                <Link href="/batches" className="group block">
                  <div className="relative rounded-[1.5rem] overflow-hidden border border-white/8 hover:border-academy-gold/40 transition-all duration-500 bg-academy-gray/30">
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={batch.img}
                        alt={batch.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-academy-dark via-academy-dark/30 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-academy-gold text-[10px] font-black uppercase tracking-widest">{batch.days}</p>
                        <h3 className="text-base font-black uppercase tracking-tight text-white">{batch.name}</h3>
                      </div>
                    </div>

                    {/* Info strip */}
                    <div className="p-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-white mb-0.5">{batch.time}</p>
                        <p className="text-[11px] text-gray-500 font-medium">{batch.desc}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-academy-gold group-hover:border-academy-gold transition-all">
                        <ArrowRight size={14} className="group-hover:text-black transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. WHY CHOOSE US ────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 text-academy-gold text-[11px] font-black uppercase tracking-[0.25em]">
                <Trophy size={14} /> Why Samarth
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">THE SAMARTH<br />ADVANTAGE</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Experienced Coaches",
                desc: "Certified coaches with domestic & competitive playing backgrounds guide every session.",
                color: "text-blue-400",
                bg: "from-blue-500/10",
              },
              {
                icon: Trophy,
                title: "Match Exposure",
                desc: "Regular tournament participation builds match temperament and competitive mindset.",
                color: "text-academy-gold",
                bg: "from-yellow-500/10",
              },
              {
                icon: Target,
                title: "Professional Training",
                desc: "Structured drills, video analysis, and performance tracking for every age group.",
                color: "text-academy-red",
                bg: "from-red-500/10",
              },
              {
                icon: Dumbbell,
                title: "Fitness Programs",
                desc: "Sport-specific conditioning programs to keep players match-ready year-round.",
                color: "text-emerald-400",
                bg: "from-emerald-500/10",
              },
              {
                icon: Video,
                title: "Video Analysis",
                desc: "Modern video review sessions to pinpoint technique improvements and tactical awareness.",
                color: "text-purple-400",
                bg: "from-purple-500/10",
              },
              {
                icon: Star,
                title: "Career Pathways",
                desc: "Structured progression from academy to district, state, and national selection pathways.",
                color: "text-orange-400",
                bg: "from-orange-500/10",
              },
            ].map((item, i) => (
              <FadeIn key={i} direction="up" delay={i * 0.06}>
                <div
                  className={cn(
                    "relative rounded-[1.5rem] border border-white/8 p-8 bg-gradient-to-b to-transparent overflow-hidden group hover:border-white/15 transition-all duration-500",
                    item.bg
                  )}
                >
                  <div className={cn("w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6", item.color)}>
                    <item.icon size={26} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tight mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. MEMBERSHIP PLANS ─────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 bg-academy-gray/20 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-academy-gold/4 blur-[180px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn direction="up">
            <div className="text-center mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 text-academy-gold text-[11px] font-black uppercase tracking-[0.25em]">
                <Star size={12} fill="currentColor" /> Membership
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">CHOOSE YOUR PLAN</h2>
              <p className="text-gray-400 max-w-xl mx-auto text-sm">
                Flexible plans designed for every stage of a cricketer&apos;s journey.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {MEMBERSHIP_PLANS.map((plan, i) => (
              <FadeIn key={plan.id} delay={i * 0.1} direction="up">
                <div
                  className={cn(
                    "relative flex flex-col h-full rounded-[1.5rem] border p-8 transition-all duration-500",
                    plan.popular
                      ? "border-academy-gold bg-academy-gold/5 shadow-2xl shadow-academy-gold/10 scale-105 z-10"
                      : "border-white/10 bg-white/3 hover:border-white/20"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 bg-academy-gold text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                        <Star size={10} fill="black" /> Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">{plan.label}</p>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-academy-gold">Click to view pricing & subscribe</span>
                    </div>
                    <p className="text-[11px] text-academy-gold font-black uppercase tracking-widest">{plan.duration_label}</p>
                  </div>

                  <ul className="space-y-3 mb-10 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                        <Check
                          size={16}
                          className={cn("mt-0.5 shrink-0", plan.popular ? "text-academy-gold" : "text-academy-red")}
                        />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={(plan as any).contactOnly ? "/membership/pt-contact" : `/membership/pay?plan=${plan.id}`}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      plan.popular
                        ? "bg-academy-gold text-black hover:bg-academy-gold/90 shadow-lg shadow-academy-gold/20"
                        : "bg-white/8 text-white hover:bg-white/15 border border-white/10"
                    )}
                  >
                    {(plan as any).contactOnly ? "Contact Us" : "Select Plan"} <ArrowRight size={13} />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/membership" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors group">
              View All Detailed Plans <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 9. CTA SECTION ──────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn direction="up">
            <div className="relative rounded-[2.5rem] overflow-hidden">
              {/* Background image */}
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972"
                  alt="Cricket ground"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-academy-red via-academy-red/90 to-academy-dark/80" />
              </div>

              {/* Content */}
              <div className="relative z-10 p-10 md:p-20 text-center">
                <div className="inline-flex items-center gap-2 text-white/70 text-[11px] font-black uppercase tracking-[0.25em] mb-6">
                  <span className="w-2 h-2 rounded-full bg-academy-gold animate-pulse" /> Limited Seats Available
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-[0.9] tracking-tight mb-6 uppercase">
                  Start Your<br />Cricket Journey<br />
                  <span className="text-academy-gold">Today.</span>
                </h2>
                <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
                  Join Samarth Cricket Academy in Mira Bhayander. Train under certified coaches with a proven track
                  record. Enrol before the new season begins.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-56 h-14 text-sm uppercase tracking-widest font-black shadow-2xl shadow-black/30"
                    >
                      Register Now <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-56 h-14 text-sm uppercase tracking-widest font-black text-white border-white/25 bg-white/10 hover:bg-white/20"
                    >
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
