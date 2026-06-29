"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Trash2, ExternalLink, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link?: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.ok) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="text-emerald-500" size={16} />;
      case "warning": return <AlertTriangle className="text-amber-500" size={16} />;
      case "error": return <AlertCircle className="text-red-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2.5 rounded-xl transition-all duration-300",
          isOpen ? "bg-academy-gold text-academy-dark" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
        )}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-academy-dark animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 md:w-96 bg-academy-gray border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Notifications</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase">{unreadCount} Unread Alerts</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[9px] font-black uppercase tracking-widest text-academy-gold hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell size={32} className="mx-auto text-gray-700 mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={cn(
                      "p-4 transition-colors group relative",
                      n.is_read ? "bg-transparent opacity-60" : "bg-white/[0.02]"
                    )}
                  >
                    <div className="flex gap-4">
                      <div className="mt-1">{getTypeIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-black uppercase tracking-tight text-white truncate">
                            {n.title}
                          </h4>
                          <span className="text-[8px] font-bold text-gray-600 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-400 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          {n.link && (
                            <Link 
                              href={n.link}
                              onClick={() => {
                                markAsRead(n.id);
                                setIsOpen(false);
                              }}
                              className="text-[9px] font-black uppercase tracking-widest text-academy-gold flex items-center gap-1 hover:underline"
                            >
                              View Details <ExternalLink size={10} />
                            </Link>
                          )}
                          {!n.is_read && (
                            <button 
                              onClick={() => markAsRead(n.id)}
                              className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/5 bg-white/5 text-center">
            <Link 
              href="/admin/notifications" 
              className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
