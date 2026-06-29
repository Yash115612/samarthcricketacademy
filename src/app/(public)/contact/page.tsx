"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MapPin, Phone, Mail, Clock, Send, Globe, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

export default function ContactPage() {
  const [selectedBranch, setSelectedBranch] = useState("samarth");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
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
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/membership/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          email: formData.email,
          branch_id: selectedBranch,
          type: "contact",
          message: formData.message,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setSubmitted(true);
    } catch (err) {
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen pt-24">
        <Navbar />
        <section className="py-40 px-6 text-center">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <Send size={48} />
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tight">MESSAGE SENT!</h1>
            <p className="text-gray-400 font-medium text-lg">
              Thank you for reaching out. Our team at {selectedBranch === "samarth" ? "Samarth Cricket Academy, Mira Bhayander" : "AIMS Academy"}
              will get back to you within 24 hours.
            </p>
            <Link href="/">
              <Button variant="outline" size="lg" className="mt-8 uppercase tracking-widest text-xs font-black">
                Return to Home
              </Button>
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24">
      <Navbar />

      {/* Back button */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      {/* Page Header */}
      <section className="py-20 px-6 bg-gradient-to-b from-academy-gold/10 to-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight">GET IN TOUCH</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Have questions about admissions, training programs, or facilities? Our team in Mira Bhayander
            is ready to help you take the first step.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Info */}
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-academy-red font-black uppercase tracking-[0.3em] text-sm">Contact Info</h2>
              <h3 className="text-4xl font-black uppercase tracking-tight leading-tight">WE&apos;RE ALWAYS <br /> READY TO HELP.</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: MapPin, title: "Our Location", desc: selectedBranch === "samarth" ? (settings?.address || "Samarth Cricket Academy, Mira Bhayander, Mumbai - 401107") : "AIMS Sports Complex, Mumbai, Maharashtra" },
                { icon: Phone, title: "Phone Number", desc: settings?.phone || "+91 98765 43210" },
                { icon: Mail, title: "Email Address", desc: settings?.email || "info@samarthcricket.com" },
                { icon: Clock, title: "Working Hours", desc: "Mon - Sat: 06:00 AM - 09:00 PM Sunday: Closed" },
              ].map((item, i) => (
                <div key={i} className="card p-8 group hover:border-academy-gold transition-colors bg-academy-gray/30 backdrop-blur-md">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-academy-gold group-hover:bg-academy-gold group-hover:text-academy-dark transition-all border border-white/10">
                    <item.icon size={24} />
                  </div>
                  <h4 className="font-black uppercase tracking-widest text-sm mb-2">{item.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6 pt-12 border-t border-white/5">
              <h5 className="font-black uppercase tracking-widest text-sm text-gray-400">Follow Our Updates</h5>
              <div className="flex gap-4">
                {[Globe, Users].map((Icon, i) => (
                  <div key={i} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-academy-red transition-colors border border-white/10 cursor-pointer group">
                    <Icon size={20} className="group-hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="space-y-8">
            <Card className="p-10 border-academy-red/20 shadow-2xl shadow-academy-red/5 bg-academy-gray/50 backdrop-blur-xl">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input 
                    label="First Name" 
                    placeholder="Enter your first name" 
                    required 
                    value={formData.firstName}
                    onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))}
                  />
                  <Input 
                    label="Last Name" 
                    placeholder="Enter your last name" 
                    required 
                    value={formData.lastName}
                    onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
                <Input 
                  label="Email Address" 
                  type="email" 
                  placeholder="Enter your email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                />
                <Input 
                  label="Phone Number" 
                  type="tel" 
                  placeholder="Enter your phone" 
                  required 
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                />
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea 
                    rows={5}
                    placeholder="Tell us about your requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                    className="flex w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Branch</label>
                  <select 
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-white/10 bg-academy-gray px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-gold/50"
                  >
                    <option value="samarth">Samarth Cricket Academy (Mira Bhayander)</option>
                    <option value="aims">AIMS Academy</option>
                  </select>
                </div>
                <Button 
                  type="submit"
                  variant="primary" 
                  size="lg" 
                  className="w-full h-14 text-lg uppercase tracking-widest font-black"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"} <Send className="ml-2" size={20} />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
      <section className="h-[500px] w-full bg-academy-gray relative overflow-hidden border-y border-white/5">
        <Image
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop"
          alt="Map background"
          fill
          className="object-cover grayscale opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-10 bg-academy-dark/80 backdrop-blur-xl border border-white/10 rounded-3xl text-center space-y-6 max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-academy-gold/10 rounded-full flex items-center justify-center mx-auto text-academy-gold animate-bounce border border-academy-gold/20">
              <MapPin size={32} />
            </div>
            <h4 className="text-2xl font-black uppercase tracking-tight">Visit Our Academy</h4>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Experience our facilities first-hand. Visit Samarth Cricket Academy in Mira Bhayander, Mumbai.
            </p>
            <Link 
              href={settings?.google_maps_link || "https://maps.google.com"} 
              target="_blank"
              className="w-full sm:w-auto"
            >
              <Button variant="outline" className="w-full uppercase tracking-widest text-[10px] font-black h-12 bg-white/5 border-white/20">
                Open Google Maps
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
