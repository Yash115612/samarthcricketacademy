"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

export const Footer = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/public/site-settings", { cache: "no-store" });
        const data = await res.json();
        if (data.ok) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to load footer settings", err);
      }
    }
    loadSettings();
  }, []);

  const academyName = settings?.academy_name || "Samarth Cricket Academy";
  const academyDesc = settings?.academy_description || "Professional cricket coaching in Mira Bhayander, Mumbai — developing disciplined, skilled, and confident cricketers since 2011.";
  
  return (
    <footer className="bg-academy-dark border-t border-white/10 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt={`${academyName} Logo`}
              width={44}
              height={44}
              className="rounded-full group-hover:rotate-12 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight uppercase">
                {academyName.split(' ')[0]}
              </span>
              <span className="text-[10px] text-academy-gold font-bold tracking-widest uppercase">
                {academyName.split(' ').slice(1).join(' ')}
              </span>
            </div>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed">
            {academyDesc}
          </p>
          <div className="flex gap-4">
            <Link 
              href={settings?.facebook_url || "#"} 
              target="_blank"
              className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-academy-red transition-colors text-white"
            >
              <Facebook size={18} />
            </Link>
            <Link 
              href={settings?.instagram_url || "#"} 
              target="_blank"
              className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-academy-red transition-colors text-white"
            >
              <Instagram size={18} />
            </Link>
            <Link 
              href={settings?.twitter_url || "#"} 
              target="_blank"
              className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-academy-red transition-colors text-white"
            >
              <Twitter size={18} />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="/about" className="hover:text-academy-gold transition-colors">About Us</Link></li>
            <li><Link href="/batches" className="hover:text-academy-gold transition-colors">Training Batches</Link></li>
            <li><Link href="/matches" className="hover:text-academy-gold transition-colors">Live Matches</Link></li>
            <li><Link href="/coaches" className="hover:text-academy-gold transition-colors">Our Coaches</Link></li>
            <li><Link href="/gallery" className="hover:text-academy-gold transition-colors">Photo Gallery</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Support</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="/contact" className="hover:text-academy-gold transition-colors">Contact Support</Link></li>
            <li><Link href="/signin" className="hover:text-academy-gold transition-colors">Admin Login</Link></li>
            <li><Link href="/about" className="hover:text-academy-gold transition-colors">Privacy Policy</Link></li>
            <li><Link href="/about" className="hover:text-academy-gold transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Contact Us</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex gap-3">
              <MapPin size={18} className="text-academy-gold shrink-0" />
              <span>{settings?.address || "Samarth Cricket Academy, Mira Bhayander, Mumbai - 401107"}</span>
            </li>
            <li className="flex gap-3">
              <Phone size={18} className="text-academy-gold shrink-0" />
              <span>{settings?.phone || "+91 98765 43210"}</span>
            </li>
            <li className="flex gap-3">
              <Mail size={18} className="text-academy-gold shrink-0" />
              <span>{settings?.email || "info@samarthcricket.com"}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium uppercase tracking-widest">
        <p>© 2026 {academyName}. All rights reserved.</p>
        <p>Built with ❤️ for Cricket</p>
      </div>
    </footer>
  );
};
