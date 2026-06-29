"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-academy-dark text-white font-sans">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="w-24 h-24 bg-academy-red/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={48} className="text-academy-red" />
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black uppercase tracking-tight italic">
                Critical Error
              </h1>
              <p className="text-gray-400 font-medium leading-relaxed">
                A critical system error occurred. Please refresh the application.
              </p>
            </div>

            <button
              onClick={() => reset()}
              className="w-full h-14 bg-academy-red text-white uppercase tracking-widest text-xs font-black rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw size={16} /> Refresh App
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
