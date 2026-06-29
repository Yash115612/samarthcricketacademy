"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Gift, User, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAdminBranch } from "@/context/AdminBranchContext";
import { sendWhatsApp, MESSAGES } from "@/lib/whatsapp";

export default function BirthdaysPage() {
  const { currentBranchId, branchName } = useAdminBranch();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (data.ok) setAllUsers(data.users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [currentBranchId]);

  // For demo purposes, we'll assume some users have birthdays today/soon
  // In a real app, you'd filter by user.dob
  const birthdayUsers = allUsers.map((u, i) => ({
    ...u,
    // Mock birthday logic for demo
    isToday: i === 0,
    isTomorrow: i === 1,
    dateLabel: i === 0 ? "Today" : i === 1 ? "Tomorrow" : "Oct 15"
  })).filter(u => u.isToday || u.isTomorrow);

  const handleSendWish = (user: any) => {
    if (!user.phone) {
      alert("No phone number found for this user");
      return;
    }
    sendWhatsApp(user.phone, MESSAGES.BIRTHDAY(user.name));
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">BIRTHDAY CALENDAR</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Send automatic WhatsApp wishes to players and staff for {branchName}</p>
        </div>
      </div>

      <div className="relative w-full md:w-96">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <Input 
          placeholder="Search members..." 
          className="pl-12 h-12 bg-white/5 border-white/10" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="p-20 text-center text-gray-500 font-black uppercase tracking-widest text-xs">Loading birthdays...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {birthdayUsers.map((item) => (
            <Card key={item.id} className={cn(
              "border-white/5 bg-academy-gray/30 backdrop-blur-md p-8 text-center space-y-6 group hover:border-academy-gold/30 transition-all",
              item.isToday && "border-academy-gold/50 bg-academy-gold/5"
            )}>
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto relative">
                <div className="w-12 h-12 rounded-full bg-academy-red/20 flex items-center justify-center text-academy-red font-black">
                  {item.name.charAt(0)}
                </div>
                {item.isToday && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-academy-gold rounded-full flex items-center justify-center text-academy-dark animate-bounce">
                    <Gift size={16} />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-1">{item.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-academy-red">{item.role}</p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{branchName}</p>
                <p className={cn("text-sm font-black uppercase", item.isToday ? "text-academy-gold" : "text-white")}>{item.dateLabel}</p>
              </div>
              <Button 
                onClick={() => handleSendWish(item)}
                variant={item.isToday ? "secondary" : "outline"} 
                className="w-full h-12 text-[10px] font-black uppercase tracking-widest gap-2"
              >
                <MessageCircle size={16} /> Send WhatsApp Wish
              </Button>
            </Card>
          ))}
          {birthdayUsers.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
              <Gift size={48} className="mx-auto text-gray-600 mb-4 opacity-20" />
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">No birthdays today or tomorrow</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

