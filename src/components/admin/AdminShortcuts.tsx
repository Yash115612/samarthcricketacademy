import React from "react";
import Link from "next/link";
import { LucideIcon, Zap, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface Shortcut {
  label: string;
  icon: LucideIcon;
  href: string;
  desc: string;
  color: string;
}

interface AdminShortcutsProps {
  shortcuts: Shortcut[];
}

export const AdminShortcuts: React.FC<AdminShortcutsProps> = ({ shortcuts }) => {
  return (
    <Card className="border-white/5 bg-gradient-to-br from-academy-gray/40 to-academy-dark/40 backdrop-blur-xl overflow-hidden rounded-[2rem]">
      <CardHeader className="border-b border-white/5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-academy-gold/10 flex items-center justify-center text-academy-gold">
              <Zap size={20} />
            </div>
            <CardTitle className="text-lg uppercase tracking-widest text-white">Admin Shortcuts</CardTitle>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Frequently Used Tools</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shortcuts.map((shortcut, i) => (
            <Link key={i} href={shortcut.href}>
              <div className="group cursor-pointer p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all flex flex-col items-center gap-3 text-center hover:bg-white/[0.07]">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <shortcut.icon size={22} className={cn("text-gray-500 transition-colors", shortcut.color)} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-300 group-hover:text-white transition-colors">{shortcut.label}</p>
                  <p className="text-[9px] font-medium text-gray-600 mt-0.5">{shortcut.desc}</p>
                </div>
                <ArrowRight size={12} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
