"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ClipboardList, User, Phone, Mail, MapPin, Star,
  Users, UserCheck, CheckCircle2, ChevronRight, Send,
  Target, Dumbbell, Shield, Flame, Brain, Trophy, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const BATCHES = [
  { id: "morning", name: "Morning Stars", time: "06:00 AM – 09:00 AM", days: "Mon – Fri", fee: "₹2,500/mo" },
  { id: "afternoon", name: "Afternoon Elite", time: "04:00 PM – 07:00 PM", days: "Mon – Fri", fee: "₹3,000/mo" },
  { id: "evening", name: "Evening Pro", time: "07:00 PM – 09:00 PM", days: "Mon – Fri", fee: "₹3,500/mo" },
  { id: "weekend", name: "Weekend Warrior", time: "08:00 AM – 11:00 AM", days: "Sat – Sun", fee: "₹1,500/mo" },
];

const PT_PACKAGES = [
  {
    id: "pt-basic",
    name: "1-on-1 Basic",
    sessions: "8 sessions/month",
    fee: "₹6,000/mo",
    desc: "2 sessions per week with a dedicated coach. Ideal for focused skill correction.",
    color: "border-blue-500/30 bg-blue-500/5",
    badge: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "pt-pro",
    name: "1-on-1 Pro",
    sessions: "12 sessions/month",
    fee: "₹8,500/mo",
    desc: "3 sessions per week. Includes video analysis, fitness plan, and match strategy coaching.",
    color: "border-academy-gold/30 bg-academy-gold/5",
    badge: "text-academy-gold bg-academy-gold/10 border-academy-gold/20",
    popular: true,
  },
  {
    id: "pt-elite",
    name: "Elite Mentorship",
    sessions: "16 sessions/month",
    fee: "₹12,000/mo",
    desc: "4 sessions per week. Full mentorship program with diet, mental conditioning & tournament prep.",
    color: "border-academy-red/30 bg-academy-red/5",
    badge: "text-academy-red bg-academy-red/10 border-academy-red/20",
  },
];

