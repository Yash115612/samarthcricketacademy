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

type TrainingType = "group" | "personal";

export default function AdmissionPage() {
  const [trainingType, setTrainingType] = useState<TrainingType>("group");
  const [selectedBranch, setSelectedBranch] = useState<string>("samarth");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedPtPackage, setSelectedPtPackage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
              Thank you for applying to Samarth Cricket Academy. Our coaching team will review your application
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

      <div className="max-w-7xl mx-auto px-6 pt-28">
        <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      <section className="pt-8 pb-20 px-6 bg-gradient-to-b from-academy-red/10 to-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-academy-red/10 border border-academy-red/20 text-academy-red text-[10px] font-black uppercase tracking-widest mb-6">
            <ClipboardList size={12} /> Admissions Open 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight">
            Join <span className="text-academy-red">Samarth</span><br />Cricket Academy
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Mira Bhayander&apos;s professional cricket training program.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-8">
            Select Your Training Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Train alongside peers in structured batch sessions.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-academy-gold">
                From ₹1,500/mo <ChevronRight size={12} />
              </div>
            </button>

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
                1-on-1 coaching tailored entirely to you.
              </p>
            </button>
          </div>
        </div>
      </section>

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

      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 border-white/10 bg-academy-gray/40 backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2 flex items-center gap-3">
              <ClipboardList className="text-academy-red" size={24} /> Admission Form
            </h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-10">
              Fill in your details
            </p>

            <form onSubmit={handleSubmit} className="space-y-10">
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
                      onChange={(e) => setSelectedBranch(e.target.value)}
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full h-16 text-base uppercase tracking-widest font-black shadow-2xl shadow-academy-red/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"} <Send className="ml-3" size={20} />
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}