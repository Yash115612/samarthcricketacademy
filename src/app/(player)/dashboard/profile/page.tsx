"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { User, Mail, Phone, MapPin, Camera, Save, TrendingUp, CalendarRange, Download, Shield } from "lucide-react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { AttendanceSummary } from "@/components/dashboard/AttendanceSummary";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, updateUser, isLoading } = useAuth();
  const router = useRouter();
  
  const [form, setForm] = useState({ 
    name: "", 
    phone: "", 
    experience: "" 
  });
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== "player") {
        router.push("/signin");
      } else if (!user.isProfileComplete) {
        router.push("/complete-profile");
      } else {
        setForm({
          name: user.name || "",
          phone: user.phone || "",
          experience: user.experience || ""
        });
        
        // Fetch career stats and attendance
        fetch("/api/player/dashboard")
          .then(res => res.json())
          .then(data => {
            if (data.ok) setDashboardData(data);
          })
          .catch(() => {
            // Silently fail, just won't show stats
          });
      }
    }
  }, [user, isLoading, router]);

  const onSave = async () => {
    setError(null);
    setNotice(null);
    
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateUser({
        name: form.name,
        phone: form.phone,
        experience: form.experience
      });
      
      if (success) {
        setNotice("Profile updated successfully!");
        setTimeout(() => setNotice(null), 3000);
      } else {
        setError("Could not save your profile. Please try again.");
      }
    } catch (err) {
      setError("Could not save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user || user.role !== "player") {
    return (
      <div className="min-h-screen bg-academy-dark flex items-center justify-center" aria-busy="true" aria-live="polite">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin"></div>
        <span className="sr-only">Loading your profile...</span>
      </div>
    );
  }

  const branchName = user.branch_id === "aims" ? "AIMS Academy" : "Samarth Cricket Academy";

  return (
    <main className="min-h-screen bg-academy-dark text-white flex flex-col" id="main-content">
      <Navbar />
      
      <div className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-12 pt-32 w-full space-y-12">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">My Profile</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">Manage your personal information and track your career</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0">
          {/* Left Column: Avatar & Quick Info */}
          <div className="space-y-8">
            <Card className="p-8 border-white/5 bg-academy-gray/30 backdrop-blur-md text-center">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-academy-red shadow-2xl shadow-academy-red/20 rotate-[-3deg] relative mx-auto">
                  <Image src="https://i.pravatar.cc/150?u=player1" alt={`${user.name}'s profile`} fill className="object-cover" />
                </div>
                <button 
                  type="button" 
                  aria-label="Change profile photo" 
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-academy-gold text-academy-dark rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                >
                  <Camera size={18} />
                </button>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-1 text-white">{user.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-academy-gold bg-academy-gold/10 px-3 py-1 rounded-full border border-academy-gold/20 inline-block mb-4">
                PRO PLAYER
              </p>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/5 text-left">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <Shield size={14} className="text-academy-red" /> 
                  Player ID: SCA-{user.id.toUpperCase().slice(0, 8)}
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <MapPin size={14} className="text-academy-red" /> 
                  {branchName}
                </div>
              </div>
            </Card>

            <AttendanceSummary attendance={dashboardData?.attendance} />
          </div>

          {/* Right Column: Form & Stats */}
          <div className="lg:col-span-2 space-y-8 min-w-0">
            {/* Edit Form */}
            <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg uppercase tracking-widest text-white">Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                {notice && (
                  <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-200 text-sm font-semibold animate-in fade-in slide-in-from-top-1" role="status">
                    {notice}
                  </div>
                )}
                {error && (
                  <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm font-semibold" role="alert">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <User size={12} className="text-academy-red" /> Full Name
                    </label>
                    <Input 
                      value={form.name} 
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} 
                      className="bg-white/5 border-white/10 h-12 text-white" 
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <Mail size={12} className="text-academy-red" /> Email Address
                    </label>
                    <Input 
                      value={user.email} 
                      disabled 
                      className="bg-white/5 border-white/10 h-12 opacity-60 cursor-not-allowed" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <Phone size={12} className="text-academy-red" /> Phone Number
                    </label>
                    <Input 
                      value={form.phone} 
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} 
                      className="bg-white/5 border-white/10 h-12 text-white" 
                      placeholder="+91 00000 00000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <TrendingUp size={12} className="text-academy-red" /> Experience
                    </label>
                    <Input 
                      value={form.experience} 
                      onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))} 
                      className="bg-white/5 border-white/10 h-12 text-white" 
                      placeholder="e.g., 2 years" 
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <Button 
                    variant="secondary" 
                    className="w-full md:w-auto h-12 px-8 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10" 
                    onClick={onSave} 
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : <><Save size={14} className="mr-2" /> Save Changes</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Career Stats Summary */}
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-white">
                <TrendingUp className="text-academy-gold" size={20} aria-hidden="true" /> Career Statistics
              </h2>
              {dashboardData?.stats ? (
                <StatsGrid stats={dashboardData.stats} />
              ) : (
                <div className="h-32 bg-white/5 rounded-3xl animate-pulse flex items-center justify-center">
                  <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Loading stats...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
