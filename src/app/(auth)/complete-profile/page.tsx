"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Trophy, ArrowRight, ArrowLeft, User, Phone, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import Image from "next/image";

export default function CompleteProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    branch_id: "samarth" as "samarth" | "aims"
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status !== "loading" && !session?.user?.user_id) {
      router.push("/signin");
      return;
    }

    if (session?.user?.name && !formData.firstName) {
      const nameParts = session.user.name.split(" ");
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || ""
      }));
    }
  }, [mounted, router, session, status, formData.firstName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/player/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          branch_id: formData.branch_id,
          complete: true,
        }),
      });
      const data = (await res.json().catch(() => null)) as any;
      if (!res.ok || !data?.ok) {
        setError("Could not save your profile. Please try again.");
        setIsSubmitting(false);
        return;
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Could not save your profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-academy-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-academy-dark">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2073&auto=format&fit=crop"
          alt="Academy training background"
          fill
          priority
          className="object-cover grayscale opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-academy-dark via-academy-dark to-academy-gold/20"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-xl">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="relative w-12 h-12 shadow-xl shadow-academy-red/20">
              <Image
                src="/logo.png"
                alt="Samarth Cricket Academy Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <span className="font-black text-2xl leading-tight tracking-tight uppercase block">Samarth</span>
              <span className="text-[10px] text-academy-gold font-black tracking-[0.3em] uppercase block">Cricket Academy</span>
            </div>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-white">Complete Your Profile</h1>
          <p className="text-gray-400 font-medium italic">Welcome, {session?.user?.name || "Player"}! Just a few more details to get you started.</p>
        </div>

        <Card className="p-10 border-white/5 bg-academy-gray/50 backdrop-blur-2xl shadow-2xl">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <User size={12} className="text-academy-red" /> First Name
                </label>
                <Input 
                  placeholder="Enter first name" 
                  required 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <User size={12} className="text-academy-red" /> Last Name
                </label>
                <Input 
                  placeholder="Enter last name" 
                  required 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Phone size={12} className="text-academy-red" /> Phone Number
                </label>
                <Input 
                  type="tel" 
                  placeholder="+91 00000 00000" 
                  required 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-academy-red" /> Select Academy Branch
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "samarth", name: "Samarth Cricket Academy", location: "Main Branch, Pune" },
                  { id: "aims", name: "AIMS Academy", location: "Second Branch, Mumbai" }
                ].map((branch) => (
                  <label key={branch.id} className="relative group cursor-pointer">
                    <input 
                      type="radio" 
                      name="branch_id" 
                      value={branch.id} 
                      className="peer sr-only" 
                      checked={formData.branch_id === branch.id}
                      onChange={() => setFormData({...formData, branch_id: branch.id as any})}
                    />
                    <div className="p-4 border border-white/10 rounded-2xl bg-white/5 peer-checked:border-academy-gold peer-checked:bg-academy-gold/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-academy-gold group-hover:scale-110 transition-transform">
                          <Users size={16} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-tight text-white">{branch.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{branch.location}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center bg-red-500/10 py-2 rounded-lg" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" variant="secondary" size="lg" className="w-full h-14 text-lg uppercase tracking-widest font-black shadow-2xl" disabled={isSubmitting}>
              Complete Profile <ArrowRight className="ml-2" />
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
