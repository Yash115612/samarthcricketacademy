"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={10 * 60}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
