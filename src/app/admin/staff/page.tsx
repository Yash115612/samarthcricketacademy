"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { UserSquare, Shield, Phone, Plus, Search, Star, X, Save, Calendar, CheckCircle, XCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";

export default function StaffPage() {
  const { currentBranchId, branchName } = useAdminBranch();
  const [activeTab, setActiveTab] = useState<"list" | "attendance">("list");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Attendance states
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, "Present" | "Absent">>({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    experience: "",
    status: "Active",
    password: "",
    permissions: {
      manageFees: false,
      manageClients: false,
      manageAttendance: false,
      manageMatches: false,
      manageEnquiries: false
    }
  });

  const loadStaff = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff", { signal });
      const data = await res.json();
      if (data.ok) setStaffList(data.staff);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/staff/attendance?date=${attendanceDate}`);
      const data = await res.json();
      if (data.ok) {
        const records: Record<string, "Present" | "Absent"> = {};
        data.attendance.forEach((att: any) => {
          records[att.staff_id] = att.status;
        });
        setAttendanceRecords(records);
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [attendanceDate]);

  useEffect(() => {
    const controller = new AbortController();
    if (activeTab === "list") {
      loadStaff(controller.signal);
    } else {
      loadAttendance();
    }
    return () => controller.abort();
  }, [currentBranchId, activeTab, loadAttendance]);

  const handleMarkAttendance = (staffId: string, status: "Present" | "Absent") => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [staffId]: prev[staffId] === status ? (undefined as any) : status,
    }));
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      const records = Object.entries(attendanceRecords)
        .filter(([_, status]) => status !== undefined)
        .map(([staff_id, status]) => ({ staff_id, status }));

      const res = await fetch("/api/admin/staff/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: attendanceDate, records }),
      });
      const data = await res.json();
      if (data.ok) {
        alert("Staff attendance saved successfully!");
      }
    } catch (err) {
      alert("Failed to save attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedStaff(null);
    setFormData({
      name: "",
      role: "",
      email: "",
      phone: "",
      experience: "",
      status: "Active",
      password: "",
      permissions: {
        manageFees: false,
        manageClients: false,
        manageAttendance: false,
        manageMatches: false,
        manageEnquiries: false
      }
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff: any) => {
    setIsEditMode(true);
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      role: staff.role,
      email: staff.email,
      phone: staff.phone,
      experience: staff.experience,
      status: staff.status || "Active",
      password: "",
      permissions: staff.permissions || {
        manageFees: false,
        manageClients: false,
        manageAttendance: false,
        manageMatches: false,
        manageEnquiries: false
      }
    });
    setIsModalOpen(true);
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) loadStaff();
    } catch (err) {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode ? `/api/admin/staff/${selectedStaff.id}` : "/api/admin/staff";
      const method = isEditMode ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        setIsModalOpen(false);
        loadStaff();
      }
    } catch (err) {
      console.error("Failed to save staff");
    }
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">STAFF MANAGEMENT</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Manage your elite coaching and administrative team for {branchName}</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={handleOpenAddModal}
          className="h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10"
        >
          <Plus size={14} className="mr-2" /> Add New Staff
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/5 pb-4">
        <button
          onClick={() => setActiveTab("list")}
          className={cn(
            "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
            activeTab === "list" ? "bg-academy-gold text-academy-dark shadow-lg shadow-academy-gold/20" : "text-gray-500 hover:text-white"
          )}
        >
          Staff Directory
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={cn(
            "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
            activeTab === "attendance" ? "bg-academy-gold text-academy-dark shadow-lg shadow-academy-gold/20" : "text-gray-500 hover:text-white"
          )}
        >
          Daily Attendance
        </button>
      </div>

      {activeTab === "list" ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Total Staff", value: filteredStaff.length.toString(), icon: UserSquare, color: "text-blue-500" },
              { label: "Certified Coaches", value: filteredStaff.filter(s => s.role.includes("Coach")).length.toString(), icon: Star, color: "text-academy-gold" },
              { label: "Admin Staff", value: filteredStaff.filter(s => !s.role.includes("Coach")).length.toString(), icon: Shield, color: "text-emerald-500" },
            ].map((stat, i) => (
              <Card key={i} className="p-6 border-white/5 bg-academy-gray/30 backdrop-blur-md">
                <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4", stat.color)}>
                  <stat.icon size={20} />
                </div>
                <h3 className="text-2xl font-black mb-1">{stat.value}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Staff List */}
          <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-6 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input 
                  placeholder="Search staff members..." 
                  className="pl-12 h-12 bg-white/5 border-white/10 w-full" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {loading ? (
              <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Loading Staff...</div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-white/5">
                  {filteredStaff.map((member) => (
                    <div key={member.id} className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-academy-gold/10 flex items-center justify-center text-academy-gold font-black text-xs shrink-0">
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-tight truncate">{member.name}</p>
                        <p className="text-[10px] font-bold text-gray-500 truncate">{member.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(member)} className="flex-1 uppercase tracking-widest text-[9px] font-black">Edit</Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteStaff(member.id)} className="flex-1 uppercase tracking-widest text-[9px] font-black hover:text-red-500 hover:border-red-500/20">Delete</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredStaff.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
                      No staff found for this branch
                    </div>
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Staff Member</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Role</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Experience</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Contact</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredStaff.map((member) => (
                        <tr key={member.id} className="group hover:bg-white/5 transition-colors">
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-academy-gold/10 flex items-center justify-center text-academy-gold font-black">
                                {member.name.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <div>
                                <span className="text-xs font-black uppercase tracking-tight block">{member.name}</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{member.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-academy-red bg-academy-red/10 px-3 py-1 rounded-full border border-academy-red/20">
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <span className="text-xs font-black text-white">{member.experience}</span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                              <Phone size={10} /> {member.phone}
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(member)} className="uppercase tracking-widest text-[9px] font-black">Edit</Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteStaff(member.id)} className="uppercase tracking-widest text-[9px] font-black hover:text-red-500 hover:border-red-500/20">Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredStaff.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
                            No staff found for this branch
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        </>
      ) : (
        <div className="space-y-8">
          {/* Attendance Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-academy-gold" size={18} />
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="h-12 pl-12 pr-4 bg-academy-gray/50 border border-white/10 rounded-xl text-white font-bold uppercase tracking-widest text-[10px] focus:outline-none focus:border-academy-gold transition-colors"
                />
              </div>
              <Button 
                onClick={handleSaveAttendance} 
                disabled={savingAttendance}
                className="h-12 px-8 bg-academy-red hover:bg-red-600 text-white uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-red/20"
              >
                {savingAttendance ? "Saving..." : <><Save size={16} className="mr-2" /> Save Attendance</>}
              </Button>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <span>Total: {filteredStaff.length}</span>
              <span className="text-academy-gold">Present: {Object.values(attendanceRecords).filter(v => v === "Present").length}</span>
            </div>
          </div>

          <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Staff Member</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Role</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Loading...</td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">No staff members found</td>
                    </tr>
                  ) : (
                    filteredStaff.map((member) => (
                      <tr key={member.id} className="group hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-academy-gold/10 flex items-center justify-center text-academy-gold font-black text-xs">
                              {member.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight">{member.name}</p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{member.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3 min-h-[40px]">
                            {(attendanceRecords[member.id] === "Present" || !attendanceRecords[member.id]) && (
                              <button
                                onClick={() => handleMarkAttendance(member.id, "Present")}
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border",
                                  attendanceRecords[member.id] === "Present"
                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-110"
                                    : "border-white/10 text-gray-500 hover:border-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/5"
                                )}
                                title={attendanceRecords[member.id] === "Present" ? "Click to unmark" : "Mark Present"}
                              >
                                <CheckCircle size={20} strokeWidth={attendanceRecords[member.id] === "Present" ? 3 : 2} />
                              </button>
                            )}
                            
                            {(attendanceRecords[member.id] === "Absent" || !attendanceRecords[member.id]) && (
                              <button
                                onClick={() => handleMarkAttendance(member.id, "Absent")}
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border",
                                  attendanceRecords[member.id] === "Absent"
                                    ? "bg-academy-red border-academy-red text-white shadow-lg shadow-academy-red/40 scale-110"
                                    : "border-white/10 text-gray-500 hover:border-academy-red/50 hover:text-academy-red hover:bg-academy-red/5"
                                )}
                                title={attendanceRecords[member.id] === "Absent" ? "Click to unmark" : "Mark Absent"}
                              >
                                <XCircle size={20} strokeWidth={attendanceRecords[member.id] === "Absent" ? 3 : 2} />
                              </button>
                            )}

                            {attendanceRecords[member.id] && (
                              <button
                                onClick={() => setAttendanceRecords(prev => ({ ...prev, [member.id]: undefined as any }))}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-gray-500 hover:text-academy-gold hover:border-academy-gold/30 hover:bg-academy-gold/5 transition-all ml-1 animate-in fade-in slide-in-from-left-2 duration-300"
                                title="Change Status"
                              >
                                <Pencil size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-academy-dark/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <Card className="relative w-full max-w-lg bg-academy-gray border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-2xl font-black uppercase tracking-tight">Add New Staff</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Name</label>
                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Role</label>
                <Input required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. Head Coach" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email</label>
                <Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Phone</label>
                <Input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Experience</label>
                <Input required value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. 5 Years" />
              </div>
              {!isEditMode && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Password</label>
                  <Input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-white/5 border-white/10" placeholder="Set login password" />
                </div>
              )}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: "manageFees", label: "Manage Fees/Payments" },
                    { key: "manageClients", label: "Manage Clients" },
                    { key: "manageAttendance", label: "Manage Attendance" },
                    { key: "manageMatches", label: "Manage Matches" },
                    { key: "manageEnquiries", label: "Manage Enquiries" }
                  ].map((perm) => (
                    <label key={perm.key} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.permissions[perm.key as keyof typeof formData.permissions]}
                        onChange={(e) => setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            [perm.key]: e.target.checked
                          }
                        })}
                        className="w-4 h-4 accent-academy-gold"
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 uppercase tracking-widest text-[10px] font-black h-12">Cancel</Button>
                <Button type="submit" variant="secondary" className="flex-1 uppercase tracking-widest text-[10px] font-black h-12">
                  <Save size={14} className="mr-2" /> Save Staff
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

