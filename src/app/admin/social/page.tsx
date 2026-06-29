"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Globe, Save, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SocialMediaPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    academy_name: "",
    academy_description: "",
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    address: "",
    google_maps_link: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/public/site-settings");
        const data = await res.json();
        if (data.ok) {
          setSettings({
            academy_name: data.settings.academy_name || "",
            academy_description: data.settings.academy_description || "",
            facebook_url: data.settings.facebook_url || "",
            instagram_url: data.settings.instagram_url || "",
            twitter_url: data.settings.twitter_url || "",
            address: data.settings.address || "",
            google_maps_link: data.settings.google_maps_link || "",
            phone: data.settings.phone || "",
            email: data.settings.email || ""
          });
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
        alert("Social and Contact settings updated successfully!");
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
    <div className="space-y-12 pb-24 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">SOCIAL & CONTACT</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Manage your academy&apos;s brand, social links, and contact information</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          variant="secondary" 
          className="h-12 px-8 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10"
        >
          {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
          Save All Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Brand Section */}
        <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-academy-gold" />
              <CardTitle className="text-sm uppercase tracking-widest font-black">Brand Identity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Academy Name</label>
              <Input 
                value={settings.academy_name} 
                onChange={(e) => setSettings({ ...settings, academy_name: e.target.value })}
                placeholder="e.g. Samarth Cricket Academy"
                className="bg-white/5 border-white/10 h-12" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Academy Description (Footer)</label>
              <textarea 
                value={settings.academy_description} 
                onChange={(e) => setSettings({ ...settings, academy_description: e.target.value })}
                placeholder="Write a short description..."
                className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-academy-gold/50 transition-all"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media Section */}
        <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-3">
              <Instagram size={20} className="text-pink-500" />
              <CardTitle className="text-sm uppercase tracking-widest font-black">Social Media Links</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Facebook size={14} className="text-blue-600" />
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Facebook URL</label>
              </div>
              <Input 
                value={settings.facebook_url} 
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                placeholder="https://facebook.com/your-page"
                className="bg-white/5 border-white/10 h-12" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Instagram size={14} className="text-pink-500" />
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Instagram URL</label>
              </div>
              <Input 
                value={settings.instagram_url} 
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://instagram.com/your-profile"
                className="bg-white/5 border-white/10 h-12" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Twitter size={14} className="text-blue-400" />
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">X (Twitter) URL</label>
              </div>
              <Input 
                value={settings.twitter_url} 
                onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                placeholder="https://x.com/your-handle"
                className="bg-white/5 border-white/10 h-12" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info Section */}
        <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden lg:col-span-2">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-emerald-500" />
              <CardTitle className="text-sm uppercase tracking-widest font-black">Contact Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-academy-gold" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Academy Address</label>
                </div>
                <textarea 
                  value={settings.address} 
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="Full physical address..."
                  className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-academy-gold/50 transition-all"
                />
              </div>
              <div className="space-y-6 md:col-span-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe size={14} className="text-academy-gold" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Google Maps Link</label>
                  </div>
                  <Input 
                    value={settings.google_maps_link} 
                    onChange={(e) => setSettings({ ...settings, google_maps_link: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="bg-white/5 border-white/10 h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone size={14} className="text-academy-gold" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Phone Number</label>
                  </div>
                  <Input 
                    value={settings.phone} 
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="bg-white/5 border-white/10 h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail size={14} className="text-academy-gold" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address</label>
                  </div>
                  <Input 
                    value={settings.email} 
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder="info@samarthcricket.com"
                    className="bg-white/5 border-white/10 h-12" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="p-6 bg-academy-gold/5 border border-academy-gold/10 rounded-2xl flex gap-4 items-start">
        <Info className="text-academy-gold shrink-0 mt-1" size={20} />
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-widest text-white">Pro Tip</p>
          <p className="text-xs text-gray-400 font-medium leading-relaxed">
            All changes saved here will reflect immediately in the website footer and contact sections across all branches. 
            Ensure social media links include the full URL (e.g., https://facebook.com/...).
          </p>
        </div>
      </div>
    </div>
  );
}
