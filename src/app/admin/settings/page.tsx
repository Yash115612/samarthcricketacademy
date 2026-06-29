"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Globe, Save, Loader2, Users, Trophy, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    players_trained: "",
    tournament_wins: "",
    certified_coaches: "",
    matches_played: "",
    academy_name: "",
    academy_description: "",
    phone: "",
    email: "",
    address: ""
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/public/site-settings");
        const data = await res.json();
        if (data.ok) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.ok) {
        alert("Settings updated successfully!");
      } else {
        alert("Failed to update settings: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to save settings", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-academy-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 max-w-4xl">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">SITE SETTINGS</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Manage home page statistics and global configurations</p>
      </div>

      <div className="space-y-8">
        {/* Home Page Stats */}
        <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md">
          <CardHeader className="border-b border-white/5">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-academy-gold" />
              <CardTitle className="text-sm uppercase tracking-widest">Home Page Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={14} className="text-blue-500" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Players Trained</label>
                </div>
                <Input 
                  value={settings.players_trained} 
                  onChange={(e) => setSettings({ ...settings, players_trained: e.target.value })}
                  placeholder="e.g. 1,200+"
                  className="bg-white/5 border-white/10 h-12 text-lg font-black" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={14} className="text-academy-gold" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tournament Wins</label>
                </div>
                <Input 
                  value={settings.tournament_wins} 
                  onChange={(e) => setSettings({ ...settings, tournament_wins: e.target.value })}
                  placeholder="e.g. 85+"
                  className="bg-white/5 border-white/10 h-12 text-lg font-black" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Star size={14} className="text-academy-red" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Certified Coaches</label>
                </div>
                <Input 
                  value={settings.certified_coaches} 
                  onChange={(e) => setSettings({ ...settings, certified_coaches: e.target.value })}
                  placeholder="e.g. 24+"
                  className="bg-white/5 border-white/10 h-12 text-lg font-black" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-emerald-500" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Matches Played</label>
                </div>
                <Input 
                  value={settings.matches_played} 
                  onChange={(e) => setSettings({ ...settings, matches_played: e.target.value })}
                  placeholder="e.g. 500+"
                  className="bg-white/5 border-white/10 h-12 text-lg font-black" 
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                variant="secondary" 
                className="h-14 px-12 uppercase tracking-[0.2em] text-xs font-black shadow-xl shadow-academy-gold/10"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" /> Save Site Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Academy Info */}
        <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md">
          <CardHeader className="border-b border-white/5">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-academy-gold" />
              <CardTitle className="text-sm uppercase tracking-widest">Academy Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Academy Name</label>
                <Input 
                  value={settings.academy_name} 
                  onChange={(e) => setSettings({ ...settings, academy_name: e.target.value })}
                  placeholder="e.g. Samarth Cricket Academy"
                  className="bg-white/5 border-white/10 h-12 text-sm font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contact Email</label>
                <Input 
                  value={settings.email} 
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="e.g. info@samarthcricket.com"
                  className="bg-white/5 border-white/10 h-12 text-sm font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contact Phone</label>
                <Input 
                  value={settings.phone} 
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="bg-white/5 border-white/10 h-12 text-sm font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Academy Address</label>
                <Input 
                  value={settings.address} 
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="e.g. Mira Bhayander, Mumbai"
                  className="bg-white/5 border-white/10 h-12 text-sm font-bold" 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Academy Description</label>
                <textarea
                  value={settings.academy_description} 
                  onChange={(e) => setSettings({ ...settings, academy_description: e.target.value })}
                  placeholder="Tell something about your academy..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold min-h-[120px] focus:outline-none focus:border-academy-gold transition-colors"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                variant="secondary" 
                className="h-14 px-12 uppercase tracking-[0.2em] text-xs font-black shadow-xl shadow-academy-gold/10"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" /> Save Site Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