const FOCUS_AREAS = [
  { id: "batting", label: "Batting Technique", icon: Target },
  { id: "bowling", label: "Bowling Skills", icon: Flame },
  { id: "fielding", label: "Fielding & Agility", icon: Shield },
  { id: "fitness", label: "Fitness & Strength", icon: Dumbbell },
  { id: "mental", label: "Mental Game", icon: Brain },
  { id: "strategy", label: "Match Strategy", icon: Trophy },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type TrainingType = "group" | "personal";

export default function AdmissionPage() {
  const [trainingType, setTrainingType] = useState<TrainingType>("group");
  const [selectedBranch, setSelectedBranch] = useState<string>("samarth");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedPtPackage, setSelectedPtPackage] = useState<string>("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    gender: "",
    experience: "Beginner (0–1 year)",
    role: "Batsman",
    goal: "School / College Team",
    preferredTime: "Morning (8:00 AM – 11:00 AM)",
    referral: "Social Media (Instagram / Facebook)",
    message: "",
  });

  const toggleFocus = (id: string) =>
    setFocusAreas((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

  const toggleDay = (d: string) =>
    setPreferredDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const summaryMessage = `
        Training: ${trainingType === "group" ? "Batch (" + selectedBatch + ")" : "PT (" + selectedPtPackage + ")"}
        Focus: ${focusAreas.join(", ")}
        Days: ${preferredDays.join(", ")}
        Time: ${formData.preferredTime}
        Experience: ${formData.experience}
        Role: ${formData.role}
        Goal: ${formData.goal}
        Message: ${formData.message}
      `.trim();

      const res = await fetch("/api/membership/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          branch_id: selectedBranch,
          type: "admission",
          message: summaryMessage,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-academy-dark text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-32">
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={44} className="text-emerald-500" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-4">Application Received!</h1>
            <p className="text-gray-400 font-medium leading-relaxed mb-8">
              Thank you for applying to Samarth Cricket Academy, Mira Bhayander. Our coaching team will review your application
              and contact you within <span className="text-white font-bold">24 hours</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" className="h-12 px-8 uppercase tracking-widest text-xs font-black" onClick={() => setSubmitted(false)}>
                Submit Another
              </Button>
              <Button variant="outline" className="h-12 px-8 uppercase tracking-widest text-xs font-black bg-white/5 border-white/10" onClick={() => window.location.href = "/"}>
                Back to Home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-academy-dark text-white flex flex-col">
      <Navbar />

      {/* Back button */}
      <div className="max-w-7xl mx-auto px-6 pt-28">
        <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="pt-8 pb-20 px-6 bg-gradient-to-b from-academy-red/10 to-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-academy-red/10 border border-academy-red/20 text-academy-red text-[10px] font-black uppercase tracking-widest mb-6">
            <ClipboardList size={12} /> Admissions Open 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight">
            Join <span className="text-academy-red">Samarth</span><br />Cricket Academy
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Mira Bhayander&apos;s professional cricket training program — choose group batch coaching or focused 1-on-1 sessions designed to fast-track your development.
          </p>
        </div>
      </section>

      {/* Training type selector */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-8">
            Select Your Training Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group Batch */}
            <button
              type="button"
              onClick={() => setTrainingType("group")}
              className={cn(
                "relative p-8 rounded-3xl border-2 text-left transition-all duration-300 group",
                trainingType === "group"
                  ? "border-academy-gold bg-academy-gold/5"
                  : "border-white/10 bg-academy-gray/30 hover:border-white/30"
              )}
            >
              {trainingType === "group" && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-academy-gold flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-academy-dark" />
                </div>
              )}
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all",
                trainingType === "group" ? "bg-academy-gold text-academy-dark" : "bg-white/5 text-gray-400"
              )}>
                <Users size={28} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Group Batch</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                Train alongside peers in structured batch sessions. Great for discipline, teamwork, and building match temperament.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-academy-gold">
                From ₹1,500/month <ChevronRight size={12} />
              </div>
            </button>

            {/* Personal Training */}
            <button
              type="button"
              onClick={() => setTrainingType("personal")}
              className={cn(
                "relative p-8 rounded-3xl border-2 text-left transition-all duration-300 group",
                trainingType === "personal"
                  ? "border-academy-red bg-academy-red/5"
                  : "border-white/10 bg-academy-gray/30 hover:border-white/30"
              )}
            >
              {trainingType === "personal" && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-academy-red flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
              )}
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all",
                trainingType === "personal" ? "bg-academy-red text-white" : "bg-white/5 text-gray-400"
              )}>
                <UserCheck size={28} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Personal Training</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                1-on-1 coaching tailored entirely to you — your schedule, your weaknesses, your goals. Maximum results, fastest growth.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-academy-red">
                Click for details <ChevronRight size={12} />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Personal Training packages (visible only when personal selected) */}
      {trainingType === "personal" && (
        <section className="pb-8 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
              Choose Your Personal Training Package
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPtPackage(pkg.id)}
                  className={cn(
                    "relative p-6 rounded-2xl border-2 text-left transition-all duration-200",
                    selectedPtPackage === pkg.id
                      ? pkg.color + " scale-[1.02]"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  )}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-academy-gold text-academy-dark text-[9px] font-black uppercase tracking-widest rounded-full">
                      Most Popular
                    </span>
                  )}
                  {selectedPtPackage === pkg.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  )}
                  <span className={cn("inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border mb-4", pkg.badge)}>
                    {pkg.sessions}
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight mb-1">{pkg.name}</h3>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">{pkg.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Batch selection (visible only when group selected) */}
      {trainingType === "group" && (
        <section className="pb-8 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
              Choose Your Batch
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BATCHES.map((batch) => (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() => setSelectedBatch(batch.id)}
                  className={cn(
                    "relative p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4",
                    selectedBatch === batch.id
                      ? "border-academy-gold bg-academy-gold/5"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                    selectedBatch === batch.id ? "bg-academy-gold text-academy-dark" : "bg-white/5 text-gray-500"
                  )}>
                    <Star size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black uppercase tracking-tight text-white">{batch.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold">{batch.time} · {batch.days}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main admission form */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 border-white/10 bg-academy-gray/40 backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2 flex items-center gap-3">
              <ClipboardList className="text-academy-red" size={24} /> Admission Form
            </h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-10">
              Fill in your details — we&apos;ll contact you within 24 hours
            </p>

            <form onSubmit={handleSubmit} className="space-y-10">

              {/* ── Personal Information ── */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 pb-3 border-b border-white/5">
                  <User size={12} /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Full Name" 
                    placeholder="Enter your full name" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  />
                  <Input 
                    label="Age" 
                    type="number" 
                    placeholder="Your age" 
                    min="5" 
                    max="60" 
                    required 
                    value={formData.age}
                    onChange={(e) => setFormData(p => ({ ...p, age: e.target.value }))}
                  />
                  <Input 
                    label="Email Address" 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  />
                  <Input 
                    label="Phone Number" 
                    type="tel" 
                    placeholder="+91 XXXXX XXXXX" 
                    required 
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData(p => ({ ...p, gender: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                    >
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Select Branch</label>
                    <select 
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                    >
                      <option value="samarth">Samarth Cricket Academy (Mira Bhayander)</option>
                      <option value="aims">AIMS Academy</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Cricket Background ── */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 pb-3 border-b border-white/5">
                  <Trophy size={12} /> Cricket Background
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Experience Level</label>
                    <select 
                      value={formData.experience}
                      onChange={(e) => setFormData(p => ({ ...p, experience: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                    >
                      <option>Beginner (0–1 year)</option>
                      <option>Intermediate (1–3 years)</option>
                      <option>Advanced (3+ years)</option>
                      <option>Professional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Playing Role</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                    >
                      <option>Batsman</option>
                      <option>Bowler</option>
                      <option>All-rounder</option>
                      <option>Wicket-keeper</option>
                      <option>Not Sure Yet</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Cricket Goal</label>
                  <select 
                    value={formData.goal}
                    onChange={(e) => setFormData(p => ({ ...p, goal: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                  >
                    <option>School / College Team</option>
                    <option>District Level</option>
                    <option>State Level</option>
                    <option>National / IPL Dream</option>
                    <option>Recreational / Fitness</option>
                  </select>
                </div>
              </div>

              {/* ── Personal Training extras (shown only when personal selected) ── */}
              {trainingType === "personal" && (
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 pb-3 border-b border-white/5">
                    <UserCheck size={12} /> Personal Training Preferences
                  </h3>

                  {/* Preferred days */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">Preferred Training Days</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDay(d)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            preferredDays.includes(d)
                              ? "bg-academy-red text-white border-academy-red"
                              : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred time */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Preferred Training Time</label>
                    <select 
                      value={formData.preferredTime}
                      onChange={(e) => setFormData(p => ({ ...p, preferredTime: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                    >
                      <option>Early Morning (5:30 AM – 8:00 AM)</option>
                      <option>Morning (8:00 AM – 11:00 AM)</option>
                      <option>Afternoon (1:00 PM – 4:00 PM)</option>
                      <option>Evening (4:00 PM – 7:00 PM)</option>
                      <option>Night (7:00 PM – 9:00 PM)</option>
                    </select>
                  </div>

                  {/* Focus areas */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">
                      Training Focus Areas <span className="text-gray-500 font-medium normal-case text-xs">(select all that apply)</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {FOCUS_AREAS.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleFocus(f.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                            focusAreas.includes(f.id)
                              ? "border-academy-red bg-academy-red/10 text-white"
                              : "border-white/10 bg-white/5 text-gray-400 hover:border-white/30"
                          )}
                        >
                          <f.icon size={16} className={focusAreas.includes(f.id) ? "text-academy-red" : "text-gray-600"} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Additional Info ── */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 pb-3 border-b border-white/5">
                  <Mail size={12} /> Additional Information
                </h3>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">How did you hear about us?</label>
                  <select 
                    value={formData.referral}
                    onChange={(e) => setFormData(p => ({ ...p, referral: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                  >
                    <option>Social Media (Instagram / Facebook)</option>
                    <option>Friend / Family Referral</option>
                    <option>Google Search</option>
                    <option>Local Newspaper / Banner</option>
                    <option>Walked Past the Academy</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Message / Special Requirements <span className="text-gray-600 font-medium text-xs">(optional)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us anything specific — injuries, scheduling constraints, past coaching history…"
                    value={formData.message}
                    onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                    className="flex w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50 resize-none"
                  />
                </div>
              </div>

              {/* Summary banner */}
              {(selectedBatch || selectedPtPackage) && (
                <div className={cn(
                  "p-5 rounded-2xl border flex items-center justify-between gap-4",
                  trainingType === "personal"
                    ? "border-academy-red/30 bg-academy-red/5"
                    : "border-academy-gold/30 bg-academy-gold/5"
                )}>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Selected</p>
                    <p className="text-sm font-black text-white">
                      {trainingType === "group"
                        ? BATCHES.find((b) => b.id === selectedBatch)?.name
                        : PT_PACKAGES.find((p) => p.id === selectedPtPackage)?.name}
                    </p>
                  </div>
                  <span className={cn(
                    "text-lg font-black",
                    trainingType === "personal" ? "text-academy-red" : "text-academy-gold"
                  )}>
                    {trainingType === "group"
                      ? BATCHES.find((b) => b.id === selectedBatch)?.fee
                      : PT_PACKAGES.find((p) => p.id === selectedPtPackage)?.fee}
                  </span>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full h-16 text-base uppercase tracking-widest font-black shadow-2xl shadow-academy-red/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"} <Send className="ml-3" size={20} />
              </Button>

              <p className="text-center text-[10px] text-gray-600 font-medium">
                By submitting you agree to be contacted by our team. No payment required at this stage.
              </p>
            </form>
          </Card>
        </div>
      </section>

      {/* Why join strip */}
      <section className="py-20 px-6 border-t border-white/5 bg-academy-gray/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-black uppercase tracking-tight mb-12">
            Why Choose <span className="text-academy-red">Samarth</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Trophy, title: "Expert Coaches", desc: "Certified coaches with domestic playing experience and 10+ years of structured coaching." },
              { icon: Target, title: "Personal Attention", desc: "Small batch sizes ensure every player receives focused, individualised coaching." },
              { icon: Dumbbell, title: "Quality Facilities", desc: "Turf pitches, bowling machines, video analysis support, and fitness training." },
              { icon: Star, title: "Proven Track Record", desc: "50+ players selected for district and state-level tournaments over the last 3 seasons." },
            ].map((item, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-academy-red/10 border border-academy-red/20 flex items-center justify-center mx-auto mb-5 text-academy-red">
                  <item.icon size={24} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-2">{item.title}</h3>
                <p className="text-gray-500 text-xs font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
