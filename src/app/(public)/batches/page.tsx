"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Clock, Calendar, Send, MapPin, ChevronDown, User, Trophy, Star, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useSearchParams } from "next/navigation";
import type { BranchId } from "@/types/dashboard";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

function BatchesPageContent() {
  const searchParams = useSearchParams();
  const branchFromUrl = searchParams.get("branch") as BranchId | null;
  const [selectedBranch, setSelectedBranch] = useState<BranchId>(branchFromUrl || "samarth");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [trainingType, setTrainingType] = useState<"group" | "personal">("group");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedPtPackage, setSelectedPtPackage] = useState<string>("");

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    parentName: "",
    parentPhone: "",
    email: "",
    address: "",
    schoolName: "",
    classStandard: "",
    board: "",
    playingRole: "",
    battingStyle: "",
    bowlingStyle: "",
    previousExperience: "no",
    previousAcademy: "",
    experienceYears: "",
    preferredBatchTiming: "",
    howHearAboutUs: "",
    medicalConditions: "no",
    medicalDetails: "",
    privacyPolicyAccepted: false,
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/membership/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          phone: formData.phone,
          parent_name: formData.parentName,
          parent_phone: formData.parentPhone,
          email: formData.email,
          address: formData.address,
          school_name: formData.schoolName,
          class_standard: formData.classStandard,
          board: formData.board,
          playing_role: formData.playingRole,
          batting_style: formData.battingStyle,
          bowling_style: formData.bowlingStyle,
          previous_experience: formData.previousExperience,
          previous_experience_details: formData.previousExperience === "yes" 
            ? `Academy: ${formData.previousAcademy}, Years: ${formData.experienceYears}` 
            : "",
          branch_id: selectedBranch,
          preferred_batch_timing: formData.preferredBatchTiming,
          how_hear_about_us: formData.howHearAboutUs,
          medical_conditions: formData.medicalConditions,
          medical_conditions_details: formData.medicalConditions === "yes" 
            ? formData.medicalDetails 
            : "",
          privacy_policy_accepted: formData.privacyPolicyAccepted,
          type: "admission",
          message: formData.message,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitError("Failed to submit enquiry. Please try again.");
      }
    } catch {
      setSubmitError("Failed to submit enquiry. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const BATCHES = [
    { id: "morning", name: "Morning Stars", time: "06:00 AM - 09:00 AM", days: "Mon - Fri", fee: "₹2,500/mo" },
    { id: "afternoon", name: "Afternoon Elite", time: "04:00 PM - 07:00 PM", days: "Mon - Fri", fee: "₹3,000/mo" },
    { id: "evening", name: "Evening Pro", time: "07:00 PM - 09:00 PM", days: "Mon - Fri", fee: "₹3,500/mo" },
    { id: "weekend", name: "Weekend Warrior", time: "08:00 AM - 11:00 AM", days: "Sat - Sun", fee: "₹1,500/mo" },
  ];

  const PT_PACKAGES = [
    { id: "pt-basic", name: "1-on-1 Basic", sessions: "8 sessions/month", fee: "₹6,000/mo", desc: "2 sessions per week with a dedicated coach. Ideal for focused skill correction.", color: "border-blue-500/30 bg-blue-500/5", badge: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { id: "pt-pro", name: "1-on-1 Pro", sessions: "12 sessions/month", fee: "₹8,500/mo", desc: "3 sessions per week. Includes video analysis, fitness plan, and match strategy coaching.", color: "border-academy-gold/30 bg-academy-gold/5", badge: "text-academy-gold bg-academy-gold/10 border-academy-gold/20", popular: true },
    { id: "pt-elite", name: "Elite Mentorship", sessions: "16 sessions/month", fee: "₹12,000/mo", desc: "4 sessions per week. Full mentorship program with diet, mental conditioning & tournament prep.", color: "border-academy-red/30 bg-academy-red/5", badge: "text-academy-red bg-academy-red/10 border-academy-red/20" },
  ];

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
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-4xl font-black uppercase text-white">Application Received!</h2>
              <p className="text-gray-400 font-medium text-lg">
                Thank you for your interest in {selectedBranch === "samarth" ? "Samarth Cricket Academy, Mira Bhayander" : "AIMS Academy"}.
                Our coaching team will contact you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setSubmitted(false)} variant="outline" className="uppercase tracking-widest text-xs font-black">Submit Another</Button>
                <Button variant="outline" className="uppercase tracking-widest text-xs font-black bg-white/5 border-white/10" onClick={() => window.location.href = "/"}>Back to Home</Button>
              </div>
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

              {/* Training Type Selection */}
              <div className="mb-12 max-w-4xl mx-auto">
                <h3 className="text-center text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-8">
                  Select Your Training Mode
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button
                    type="button"
                    onClick={() => setTrainingType("group")}
                    className={cn(
                      "relative p-8 rounded-2xl border-2 text-left transition-all duration-300 group",
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
                      trainingType === "group" ? "bg-academy-gold text-academy-dark" : "bg-white/5 text-gray-500"
                    )}>
                      <User size={28} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Group Batch</h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                      Train alongside peers in structured batch sessions.
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-academy-gold">
                      From ₹1,500/mo
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTrainingType("personal")}
                    className={cn(
                      "relative p-8 rounded-2xl border-2 text-left transition-all duration-300 group",
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
                      trainingType === "personal" ? "bg-academy-red text-white" : "bg-white/5 text-gray-500"
                    )}>
                      <User size={28} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Personal Training</h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                      1-on-1 coaching tailored entirely to you.
                    </p>
                  </button>
                </div>
              </div>

              {/* PT Packages */}
              {trainingType === "personal" && (
                <div className="mb-12 max-w-4xl mx-auto">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-8">
                    Choose Your Personal Training Package
                  </h3>
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
              )}

              {/* Batch Selection */}
              {trainingType === "group" && (
                <div className="mb-12 max-w-4xl mx-auto">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-8">
                    Choose Your Batch
                  </h3>
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
              )}

              {/* Full Form */}
              <Card className="p-10 border-academy-red/20 shadow-2xl shadow-academy-red/5 bg-academy-gray/50 backdrop-blur-xl">
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2 flex items-center gap-3">
                  <User className="text-academy-red" size={24} /> Admission Form
                </h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-10">
                  Fill in your details
                </p>

                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 pb-3 border-b border-white/5">
                      <User size={12} /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        name="fullName"
                        placeholder="Enter your full name"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                      <Input
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                          required
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Branch</label>
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value as BranchId)}
                          className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                          required
                        >
                          <option value="samarth">Samarth Cricket Academy (Mira Bhayander)</option>
                          <option value="aims">AIMS Academy</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Parent/Guardian Name"
                        name="parentName"
                        placeholder="Enter parent/guardian name"
                        value={formData.parentName}
                        onChange={handleChange}
                      />
                      <Input
                        label="Parent/Guardian Phone"
                        name="parentPhone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.parentPhone}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Full Address</label>
                      <textarea
                        name="address"
                        rows={3}
                        placeholder="Enter your full address"
                        value={formData.address}
                        onChange={handleChange}
                        className="flex w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50 resize-none"
                      />
                    </div>
                  </div>

                  {/* School Information */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 pb-3 border-b border-white/5">
                      <Trophy size={12} /> School Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Input
                        label="School Name"
                        name="schoolName"
                        placeholder="Enter school name"
                        value={formData.schoolName}
                        onChange={handleChange}
                      />
                      <Input
                        label="Class/Standard"
                        name="classStandard"
                        placeholder="Enter class/standard"
                        value={formData.classStandard}
                        onChange={handleChange}
                      />
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Board</label>
                        <select
                          name="board"
                          value={formData.board}
                          onChange={handleChange}
                          className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                        >
                          <option value="">Select board</option>
                          <option value="cbse">CBSE</option>
                          <option value="icse">ICSE</option>
                          <option value="state">State</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Cricket Details */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 pb-3 border-b border-white/5">
                      <Star size={12} /> Cricket Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Playing Role</label>
                        <select
                          name="playingRole"
                          value={formData.playingRole}
                          onChange={handleChange}
                          className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                        >
                          <option value="">Select role</option>
                          <option value="batsman">Batsman</option>
                          <option value="bowler">Bowler</option>
                          <option value="allrounder">All-rounder</option>
                          <option value="wicketkeeper">Wicketkeeper</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Batting Style</label>
                        <select
                          name="battingStyle"
                          value={formData.battingStyle}
                          onChange={handleChange}
                          className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                        >
                          <option value="">Select style</option>
                          <option value="rightHanded">Right-handed</option>
                          <option value="leftHanded">Left-handed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Bowling Style</label>
                        <select
                          name="bowlingStyle"
                          value={formData.bowlingStyle}
                          onChange={handleChange}
                          className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                        >
                          <option value="">Select style</option>
                          <option value="rightArmFast">Right-arm Fast</option>
                          <option value="leftArmFast">Left-arm Fast</option>
                          <option value="rightArmSpin">Right-arm Spin</option>
                          <option value="leftArmSpin">Left-arm Spin</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Previous Experience?</label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="previousExperience"
                            value="no"
                            checked={formData.previousExperience === "no"}
                            onChange={handleChange}
                            className="w-4 h-4 text-academy-gold bg-academy-gray border-white/10 focus:ring-academy-gold/50"
                          />
                          <span className="text-sm text-gray-300">No</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="previousExperience"
                            value="yes"
                            checked={formData.previousExperience === "yes"}
                            onChange={handleChange}
                            className="w-4 h-4 text-academy-gold bg-academy-gray border-white/10 focus:ring-academy-gold/50"
                          />
                          <span className="text-sm text-gray-300">Yes</span>
                        </label>
                      </div>
                    </div>

                    {formData.previousExperience === "yes" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Previous Academy Name"
                          name="previousAcademy"
                          placeholder="Enter academy name"
                          value={formData.previousAcademy}
                          onChange={handleChange}
                        />
                        <Input
                          label="Years of Experience"
                          name="experienceYears"
                          type="number"
                          placeholder="Enter years"
                          value={formData.experienceYears}
                          onChange={handleChange}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Preferred Batch Timing</label>
                      <select
                        name="preferredBatchTiming"
                        value={formData.preferredBatchTiming}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                      >
                        <option value="">Select timing</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                        <option value="weekend">Weekend</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 pb-3 border-b border-white/5">
                      <Mail size={12} /> Additional Information
                    </h3>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">How did you hear about us?</label>
                      <select
                        name="howHearAboutUs"
                        value={formData.howHearAboutUs}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                      >
                        <option value="">Select source</option>
                        <option value="socialMedia">Social Media</option>
                        <option value="referral">Friend/Family Referral</option>
                        <option value="google">Google Search</option>
                        <option value="banner">Banner/Poster</option>
                        <option value="walkIn">Walk-in</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Any Medical Conditions?</label>
                      <div className="flex gap-6 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="medicalConditions"
                            value="no"
                            checked={formData.medicalConditions === "no"}
                            onChange={handleChange}
                            className="w-4 h-4 text-academy-gold bg-academy-gray border-white/10 focus:ring-academy-gold/50"
                          />
                          <span className="text-sm text-gray-300">No</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="medicalConditions"
                            value="yes"
                            checked={formData.medicalConditions === "yes"}
                            onChange={handleChange}
                            className="w-4 h-4 text-academy-gold bg-academy-gray border-white/10 focus:ring-academy-gold/50"
                          />
                          <span className="text-sm text-gray-300">Yes</span>
                        </label>
                      </div>
                      {formData.medicalConditions === "yes" && (
                        <textarea
                          name="medicalDetails"
                          rows={2}
                          placeholder="Please provide details"
                          value={formData.medicalDetails}
                          onChange={handleChange}
                          className="flex w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50 resize-none"
                        />
                      )}
                    </div>

                    <div>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="privacyPolicyAccepted"
                          checked={formData.privacyPolicyAccepted}
                          onChange={handleChange}
                          className="w-5 h-5 mt-0.5 text-academy-gold bg-academy-gray border-white/10 focus:ring-academy-gold/50 rounded"
                          required
                        />
                        <span className="text-sm text-gray-300">
                          I accept the <span className="text-academy-gold">Privacy Policy</span> and consent to my
                          data being stored and processed.
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Message / Special Requirements <span className="text-gray-600 font-medium text-xs">(optional)</span>
                      </label>
                      <textarea
                        name="message"
                        rows={3}
                        placeholder="Tell us anything specific"
                        value={formData.message}
                        onChange={handleChange}
                        className="flex w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50 resize-none"
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div>
                      <p className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm font-semibold" role="alert">
                        {submitError}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full h-16 text-lg uppercase tracking-widest font-black shadow-2xl shadow-academy-red/20"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"} <Send className="ml-2" />
                  </Button>
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
