import React from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Attendance } from "@/types/dashboard";
import Link from "next/link";

interface AttendanceSummaryProps {
  attendance: Attendance[];
}

export const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ attendance }) => {
  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const absentCount = attendance.filter((a) => a.status === "Absent").length;
  const totalCount = attendance.length;
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <Link href="/dashboard/attendance" className="block group/card focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-2xl">
      <Card
        className="border-white/5 bg-academy-gray/30 backdrop-blur-md p-4 flex flex-col gap-3 hover:border-emerald-500/40 transition-all cursor-pointer"
        role="region"
        aria-labelledby="attendance-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500 shrink-0" size={14} aria-hidden="true" />
            <h2 id="attendance-title" className="text-[10px] font-black uppercase tracking-widest text-white">
              Attendance
            </h2>
          </div>
          <ChevronRight size={12} className="text-gray-600 group-hover/card:text-emerald-500 transition-colors" />
        </div>

        {/* Present / Absent */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-center"
            aria-label={`${presentCount} days present`}
          >
            <p className="text-xl font-black text-emerald-500 leading-none">{presentCount}</p>
            <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500/70 mt-0.5">Present</p>
          </div>
          <div
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-center"
            aria-label={`${absentCount} days absent`}
          >
            <p className="text-xl font-black text-red-500 leading-none">{absentCount}</p>
            <p className="text-[8px] font-black uppercase tracking-widest text-red-500/70 mt-0.5">Absent</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Monthly</span>
            <span className="text-[9px] font-black text-emerald-500">{percentage}%</span>
          </div>
          <div
            className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${percentage}% attendance`}
          >
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </Card>
    </Link>
  );
};
