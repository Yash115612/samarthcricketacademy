"use client";

import React, { createContext, useContext, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { User } from "@/types/dashboard";

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  updateSession: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // Only "loading" on the very first check — not during re-validates.
  // session is undefined before the first check, null when unauthenticated, or a Session object.
  const isLoading = status === "loading" && session === undefined;

  const updateRef = useRef(update);
  updateRef.current = update;

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/");
  }, [router]);

  const updateSession = useCallback(async () => {
    await updateRef.current();
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    try {
      const res = await fetch("/api/player/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await updateSession();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating user:", err);
      return false;
    }
  }, [updateSession]);

  const user: User | null = useMemo(() => {
    const u = session?.user;
    const userId = u?.user_id;
    const branch_id = u?.branch_id ?? null;
    const role = u?.role ?? null;
    if (!userId || !role) return null;
    return {
      id: userId,
      name: u?.name ?? "",
      email: u?.email ?? "",
      phone: "",
      branch_id: (branch_id ?? "samarth") as any,
      role: role as any,
      experience: "",
      isProfileComplete: !!u?.isProfileComplete,
      membership_status: (u as any)?.membership_status ?? "none",
    };
  }, [session?.user]);

  return (
    <AuthContext.Provider value={{
      user,
      logout,
      updateSession,
      updateUser,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
