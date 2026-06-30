import React from "react";
import { BarChart2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface MonthData {
  month: string;
  matches_played: number;
  runs: number;
  wickets: number;
  present: number;
  absent: number;
}

interface YearlyReportProps {
  report: {
    year: number;
    matches_played: number;
    total_runs: number;
    total_wickets: number;
    attendance: { present: number; absent: number; percentage: number };
    months: MonthData[];
  };
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

export const YearlyReport: React.FC<YearlyReportProps> = ({ report }) => {
  const maxRuns = Math.max(...report.months.map((m) => m.runs), 1);

  return (
    <Card
      className="border-white/5 bg-academy-gray/40 backdrop-blur-xl p-6 min-w-0 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
      role="region"
      aria-labelledby="yearly-report-title"
    >
      <h2
        id="yearly-report-title"
        className="text-lg font-black uppercase tracking-tight mb-5 flex items-center gap-3 text-white"
      >
        <BarChart2 className="text-academy-red" size={18} aria-hidden="true" />
        {report.year} Yearly Report
      </h2>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Matches", value: report.matches_played },
          { label: "Total Runs", value: report.total_runs },
          { label: "Wickets", value: report.total_wickets },
          { label: "Attendance", value: `${report.attendance.percentage}%` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-xl font-black text-academy-gold">{stat.value}</p>
            <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {report.months.length > 0 ? (
        <>
          {/* Bar chart for runs */}
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">
            Runs per Month
          </p>
          <div className="flex items-end gap-2 h-20 mb-5">
            {report.months.map((m) => {
              const monthSuffix = m.month?.slice(5) ?? "";
              const monthLabel = MONTH_LABELS[monthSuffix] ?? monthSuffix;
              const heightPct = Math.round((m.runs / maxRuns) * 100);
              return (
                <div key={m.month} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <div className="w-full flex items-end justify-center" style={{ height: "60px" }}>
                    <div
                      className="w-full bg-academy-red/70 rounded-t transition-all duration-700"
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                      title={`${m.runs} runs`}
                    />
                  </div>
                  <span className="text-[8px] font-black text-gray-500 truncate w-full text-center">
                    {monthLabel}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Monthly table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] font-bold" aria-label="Monthly performance breakdown">
              <thead>
                <tr className="text-gray-500 uppercase tracking-widest border-b border-white/5">
                  <th className="text-left pb-2 pr-3">Month</th>
                  <th className="text-center pb-2 px-2">Matches</th>
                  <th className="text-center pb-2 px-2">Runs</th>
                  <th className="text-center pb-2 px-2">Wkts</th>
                  <th className="text-center pb-2 pl-2">Attend.</th>
                </tr>
              </thead>
              <tbody>
                {report.months.map((m) => {
                  const monthSuffix = m.month?.slice(5) ?? "";
                  const monthLabel = MONTH_LABELS[monthSuffix] ?? (m.month || "Unknown");
                  const total = m.present + m.absent;
                  const attPct = total > 0 ? Math.round((m.present / total) * 100) : 0;
                  return (
                    <tr key={m.month} className="border-b border-white/5 last:border-0">
                      <td className="py-2 pr-3 text-white">{monthLabel}</td>
                      <td className="py-2 px-2 text-center text-gray-300">{m.matches_played}</td>
                      <td className="py-2 px-2 text-center text-academy-gold">{m.runs}</td>
                      <td className="py-2 px-2 text-center text-gray-300">{m.wickets}</td>
                      <td className="py-2 pl-2 text-center text-emerald-400">{attPct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-[11px] text-gray-400 font-medium">
            No data recorded for {report.year} yet
          </p>
        </div>
      )}
    </Card>
  );
};
