"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Clock, Calendar, ArrowRight, Send, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useSearchParams } from "next/navigation";
import type { BranchId } from "@/types/dashboard";
import { Suspense } from "react";

function BatchesPageContent() {
  const searchParams = useSearchParams();
  const branchFromUrl = searchParams.get("branch") as BranchId | null;
  const [selectedBranch, setSelectedBranch] = useState<BranchId>(branchFromUrl || "samarth");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    experience: "Beginner",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/membership/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          branch_id: selectedBranch,
          type: "admission",
          message: `Admission enquiry for ${selectedBranch} Academy. Age: ${formData.age}, Exp: ${formData.experience}`,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitError("Failed to submit enquiry. Please try again.");
      }
    } catch {
      setSubmitError("Failed to submit enquiry. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const samarthBatches = [
    { name: "Morning Stars", time: "06:00 AM - 09:00 AM", days: "Mon - Fri", fee: "₹2,500/mo", desc: "Perfect for early risers focusing on technical drills and fitness." },
    { name: "Afternoon Elite", time: "04:00 PM - 07:00 PM", days: "Mon - Fri", fee: "₹3,000/mo", desc: "High-intensity training sessions with a focus on match play scenarios." },
    { name: "Evening Pro", time: "07:00 PM - 09:00 PM", days: "Mon - Fri", fee: "₹3,500/mo", desc: "Specialized coaching for advanced players under stadium lights." },
    { name: "Weekend Warrior", time: "08:00 AM - 11:00 AM", days: "Sat - Sun", fee: "₹1,500/mo", desc: "Intensive weekend-only program for busy students and professionals." },
  ];

  const aimsBatches = [
    { name: "AIMS Junior", time: "07:00 AM - 10:00 AM", days: "Mon - Fri", fee: "₹2,800/mo", desc: "Foundational training for young talents at Mumbai branch." },
    { name: "AIMS Pro", time: "03:00 PM - 06:00 PM", days: "Mon - Sat", fee: "₹4,000/mo", desc: "Advanced match-day simulations and video analysis." },
  ];

  const batches = selectedBranch === "aims" ? aimsBatches : samarthBatches;

  return (
    <main className="min-h-screen pt-24">
      <Navbar />
      
      {/* Page Header */}
      <section className="py-20 px-6 bg-gradient-to-b from-academy-gold/10 to-transparent border-b border-white/5">
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
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight text-white">TRAINING BATCHES</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Find the right schedule at our {selectedBranch === "samarth" ? "Mira Bhayander" : "Mumbai"} branch.
            Morning, afternoon, evening, and weekend sessions available for all age groups.
          </p>
        </div>
      </section>

      {/* Batches Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24 text-white">
          {batches.map((batch, i) => (
            <Card key={i} className="flex flex-col h-full border-white/5 hover:border-academy-gold transition-colors bg-academy-gray/30">
              <CardHeader className="bg-academy-red/5 pb-6">
                <CardTitle className="text-2xl font-black uppercase mb-1">{batch.name}</CardTitle>
                <div className="flex items-center gap-2 text-academy-gold font-bold text-xs uppercase tracking-widest">
                  <Clock size={14} /> {batch.time}
                </div>
              </CardHeader>
              <CardContent className="flex-1 pt-6 space-y-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-widest">
                  <Calendar size={14} /> {batch.days}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{batch.desc}</p>
                <div className="pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-academy-gold">Click to view pricing & apply</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admission Form Section */}
        <div id="admission-form" className="max-w-4xl mx-auto">
          {submitted ? (
            <Card className="p-16 border-emerald-500/20 bg-emerald-500/5 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <Send size={40} />
              </div>
              <h2 className="text-4xl font-black uppercase text-white">Application Received!</h2>
              <p className="text-gray-400 font-medium text-lg">
                Thank you for your interest in {selectedBranch === "samarth" ? "Samarth Cricket Academy, Mira Bhayander" : "AIMS Academy"}.
                Our coaching team will contact you within 24 hours.
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="uppercase tracking-widest text-xs font-black">Submit Another</Button>
            </Card>
          ) : (
            <>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-black uppercase mb-4 text-white">ADMISSION FORM</h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                  Ready to begin your cricket journey at {selectedBranch === "samarth" ? "Samarth Academy, Mira Bhayander" : "AIMS Academy"}? 
                  Fill out the form below.
                </p>
              </div>
              <Card className="p-10 border-academy-red/20 shadow-2xl shadow-academy-red/5 bg-academy-gray/50 backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input 
                    label="Full Name" 
                    placeholder="Enter your full name" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <Input 
                    label="Age" 
                    type="number" 
                    placeholder="Enter your age" 
                    required 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                  <Input 
                    label="Phone Number" 
                    type="tel" 
                    placeholder="Enter your phone number" 
                    required 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
                    <select 
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced / Pro</option>
                    </select>
                  </div>
                  <div className="w-full md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Branch</label>
                    <select 
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value as BranchId)}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                    >
                      <option value="samarth">Samarth Cricket Academy (Main Branch)</option>
                      <option value="aims">AIMS Academy (Second Branch)</option>
                    </select>
                  </div>
                  {submitError && (
                    <div className="md:col-span-2">
                      <p className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm font-semibold" role="alert">
                        {submitError}
                      </p>
                    </div>
                  )}
                  <div className="md:col-span-2 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full h-14 text-lg uppercase tracking-widest font-black"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"} <ArrowRight className="ml-2" />
                    </Button>
                  </div>
                </form>
              </Card>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function BatchesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-academy-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <BatchesPageContent />
    </Suspense>
  );
}
