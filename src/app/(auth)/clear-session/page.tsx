"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function ClearSessionPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/signin", redirect: true });
  }, []);

  return (
    <div className="min-h-screen bg-academy-dark flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
