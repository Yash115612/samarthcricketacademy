import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: LucideIcon;
  color: string;
  href: string;
}

interface AdminNotificationsProps {
  notifications: Notification[];
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({ notifications }) => {
  return (
    <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-xl rounded-[2rem]">
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-6">
        <CardTitle className="text-lg uppercase tracking-widest text-white">Recent Alerts</CardTitle>
        <div className="w-6 h-6 rounded-full bg-academy-red/10 flex items-center justify-center text-academy-red text-[10px] font-black">
          {notifications.length}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {notifications.length > 0 ? (
          notifications.map((note) => (
            <Link key={note.id} href={note.href}>
              <div className="flex gap-4 group cursor-pointer mb-6 last:mb-0">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", note.color)}>
                  <note.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="text-[11px] font-black uppercase tracking-tight text-white group-hover:text-academy-gold transition-colors truncate">
                      {note.title}
                    </h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 shrink-0">
                      {note.time}
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-gray-500 line-clamp-1">{note.desc}</p>
                </div>
                <ArrowRight size={12} className="text-gray-600 group-hover:text-white transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1 self-center" />
              </div>
            </Link>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">No new alerts</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
