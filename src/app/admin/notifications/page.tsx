"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Bell, Check, Trash2, ExternalLink, Info, AlertTriangle, CheckCircle, AlertCircle, Filter, Trash, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAdminBranch } from "@/context/AdminBranchContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { currentBranchId } = useAdminBranch();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotifications = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.ok) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [currentBranchId]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm("Are you sure you want to clear all notifications? This action cannot be undone.")) return;
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="text-emerald-500" size={20} />;
      case "warning": return <AlertTriangle className="text-amber-500" size={20} />;
      case "error": return <AlertCircle className="text-red-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === "all" || !n.is_read;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">NOTIFICATIONS</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Manage your alerts and academy activity logs</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          {notifications.length > 0 && (
            <Button 
              variant="outline" 
              onClick={deleteAllNotifications}
              className="flex-1 md:flex-none h-12 uppercase tracking-widest text-[10px] font-black border-red-500/20 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 size={14} className="mr-2" /> Clear All
            </Button>
          )}
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
              className="flex-1 md:flex-none h-12 uppercase tracking-widest text-[10px] font-black border-white/10 hover:bg-white/5"
            >
              <Check size={14} className="mr-2" /> Mark all as read
            </Button>
          )}
        </div>
      </div>

      <Card className="border-white/5 bg-academy-gray/30 backdrop-blur-md overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                filter === "all" ? "bg-academy-gold text-academy-dark border-academy-gold" : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all relative",
                filter === "unread" ? "bg-academy-gold text-academy-dark border-academy-gold" : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"
              )}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text"
              placeholder="Search notifications..."
              className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-academy-gold/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-20 text-center">
              <div className="w-10 h-10 border-2 border-academy-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Loading alerts...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-20 text-center">
              <Bell size={48} className="mx-auto text-gray-800 mb-6 opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-600">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-6 transition-all group relative hover:bg-white/[0.02]",
                  n.is_read ? "opacity-60" : "bg-white/[0.01]"
                )}
              >
                <div className="flex gap-6">
                  <div className="mt-1 shrink-0">{getTypeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <h4 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-academy-gold transition-colors">
                        {n.title}
                      </h4>
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-400 leading-relaxed max-w-3xl">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-6 mt-4">
                      {n.link && (
                        <Link 
                          href={n.link}
                          className="text-[10px] font-black uppercase tracking-widest text-academy-gold flex items-center gap-1.5 hover:underline"
                        >
                          Action Required <ExternalLink size={12} />
                        </Link>
                      )}
                      {!n.is_read && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-1.5"
                        >
                          <Check size={12} /> Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteNotification(n.id)}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all shadow-lg"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
