"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAdminBranch } from "@/context/AdminBranchContext";
import {
  Download, Users, CreditCard, TrendingUp, MessageSquare,
  FileSpreadsheet, Layers, Receipt, CheckCircle2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ReportType = "clients" | "memberships" | "revenue" | "transactions" | "enquiries" | "all";

const REPORTS: {
  type: ReportType;
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
}[] = [
  {
    type: "all",
    title: "Full Academy Report",
    desc: "All data in one file — clients, memberships, payments, transactions, and enquiries.",
    icon: Layers,
    color: "border-academy-gold/30 bg-academy-gold/5 hover:border-academy-gold/60",
    badge: "Recommended",
  },
  {
    type: "clients",
    title: "Clients / Players",
    desc: "Name, email, phone, branch, membership status for every registered player.",
    icon: Users,
    color: "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40",
  },
  {
    type: "memberships",
    title: "Memberships",
    desc: "Plan name, type, start date, expiry date, and current status for each member.",
    icon: CreditCard,
    color: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40",
  },
  {
    type: "revenue",
    title: "Revenue & Payments",
    desc: "All payment submissions — UTR, amount, plan, approval status, and date.",
    icon: TrendingUp,
    color: "border-academy-red/20 bg-academy-red/5 hover:border-academy-red/40",
  },
  {
    type: "transactions",
    title: "Transactions",
    desc: "Income and expense ledger — category, amount, player, and status.",
    icon: Receipt,
    color: "border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40",
  },
  {
    type: "enquiries",
    title: "Enquiries",
    desc: "All admission and contact form submissions with status and message.",
    icon: MessageSquare,
    color: "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40",
  },
];

export default function ReportsPage() {
  const { currentBranchId, branchName } = useAdminBranch();
  const [downloading, setDownloading] = useState<ReportType | null>(null);
  const [lastDownloaded, setLastDownloaded] = useState<ReportType | null>(null);

  const handleDownload = async (type: ReportType) => {
    setDownloading(type);
    try {
      const url = `/api/admin/reports?type=${type}&branch=${currentBranchId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `report_${type}.csv`;

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setLastDownloaded(type);
      setTimeout(() => setLastDownloaded(null), 3000);
    } catch (err) {
      console.error("Download failed", err);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">DOWNLOAD REPORTS</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            Export data for {branchName} as Excel (.xlsx) — opens directly in Microsoft Excel or Google Sheets
          </p>
        </div>
        <Button
          variant="secondary"
          className="h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10 shrink-0"
          disabled={downloading === "all"}
          onClick={() => handleDownload("all")}
        >
          {downloading === "all" ? (
            <Loader2 size={14} className="mr-2 animate-spin" />
          ) : (
            <Download size={14} className="mr-2" />
          )}
          Download All Data
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-400">
        <FileSpreadsheet size={18} className="text-academy-gold shrink-0 mt-0.5" />
        <p>
          All reports are exported as <span className="text-white font-bold">.xlsx</span> Excel files with properly formatted columns and auto-sized widths.
          The <span className="text-white font-bold">Full Report</span> contains 5 separate sheets in one file. Filename includes the branch and today&apos;s date.
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {REPORTS.map((report) => {
          const isLoading = downloading === report.type;
          const isDone = lastDownloaded === report.type;

          return (
            <Card
              key={report.type}
              className={cn(
                "relative p-7 border transition-all duration-300 cursor-pointer group",
                report.color
              )}
            >
              {report.badge && (
                <span className="absolute -top-3 left-6 px-3 py-1 bg-academy-gold text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow">
                  {report.badge}
                </span>
              )}

              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
                  <report.icon size={22} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-white text-sm mb-1">{report.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{report.desc}</p>
                </div>
              </div>

              <Button
                variant="outline"
                className={cn(
                  "w-full h-11 uppercase tracking-widest text-[10px] font-black transition-all",
                  isDone
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-white/20 bg-white/5 hover:bg-white/10"
                )}
                disabled={isLoading}
                onClick={() => handleDownload(report.type)}
              >
                {isLoading ? (
                  <><Loader2 size={13} className="mr-2 animate-spin" /> Preparing...</>
                ) : isDone ? (
                  <><CheckCircle2 size={13} className="mr-2" /> Downloaded!</>
                ) : (
                  <><Download size={13} className="mr-2" /> Download Excel</>
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Usage tip */}
      <div className="p-6 rounded-2xl border border-white/5 bg-academy-gray/20">
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">How to open your report</h4>
        <ol className="space-y-2 text-xs text-gray-500 font-medium list-decimal list-inside leading-relaxed">
          <li>Click <span className="text-white font-bold">Download Excel</span> on any report above.</li>
          <li><span className="text-white font-bold">Microsoft Excel:</span> Double-click the downloaded <code className="text-academy-gold">.xlsx</code> file — opens directly.</li>
          <li><span className="text-white font-bold">Google Sheets:</span> Go to sheets.new → File → Import → Upload the file.</li>
          <li>The <span className="text-white font-bold">Full Report</span> has 5 separate tabs (Clients, Memberships, Revenue, Transactions, Enquiries) in one file.</li>
        </ol>
      </div>
    </div>
  );
}
