import React from "react";
import { Bell, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NoticeBoardProps {
  notices: Notice[];
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices }) => {
  return (
    <Link href="/dashboard/notices" className="block group/card focus:outline-none focus-visible:ring-2 focus-visible:ring-academy-red rounded-2xl">
      <Card
        className="border-white/5 bg-academy-gray/30 backdrop-blur-md p-4 flex flex-col gap-3 hover:border-academy-red/40 transition-all cursor-pointer"
        role="region"
        aria-labelledby="notices-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="text-academy-red shrink-0" size={14} aria-hidden="true" />
            <h2 id="notices-title" className="text-[10px] font-black uppercase tracking-widest text-white">
              Notices
            </h2>
          </div>
          <ChevronRight size={12} className="text-gray-600 group-hover/card:text-academy-red transition-colors" />
        </div>

        {notices.length === 0 ? (
          <p className="text-[10px] text-gray-500 font-medium">No notices yet.</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-44 overflow-hidden">
            {notices.slice(0, 3).map((notice) => (
              <article key={notice.id} className="flex flex-col gap-0.5 pl-3 relative">
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-0.5 rounded-full",
                    notice.important ? "bg-academy-red" : "bg-white/10"
                  )}
                />
                <div className="flex justify-between items-start gap-1">
                  <h3
                    className={cn(
                      "text-[10px] font-black uppercase tracking-tight leading-tight",
                      notice.important ? "text-academy-red" : "text-white"
                    )}
                  >
                    {notice.title}
                  </h3>
                  <time className="text-[8px] font-bold text-gray-500 shrink-0" dateTime={notice.date}>
                    {notice.date?.slice(5) ?? ""}
                  </time>
                </div>
                <p className="text-[9px] text-gray-400 font-medium leading-relaxed line-clamp-1">
                  {notice.message}
                </p>
              </article>
            ))}
            {notices.length > 3 && (
              <p className="text-[9px] font-black uppercase tracking-widest text-academy-red">
                +{notices.length - 3} more
              </p>
            )}
          </div>
        )}
      </Card>
    </Link>
  );
};
