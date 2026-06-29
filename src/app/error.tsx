"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-academy-dark flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 bg-academy-red/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <AlertTriangle size={48} className="text-academy-red" />
          </div>
          <div className="absolute inset-0 bg-academy-red/20 blur-3xl -z-10 rounded-full" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black uppercase tracking-tight text-white italic">
            Oops! Something <br /> Went Wrong
          </h1>
          <p className="text-gray-400 font-medium leading-relaxed">
            The application encountered an unexpected error. Don&apos;t worry, your data is safe. 
            Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => reset()}
            variant="primary"
            className="w-full h-14 uppercase tracking-widest text-xs font-black gap-2"
          >
            <RefreshCcw size={16} /> Try Again
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="w-full h-14 uppercase tracking-widest text-xs font-black border-white/10 gap-2 hover:bg-white/5"
            >
              <Home size={16} /> Back to Home
            </Button>
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-black/40 border border-white/5 rounded-2xl text-left overflow-auto max-h-40">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Debug Info</p>
            <code className="text-[11px] text-academy-red font-mono break-all leading-relaxed">
              {error.message || "Unknown error"}
              {error.digest && <div className="mt-1 opacity-50">Digest: {error.digest}</div>}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
