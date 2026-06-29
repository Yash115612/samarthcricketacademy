"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle, XCircle, Clock, Eye, X, RefreshCw,
  User, Phone, CreditCard, Building2, Hash, Calendar, Settings2, QrCode, Save, Plus, Trash2, Upload
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { sendWhatsApp, MESSAGES } from "@/lib/whatsapp";

type PaymentStatus = "pending" | "approved" | "rejected";

interface PaymentRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  plan_name: string;
  plan_price: number;
  plan_duration_days: number;
  branch_id: string;
  utr_number: string;
  screenshot_url: string;
  status: PaymentStatus;
  created_at: string;
  reviewed_at?: string;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock },
  approved: { label: "Approved", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle },
  rejected: { label: "Rejected", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PaymentStatus | "all">("pending");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [preview, setPreview] = useState<PaymentRecord | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Payment method management states
  const [isEditMethodOpen, setIsEditMethodOpen] = useState(false);
  const [methodLoading, setMethodLoading] = useState(false);
  const [methodData, setMethodData] = useState({
    payment_qr_url: "",
    payment_upi_id: "",
    payment_instructions: [] as string[]
  });
  const [savedMethod, setSavedMethod] = useState({
    payment_qr_url: "",
    payment_upi_id: "",
    payment_instructions: [] as string[]
  });
  const qrInputRef = useRef<HTMLInputElement>(null);

  const fetchMethod = useCallback(async (onlyIfMounted: () => boolean) => {
    try {
      const res = await fetch("/api/admin/settings/pt");
      const data = await res.json();
      if (!onlyIfMounted()) return;
      if (data?.ok) {
        const m = {
          payment_qr_url: data.settings.payment_qr_url || "",
          payment_upi_id: data.settings.payment_upi_id || "",
          payment_instructions: data.settings.payment_instructions || []
        };
        setMethodData(m);
        setSavedMethod(m);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchMethod(() => mounted);
    return () => { mounted = false; };
  }, [fetchMethod]);

  useEffect(() => {
    if (!isEditMethodOpen) return;
    let mounted = true;
    fetchMethod(() => mounted);
    return () => { mounted = false; };
  }, [isEditMethodOpen, fetchMethod]);

  const handleUpdateMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setMethodLoading(true);
    try {
      const res = await fetch("/api/admin/settings/pt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(methodData)
      });
      const data = await res.json();
      if (data?.ok) {
        setSavedMethod({ ...methodData });
        showToast("Payment method updated successfully", "success");
        setIsEditMethodOpen(false);
      } else {
        showToast("Failed to update payment method", "error");
      }
    } catch (err) {
      showToast("Update failed", "error");
    } finally {
      setMethodLoading(false);
    }
  };

  const handleAddInstruction = () => {
    setMethodData(prev => ({
      ...prev,
      payment_instructions: [...prev.payment_instructions, ""]
    }));
  };

  const handleRemoveInstruction = (index: number) => {
    setMethodData(prev => ({
      ...prev,
      payment_instructions: prev.payment_instructions.filter((_, i) => i !== index)
    }));
  };

  const handleInstructionChange = (index: number, value: string) => {
    setMethodData(prev => {
      const updated = [...prev.payment_instructions];
      updated[index] = value;
      return { ...prev, payment_instructions: updated };
    });
  };

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMethodData(prev => ({ ...prev, payment_qr_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPayments = useCallback(async (onlyIfMounted?: () => boolean) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments");
      const data = (await res.json().catch(() => null)) as any;
      if (onlyIfMounted && !onlyIfMounted()) return;
      if (data?.ok) setPayments(data.payments);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchPayments(() => mounted);
    return () => { mounted = false; };
  }, [fetchPayments]);

  const handleApprove = async (id: string) => {
    setActionLoading(id + "_approve");
    try {
      const payment = payments.find(p => p.id === id);
      const res = await fetch(`/api/admin/payments/${id}/approve`, { method: "POST" });
      const data = (await res.json().catch(() => null)) as any;
      if (data?.ok) {
        showToast("Payment approved. User account created successfully.", "success");
        fetchPayments();
        if (preview?.id === id) setPreview(null);
        
        // Auto WhatsApp
        if (payment) {
          setTimeout(() => {
            if (confirm(`Send WhatsApp confirmation to ${payment.name}?`)) {
              sendWhatsApp(payment.phone, MESSAGES.PAYMENT_APPROVED(payment.name, payment.plan_name));
            }
          }, 500);
        }
      } else {
        showToast(data?.error === "ALREADY_PROCESSED" ? "Already processed." : "Approval failed.", "error");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id + "_reject");
    try {
      const res = await fetch(`/api/admin/payments/${id}/reject`, { method: "POST" });
      const data = (await res.json().catch(() => null)) as any;
      if (data?.ok) {
        showToast("Payment rejected.", "success");
        fetchPayments();
        if (preview?.id === id) setPreview(null);
      } else {
        showToast(data?.error === "ALREADY_PROCESSED" ? "Already processed." : "Rejection failed.", "error");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const filtered = payments.filter((p) => {
    const statusMatch = filter === "all" || p.status === filter;
    const branchMatch = branchFilter === "all" || p.branch_id === branchFilter;
    const searchMatch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.utr_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);
    
    const paymentDate = new Date(p.created_at);
    const dateMatch = (!dateRange.start || paymentDate >= new Date(dateRange.start)) &&
                     (!dateRange.end || paymentDate <= new Date(dateRange.end));

    return statusMatch && branchMatch && searchMatch && dateMatch;
  });
  const counts = {
    all: payments.length,
    pending: payments.filter((p) => p.status === "pending").length,
    approved: payments.filter((p) => p.status === "approved").length,
    rejected: payments.filter((p) => p.status === "rejected").length,
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-widest border flex items-center gap-3 transition-all",
          toast.type === "success"
            ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-300"
            : "bg-red-900/90 border-red-500/30 text-red-300"
        )}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Payment Approvals</h1>
          <p className="text-gray-400 text-sm mt-1">Review and approve membership payment submissions</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Input 
            placeholder="Search by name, UTR, phone..." 
            className="w-full md:w-64 h-10 bg-white/5 border-white/10 text-[10px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              className="w-32 h-10 bg-white/5 border-white/10 text-[10px]"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <span className="text-gray-600">-</span>
            <Input 
              type="date" 
              className="w-32 h-10 bg-white/5 border-white/10 text-[10px]"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 h-10 text-[10px] font-black uppercase tracking-widest text-gray-400 focus:outline-none focus:ring-2 focus:ring-academy-gold/50 transition-all cursor-pointer hover:bg-white/10"
          >
            <option value="all">All Branches</option>
            <option value="samarth">Samarth Academy</option>
            <option value="aims">AIMS Academy</option>
          </select>
          <Button
            variant="ghost"
            className="gap-2 text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 h-10"
            onClick={() => setIsEditMethodOpen(true)}
          >
            <Settings2 size={14} /> <span className="hidden sm:inline">Edit Payment Method</span><span className="sm:hidden">Method</span>
          </Button>
          <Button
            variant="ghost"
            className="gap-2 text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 h-10"
            onClick={() => fetchPayments()}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {/* Current Payment Method Card */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-academy-gold/10 border border-academy-gold/20 flex items-center justify-center">
            <QrCode size={18} className="text-academy-gold" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Current Payment Method</p>
            <p className="text-sm font-black text-white mt-0.5">
              {savedMethod.payment_upi_id || <span className="text-gray-500 font-normal italic">Not configured</span>}
            </p>
          </div>
        </div>
        {savedMethod.payment_qr_url && (
          <div className="w-20 h-20 rounded-2xl bg-white border-2 border-academy-gold/30 overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={savedMethod.payment_qr_url} alt="QR" className="w-full h-full object-contain p-1" />
          </div>
        )}
        <div className="flex-1">
          {savedMethod.payment_instructions.length > 0 && (
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-2">Instructions</p>
              {savedMethod.payment_instructions.slice(0, 3).map((inst, i) => (
                <p key={i} className="text-[10px] text-gray-400">
                  <span className="text-academy-gold/60 font-black mr-1">{i + 1}.</span>{inst}
                </p>
              ))}
              {savedMethod.payment_instructions.length > 3 && (
                <p className="text-[9px] text-gray-600">+{savedMethod.payment_instructions.length - 3} more</p>
              )}
            </div>
          )}
          {!savedMethod.payment_instructions.length && !savedMethod.payment_upi_id && (
            <p className="text-xs text-gray-600 italic">Click &quot;Edit Payment Method&quot; to configure how players should pay.</p>
          )}
        </div>
        <button
          onClick={() => setIsEditMethodOpen(true)}
          className="shrink-0 px-4 h-9 rounded-xl bg-academy-gold/10 border border-academy-gold/20 text-academy-gold text-[10px] font-black uppercase tracking-widest hover:bg-academy-gold/20 transition-all flex items-center gap-2"
        >
          <Settings2 size={12} /> Edit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => {
          const cfg = s === "all"
            ? { label: "Total", color: "text-white bg-white/5 border-white/10" }
            : STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all hover:opacity-90",
                cfg.color,
                filter === s && "ring-2 ring-white/20"
              )}
            >
              <p className="text-2xl font-black">{counts[s]}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-1">
                {s === "all" ? "Total" : STATUS_CONFIG[s].label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-4 border-academy-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-500">
            <CreditCard size={32} className="opacity-30" />
            <p className="text-xs font-black uppercase tracking-widest">No {filter === "all" ? "" : filter} payments</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-white/5">
              {filtered.map((p) => {
                const StatusIcon = STATUS_CONFIG[p.status].icon;
                return (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{p.email}</p>
                        <p className="text-[10px] text-gray-500">{p.phone}</p>
                      </div>
                      <span className={cn("shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border", STATUS_CONFIG[p.status].color)}>
                        <StatusIcon size={9} />{STATUS_CONFIG[p.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-gray-400">
                      <span className="font-black text-academy-gold">{p.plan_name} · ₹{p.plan_price.toLocaleString("en-IN")}</span>
                      <span className="font-mono text-gray-500 truncate">{p.utr_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setPreview(p)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white" title="View">
                        <Eye size={14} />
                      </button>
                      {p.status === "pending" && (
                        <>
                          <button onClick={() => handleApprove(p.id)} disabled={!!actionLoading} className="flex-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-emerald-400 text-[10px] font-black uppercase disabled:opacity-50">
                            Approve
                          </button>
                          <button onClick={() => handleReject(p.id)} disabled={!!actionLoading} className="flex-1 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-red-400 text-[10px] font-black uppercase disabled:opacity-50">
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Player", "Plan", "Branch", "UTR", "Submitted", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const StatusIcon = STATUS_CONFIG[p.status].icon;
                    return (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-white">{p.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{p.email}</p>
                          <p className="text-[10px] text-gray-500">{p.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-black text-white">{p.plan_name}</p>
                          <p className="text-[10px] text-academy-gold">₹{p.plan_price.toLocaleString("en-IN")}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {p.branch_id === "samarth" ? "Samarth" : "AIMS"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono text-gray-300">{p.utr_number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] text-gray-500">
                            {new Date(p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", STATUS_CONFIG[p.status].color)}>
                            <StatusIcon size={10} />
                            {STATUS_CONFIG[p.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPreview(p)}
                              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                              title="View screenshot"
                            >
                              <Eye size={14} />
                            </button>
                            {p.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(p.id)}
                                  disabled={!!actionLoading}
                                  className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-emerald-400 disabled:opacity-50"
                                  title="Approve"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={() => handleReject(p.id)}
                                  disabled={!!actionLoading}
                                  className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-red-400 disabled:opacity-50"
                                  title="Reject"
                                >
                                  <XCircle size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Screenshot Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative bg-academy-gray border border-white/10 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setPreview(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-black uppercase tracking-tight mb-6">Payment Details</h2>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { icon: User, label: "Name", value: preview.name },
                { icon: Phone, label: "Phone", value: preview.phone },
                { icon: CreditCard, label: "Plan", value: `${preview.plan_name} — ₹${preview.plan_price.toLocaleString("en-IN")}` },
                { icon: Building2, label: "Branch", value: preview.branch_id === "samarth" ? "Samarth Academy" : "AIMS Academy" },
                { icon: Hash, label: "UTR Number", value: preview.utr_number },
                { icon: Calendar, label: "Submitted", value: new Date(preview.created_at).toLocaleString("en-IN") },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={12} className="text-academy-gold" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{label}</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* Screenshot */}
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Payment Screenshot</p>
              {preview.screenshot_url ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview.screenshot_url}
                    alt="Payment proof"
                    className="w-full max-h-96 object-contain"
                  />
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-gray-500 text-xs">
                  No screenshot uploaded
                </div>
              )}
            </div>

            {/* Actions */}
            {preview.status === "pending" && (
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-500 border-emerald-500/30 text-white font-black uppercase tracking-widest text-xs"
                  onClick={() => handleApprove(preview.id)}
                  disabled={!!actionLoading}
                >
                  <CheckCircle size={14} />
                  {actionLoading === preview.id + "_approve" ? "Approving..." : "Approve & Create Account"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 font-black uppercase tracking-widest text-xs"
                  onClick={() => handleReject(preview.id)}
                  disabled={!!actionLoading}
                >
                  <XCircle size={14} />
                  {actionLoading === preview.id + "_reject" ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            )}

            {preview.status !== "pending" && (
              <div className={cn("flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest border", STATUS_CONFIG[preview.status].color)}>
                {preview.status === "approved" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {STATUS_CONFIG[preview.status].label} on{" "}
                {preview.reviewed_at ? new Date(preview.reviewed_at).toLocaleDateString("en-IN") : "—"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Payment Method Modal */}
      {isEditMethodOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-academy-gray border border-white/10 rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300 my-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Payment Configuration</h2>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Setup how players pay for memberships</p>
              </div>
              <button onClick={() => setIsEditMethodOpen(false)} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateMethod} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* QR Section */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-academy-gold flex items-center gap-2">
                      <QrCode size={12} /> UPI QR Code
                    </label>
                    
                    <div className="relative aspect-square w-full bg-white rounded-3xl flex items-center justify-center overflow-hidden border-4 border-academy-gold/30 shadow-2xl shadow-academy-gold/5 group">
                      {methodData.payment_qr_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={methodData.payment_qr_url}
                          alt="Payment QR"
                          className="w-full h-full object-contain p-4"
                        />
                      ) : (
                        <div className="text-gray-300 text-center p-6">
                          <QrCode size={48} className="mx-auto mb-2 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No QR Selected</p>
                        </div>
                      )}
                      <div 
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        onClick={() => qrInputRef.current?.click()}
                      >
                        <div className="flex flex-col items-center gap-2 text-white">
                          <Upload size={24} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Change QR Image</span>
                        </div>
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={qrInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleQRUpload}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-academy-gold flex items-center gap-2">
                      <Hash size={12} /> UPI ID / VPA
                    </label>
                    <Input
                      required
                      placeholder="academy@upi"
                      value={methodData.payment_upi_id}
                      onChange={(e) => setMethodData({ ...methodData, payment_upi_id: e.target.value })}
                      className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-sm font-medium focus:ring-2 focus:ring-academy-gold/50 transition-all"
                    />
                  </div>
                </div>

                {/* Instructions Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-academy-gold">
                      Payment Instructions
                    </label>
                    <button 
                      type="button"
                      onClick={handleAddInstruction}
                      className="p-1.5 rounded-lg bg-academy-gold/10 border border-academy-gold/20 text-academy-gold hover:bg-academy-gold/20 transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {methodData.payment_instructions.map((inst, idx) => (
                      <div key={idx} className="flex gap-2 group">
                        <div className="flex-1 relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-academy-gold/50">
                            {idx + 1}
                          </span>
                          <Input
                            value={inst}
                            onChange={(e) => handleInstructionChange(idx, e.target.value)}
                            className="h-12 bg-white/5 border-white/10 rounded-xl pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-academy-gold/30"
                            placeholder="Add instruction step..."
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRemoveInstruction(idx)}
                          className="p-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {methodData.payment_instructions.length === 0 && (
                      <div className="text-center py-8 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No instructions added</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4 border-t border-white/5">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-14 rounded-2xl uppercase tracking-widest text-xs font-black border border-white/10"
                  onClick={() => setIsEditMethodOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  className="flex-1 h-14 rounded-2xl uppercase tracking-widest text-xs font-black shadow-xl shadow-academy-gold/20"
                  disabled={methodLoading}
                >
                  {methodLoading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" /> Updating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save size={14} /> Save Configuration
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
