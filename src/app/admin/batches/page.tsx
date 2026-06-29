import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Clock, Plus, Search, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { getAdminBranchId } from "@/server/branch";
import { BATCHES } from "@/data/batches";

export default function BatchesPage() {
  const branchId = getAdminBranchId();
  const filteredBatches = BATCHES.filter(b => b.branch_id === branchId);

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">BATCH MANAGEMENT</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Organize and schedule training sessions for {branchId === "samarth" ? "Samarth Academy" : "AIMS Academy"}</p>
        </div>
        <Button variant="secondary" className="h-12 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-academy-gold/10">
          <Plus size={14} className="mr-2" /> Create New Batch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredBatches.map((batch) => (
          <Card key={batch.id} className="border-white/5 bg-academy-gray/30 backdrop-blur-md group hover:border-academy-gold/30 transition-all duration-500">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-academy-red/10 flex items-center justify-center text-academy-red">
                  <Clock size={24} />
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">Active</span>
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-1">{batch.name}</h3>
                <p className="text-xs font-bold text-academy-gold uppercase tracking-widest">{batch.time}</p>
              </div>
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Schedule</span>
                  <span className="text-[10px] font-black uppercase text-white">{batch.days}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Students</span>
                  <span className="text-[10px] font-black uppercase text-white">{batch.students} Players</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Lead Coach</span>
                  <span className="text-[10px] font-black uppercase text-white">{batch.coach}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full h-10 text-[10px] font-black uppercase tracking-widest group-hover:bg-white/5">
                Manage Roster
              </Button>
            </div>
          </Card>
        ))}
        {filteredBatches.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 text-[10px] font-black uppercase tracking-widest">
            No batches scheduled for this branch
          </div>
        )}
      </div>
    </div>
  );
}
