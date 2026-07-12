
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Phone, Mail, Clock, User, ArrowRight, MessageSquare, Trophy, HelpCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";

export default function EnquiriesPage() {
  const { branchName, currentBranchId: branchId } = useAdminBranch();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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
    privacyPolicyAccepted: true,
    message: "",
    type: "admission" as const,
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/admin/enquiries", { signal });
      const data = await res.json();
      if (data.ok) setEnquiries(data.enquiries);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Failed to load enquiries");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.ok) {
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      }
    } catch (err) {
      console.error("Failed to update enquiry status");
    }
  };

  const handleAddEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
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
          branch_id: branchId,
          preferred_batch_timing: formData.preferredBatchTiming,
          how_hear_about_us: formData.howHearAboutUs,
          medical_conditions: formData.medicalConditions,
          medical_conditions_details: formData.medicalConditions === "yes" 
            ? formData.medicalDetails 
            : "",
          privacy_policy_accepted: formData.privacyPolicyAccepted,
          message: formData.message,
          type: formData.type,
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        loadData();
      } else {
        alert("Failed to add enquiry");
      }
    } catch (err) {
      alert("Failed to add enquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [branchName]);

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">ADMISSION ENQUIRIES</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Track and manage prospective player leads for {branchName}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 uppercase tracking-widest text-[10px] font-black bg-white/5 border-white/10 hover:bg-white/10">
            Export CSV
          </Button>
          <Button variant="primary" className="h-12 uppercase tracking-widest text-[10px] font-black" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Enquiry
          </Button>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-black uppercase tracking-widest">Loading Enquiries...</div>
        ) : enquiries.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-black uppercase tracking-widest">No enquiries found for this branch</div>
        ) : enquiries.map((item) => (
          <Card key={item.id} className="border-white/5 bg-academy-gray/30 backdrop-blur-md group hover:border-academy-red/30 transition-all duration-500">
            <div className="p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-white/10",
                item.type === "personal_training" ? "bg-academy-gold/10 text-academy-gold" :
                item.type === "admission" ? "bg-academy-red/10 text-academy-red" :
                "bg-blue-500/10 text-blue-500"
              )}>
                {item.type === "personal_training" ? <Trophy size={32} /> :
                 item.type === "admission" ? <User size={32} /> :
                 <MessageSquare size={32} />}
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-1">{item.name}</h3>
                    <div className="flex flex-wrap gap-4">
                      {item.email && (
                        <span className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <Mail size={12} className="text-academy-gold" /> {item.email}
                        </span>
                      )}
                      <span className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <Phone size={12} className="text-academy-gold" /> {item.phone}
                      </span>
                      <span className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <Clock size={12} className="text-academy-gold" /> {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={cn(
                      "text-[10px] font-black uppercase px-4 py-2 rounded-xl border self-start",
                      item.status === "normal" ? "bg-academy-red/10 text-academy-red border-academy-red/20" :
                      item.status === "assigned" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}>
                      {item.status}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">Type: {item.type.replace("_", " ")}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 italic whitespace-pre-line">
                  &quot;{item.message}&quot;
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Branch: {item.branch_id === "samarth" ? "Samarth Academy" : "AIMS Academy"}</span>
                  <div className="flex gap-3">
                    {item.status !== "contacted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="uppercase tracking-widest text-[9px] font-black"
                        onClick={() => updateStatus(item.id, "contacted")}
                      >
                        Mark as Contacted
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      className="uppercase tracking-widest text-[9px] font-black group-hover:bg-academy-gold group-hover:text-academy-dark"
                      onClick={() => updateStatus(item.id, "assigned")}
                    >
                      {item.status === "assigned" ? "Assigned" : "Follow Up"} <ArrowRight size={12} className="ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Enquiry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-academy-gray rounded-3xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tight">Add New Enquiry</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddEnquiry} className="p-8 space-y-8">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 pb-3 border-b border-white/5">
                  <User size={12} /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="fullName"
                    placeholder="Enter full name"
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
                    <label className="block text-sm font-bold text-gray-300 mb-2">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                      required
                    >
                      <option value="admission">Admission</option>
                      <option value="personal_training">Personal Training</option>
                      <option value="contact">Contact</option>
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
                    placeholder="email@example.com"
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
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={handleChange}
                    className="flex w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50 resize-none"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2 pb-3 border-b border-white/5">
                  <Trophy size={12} /> School & Cricket Info
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
                    placeholder="Enter class"
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
                  <div className="flex gap-6 mb-3">
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
                  {formData.previousExperience === "yes" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Previous Academy Name"
                        name="previousAcademy"
                        placeholder="Academy name"
                        value={formData.previousAcademy}
                        onChange={handleChange}
                      />
                      <Input
                        label="Years of Experience"
                        name="experienceYears"
                        type="number"
                        placeholder="Years"
                        value={formData.experienceYears}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
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
                  <MessageSquare size={12} /> Additional Info
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
                      placeholder="Details"
                      value={formData.medicalDetails}
                      onChange={handleChange}
                      className="flex w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50 resize-none"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Message / Special Requirements <span className="text-gray-600 font-medium text-xs">(optional)</span></label>
                  <textarea
                    name="message"
                    rows={3}
                    placeholder="Additional details"
                    value={formData.message}
                    onChange={handleChange}
                    className="flex w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black"
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Add Enquiry"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

