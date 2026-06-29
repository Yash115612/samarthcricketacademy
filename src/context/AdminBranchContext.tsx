"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { BranchId } from "@/types/dashboard";

interface AdminBranchContextType {
  currentBranchId: BranchId;
  setCurrentBranchId: (id: BranchId) => void;
  branchName: string;
}

const AdminBranchContext = createContext<AdminBranchContextType | undefined>(undefined);

export function AdminBranchProvider({ children }: { children: React.ReactNode }) {
  const [currentBranchId, setCurrentBranchId] = useState<BranchId>("samarth");
  const [branchName, setBranchName] = useState("Samarth Academy");

  // Load from localStorage and fetch branch name on mount
  useEffect(() => {
    const load = async () => {
      const saved = localStorage.getItem("admin_current_branch_id") as BranchId;
      let branchId = saved || "samarth";
      
      try {
        const res = await fetch("/api/admin/branches");
        const data = await res.json();
        if (data.ok) {
          const branches = data.branches;
          const found = branches.find((b: any) => b.id === branchId);
          if (found) {
            setCurrentBranchId(branchId);
            setBranchName(found.name);
          } else if (branches.length > 0) {
            setCurrentBranchId(branches[0].id);
            setBranchName(branches[0].name);
            localStorage.setItem("admin_current_branch_id", branches[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load branches in context", err);
      }
    };
    load();
  }, []);

  const handleSetBranch = useCallback(async (id: BranchId) => {
    setCurrentBranchId(id);
    localStorage.setItem("admin_current_branch_id", id);
    document.cookie = `admin_current_branch_id=${id}; path=/; max-age=${60 * 60 * 24 * 30}`;
    
    // Update name
    try {
      const res = await fetch("/api/admin/branches");
      const data = await res.json();
      if (data.ok) {
        const found = data.branches.find((b: any) => b.id === id);
        if (found) setBranchName(found.name);
      }
    } catch {}
  }, []);

  const value = useMemo(() => ({ 
    currentBranchId, 
    setCurrentBranchId: handleSetBranch, 
    branchName 
  }), [currentBranchId, handleSetBranch, branchName]);

  return (
    <AdminBranchContext.Provider value={value}>
      {children}
    </AdminBranchContext.Provider>
  );
}

export function useAdminBranch() {
  const context = useContext(AdminBranchContext);
  if (context === undefined) {
    throw new Error("useAdminBranch must be used within an AdminBranchProvider");
  }
  return context;
}
