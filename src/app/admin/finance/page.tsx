"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { Wallet, TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownRight, Search, Filter, X, Save, Download, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";

function FinancePageContent() {
  const { currentBranchId, branchName } = useAdminBranch();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const [transactionList, setTransactionList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtering states
  const [filterType, setFilterType] = useState<"All" | "Income" | "Expense">("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(typeParam === "expense");

  // Form state
  const [formData, setFormData] = useState({
    type: (typeParam === "expense" ? "Expense" : "Income") as "Income" | "Expense",
    category: "",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    status: "Completed" as const,
    player: ""
  });

  const loadTransactions = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/finance", { signal });
      const data = await res.json();
      if (data.ok) setTransactionList(data.transactions);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Failed to load transactions");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadTransactions(controller.signal);
    return () => controller.abort();
  }, [currentBranchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        setIsModalOpen(false);
        loadTransactions();
      }
    } catch (err) {
      console.error("Failed to save transaction");
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredTransactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finance Report");
    XLSX.writeFile(wb, `Finance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const categories = ["All", ...Array.from(new Set(transactionList.map(t => t.category)))];

  const filteredTransactions = transactionList.filter(t => {
    const matchesSearch = t.player.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || t.type === filterType;
    const matchesCategory = filterCategory === "All" || t.category === filterCategory;
    const matchesDate = (!dateRange.start || t.date >= dateRange.start) && 
                       (!dateRange.end || t.date <= dateRange.end);
    const matchesAmount = (!amountRange.min || t.amount >= Number(amountRange.min)) && 
                         (!amountRange.max || t.amount <= Number(amountRange.max));
    
    return matchesSearch && matchesType && matchesCategory && matchesDate && matchesAmount;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalIncome = filteredTransactions
    .filter(t => t.type === "Income")
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === "Expense")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">FINANCE CONTROL</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Monitor revenue, expenses and academy cash flow for {branchName}</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="flex-1 md:flex-none h-12 uppercase tracking-widest text-[10px] font-black border-white/10 hover:bg-white/5"
          >
            <Download size={14} className="mr-2" /> Export report
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10"
          >
            <Plus size={14} className="mr-2" /> Record Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Revenue", value: `₹${totalIncome.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500" },
          { label: "Total Expenses", value: `₹${totalExpense.toLocaleString()}`, icon: TrendingDown, color: "text-academy-red" },
          { label: "Net Profit", value: `₹${(totalIncome - totalExpense).toLocaleString()}`, icon: Wallet, color: "text-academy-gold" },
        ].map((stat, i) => (
          <Card key={i} className="p-8 border-white/5 bg-academy-gray/30 backdrop-blur-md">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center", stat.color)}>
                <stat.icon size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-black mb-1 text-white">{stat.value}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
        <div className="p-6 border-b border-white/5 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-black uppercase tracking-widest text-white">Transaction History</h3>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input 
                  placeholder="Search player or category..." 
                  className="pl-10 h-10 bg-white/5 border-white/10 text-xs w-full" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className={cn("h-10 border-white/10", showFilters && "bg-white/10")}
              >
                <Filter size={14} className="mr-2" /> Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Type</label>
                <div className="flex gap-2">
                  {["All", "Income", "Expense"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type as any)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                        filterType === type ? "bg-academy-gold text-black border-academy-gold" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                <select 
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-academy-gold/50"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  {categories.map(c => <option key={c} value={c} className="bg-academy-gray">{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Date Range</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="date" 
                    className="h-10 bg-white/5 border-white/10 text-[10px] p-2" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                  <span className="text-gray-600">—</span>
                  <Input 
                    type="date" 
                    className="h-10 bg-white/5 border-white/10 text-[10px] p-2" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount (Min - Max)</label>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Min" 
                    type="number"
                    className="h-10 bg-white/5 border-white/10 text-[10px]" 
                    value={amountRange.min}
                    onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
                  />
                  <span className="text-gray-600">—</span>
                  <Input 
                    placeholder="Max" 
                    type="number"
                    className="h-10 bg-white/5 border-white/10 text-[10px]" 
                    value={amountRange.max}
                    onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
                  />
                </div>
              </div>

              <div className="md:col-span-4 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setFilterType("All");
                    setFilterCategory("All");
                    setDateRange({ start: "", end: "" });
                    setAmountRange({ min: "", max: "" });
                    setSearchQuery("");
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-academy-red hover:bg-red-500/10"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Loading Transactions...</div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Transaction</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedTransactions.map((tx) => (
                    <tr key={tx.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          {tx.type === "Income" ? (
                            <ArrowUpRight size={16} className="text-emerald-500" />
                          ) : (
                            <ArrowDownRight size={16} className="text-academy-red" />
                          )}
                          <div>
                            <span className="text-xs font-black uppercase tracking-tight text-white block">{tx.type}</span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase">{tx.player}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tx.category}</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={cn(
                          "text-sm font-black",
                          tx.type === "Income" ? "text-emerald-500" : "text-academy-red"
                        )}>₹{tx.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-1 rounded-full",
                          tx.status === "Completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        )}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{tx.date}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        No transactions found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-white/5 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} records
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="h-8 w-8 p-0 border-white/10"
                    >
                      <ChevronLeft size={14} />
                    </Button>
                    <div className="flex items-center px-4 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-[10px] font-black text-white">Page {currentPage} of {totalPages}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="h-8 w-8 p-0 border-white/10"
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Record Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <Card className="relative w-full max-w-lg bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-2xl font-black uppercase tracking-tight">Record Transaction</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Type</label>
                  <select 
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-academy-gold/50"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="Income" className="bg-academy-gray">Income</option>
                    <option value="Expense" className="bg-academy-gray">Expense</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount</label>
                  <Input required type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} className="bg-white/5 border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                <Input required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. Membership, Equipment" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Entity Name</label>
                <Input required value={formData.player} onChange={(e) => setFormData({ ...formData, player: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. Player Name or Academy" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Date</label>
                  <Input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status</label>
                  <select 
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-academy-gold/50"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="Completed" className="bg-academy-gray">Completed</option>
                    <option value="Pending" className="bg-academy-gray">Pending</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black">Cancel</Button>
                <Button type="submit" variant="secondary" className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black">
                  <Save size={14} className="mr-2" /> Save Transaction
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Loading Finance Control...</div>}>
      <FinancePageContent />
    </Suspense>
  );
}
