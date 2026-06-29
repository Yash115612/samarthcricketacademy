"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Star, Shield, Award, Users, Target, Activity, MapPin, ChevronDown, X, Phone, Mail, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CoachesPageContent() {
  const searchParams = useSearchParams();
  const branchFromUrl = searchParams.get("branch") as "samarth" | "aims" | null;
  const [selectedBranch, setSelectedBranch] = useState(branchFromUrl || "samarth");
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoachForProfile, setSelectedCoachForProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/public/site-settings", { cache: "no-store" });
        const data = await res.json();
        if (data.ok) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (selectedCoachForProfile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedCoachForProfile]);

  useEffect(() => {
    const loadCoaches = async () => {
      try {
        const res = await fetch(`/api/public/settings?branch=${selectedBranch}`);
        const data = await res.json();
        // Since we don't have a direct public coaches API yet, 
        // we'll use a new one or the staff list if available.
        // For now, let's create a dedicated public API for coaches.
        const coachRes = await fetch(`/api/admin/coaches`); // Temporary: should be public
        const coachData = await coachRes.json();
        if (coachData.ok) {
          // Filter by branch manually if the API returns all
          setCoaches(coachData.coaches.filter((c: any) => c.branch_id === selectedBranch && c.status === "Active"));
        }
      } catch (err) {
        console.error("Failed to load coaches");
      } finally {
        setLoading(false);
      }
    };
    loadCoaches();
  }, [selectedBranch]);

  return (
    <main className="min-h-screen pt-24">
      <Navbar />
      
      {/* Page Header */}
      <section className="py-20 px-6 bg-gradient-to-b from-academy-red/10 to-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all">
                <MapPin size={16} className="text-academy-gold" />
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  {selectedBranch === "samarth" ? "Samarth Academy (Mira Bhayander)" : "AIMS Academy (Mumbai)"}
                </span>
                <ChevronDown size={14} className="text-gray-500 group-hover:text-academy-gold transition-transform group-hover:rotate-180" />
              </div>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-academy-gray border border-white/10 rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button 
                  onClick={() => setSelectedBranch("samarth")}
                  className={`w-full text-left block px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors ${selectedBranch === "samarth" ? "text-academy-gold bg-white/5" : "text-gray-400"}`}
                >
                  Samarth Academy (Mira Bhayander)
                </button>
                <button 
                  onClick={() => setSelectedBranch("aims")}
                  className={`w-full text-left block px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors ${selectedBranch === "aims" ? "text-academy-gold bg-white/5" : "text-gray-400"}`}
                >
                  AIMS Academy (Mumbai)
                </button>
              </div>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight text-white">OUR COACHES</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Learn from certified professionals at our {selectedBranch === "samarth" ? "Mira Bhayander" : "Mumbai"} branch.
            Our coaching staff brings years of domestic and competitive experience to every training session.
          </p>
        </div>
      </section>

      {/* Coaches Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {coaches.map((coach, i) => (
                <Card key={i} className="group overflow-hidden border-white/5 hover:border-academy-red transition-all duration-500 bg-academy-gray/50 backdrop-blur-xl">
                  <div className="relative aspect-[3/4] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                    <Image 
                      src={coach.image || "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2070&auto=format&fit=crop"} 
                      alt={coach.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-academy-dark via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-6 left-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-academy-red bg-academy-red/10 px-3 py-1 rounded-full mb-2 inline-block">
                        {coach.experience}
                      </span>
                      <h4 className="text-2xl font-black uppercase tracking-tight text-white">{coach.name}</h4>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-academy-gold">{coach.role}</span>
                      {coach.bio && (
                        <p className="text-sm text-gray-400 font-medium line-clamp-3">{coach.bio}</p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedCoachForProfile(coach)}
                      className="w-full uppercase tracking-widest text-[10px] font-black h-12 bg-white/5 border-white/20 group-hover:bg-academy-red group-hover:text-white group-hover:border-academy-red transition-all"
                    >
                      View Full Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {coaches.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-500 font-black uppercase tracking-widest">
                  No coaches listed for this branch yet.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Full Profile Modal */}
      {selectedCoachForProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div 
            className="absolute inset-0 bg-academy-dark/95 backdrop-blur-xl animate-in fade-in duration-300" 
            onClick={() => setSelectedCoachForProfile(null)}
          ></div>
          
          <Card className="relative w-full max-w-5xl bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedCoachForProfile(null)}
              className="absolute top-6 right-6 z-50 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all hover:rotate-90"
            >
              <X size={24} />
            </button>

            {/* Coach Image Area */}
            <div className="w-full md:w-2/5 relative min-h-[300px] md:min-h-full bg-academy-dark">
              <Image 
                src={selectedCoachForProfile.image || "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2070&auto=format&fit=crop"} 
                alt={selectedCoachForProfile.name} 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-academy-dark via-transparent to-transparent opacity-60"></div>
              <div className="absolute bottom-8 left-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-academy-red rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4">
                  <Star size={12} fill="white" /> Elite Coach
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">{selectedCoachForProfile.name}</h2>
              </div>
            </div>

            {/* Coach Details Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 space-y-10">
              <div className="space-y-4">
                <span className="text-sm font-black uppercase tracking-[0.3em] text-academy-gold">{selectedCoachForProfile.role}</span>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-academy-red border border-white/10">
                      <Award size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Experience</p>
                      <p className="text-sm font-black text-white uppercase">{selectedCoachForProfile.experience}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-academy-red border border-white/10">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status</p>
                      <p className="text-sm font-black text-white uppercase">{selectedCoachForProfile.status}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black uppercase tracking-widest text-white border-l-4 border-academy-red pl-4">Biography</h3>
                <p className="text-lg text-gray-400 font-medium leading-relaxed">
                  {selectedCoachForProfile.bio || "No biography provided for this coach yet."}
                </p>
              </div>

              <div className="pt-8 border-t border-white/5 flex flex-wrap gap-8">
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail size={18} className="text-academy-gold" />
                  <span className="text-sm font-bold">{selectedCoachForProfile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone size={18} className="text-academy-gold" />
                  <span className="text-sm font-bold">{selectedCoachForProfile.phone}</span>
                </div>
              </div>

              <div className="pt-8">
                <a href={`tel:${settings?.phone || "+91 98765 43210"}`}>
                  <Button variant="primary" className="h-14 px-10 uppercase tracking-[0.2em] text-xs font-black w-full md:w-auto">
                    Book 1-on-1 Session
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Philosophy Section */}
      <section className="py-32 px-6 bg-academy-gray/30">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-4 px-6 py-2 bg-academy-gold/10 border border-academy-gold/20 rounded-full text-academy-gold text-xs font-black uppercase tracking-widest">
            <Award size={18} />
            Our Coaching Philosophy
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase leading-tight">WE BUILD CHAMPIONS FROM THE INSIDE OUT.</h2>
          <p className="text-xl text-gray-400 leading-relaxed font-medium">
            At Samarth Cricket Academy, we believe that technique is just one part of the game. 
            Our coaches focus on mental resilience, tactical intelligence, and physical 
            conditioning to create well-rounded cricketers who can excel under pressure.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            {[
              { label: "Technical", icon: Target },
              { label: "Physical", icon: Activity },
              { label: "Mental", icon: Shield },
            ].map((item, i) => (
              <div key={i} className="space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-academy-red border border-white/10">
                  <item.icon size={32} />
                </div>
                <h5 className="font-black uppercase tracking-widest text-sm">{item.label}</h5>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function CoachesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-academy-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CoachesPageContent />
    </Suspense>
  );
}
