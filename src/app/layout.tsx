import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], display: "swap", preload: true, variable: "--font-sans" });
const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  display: "swap", 
  preload: true, 
  weight: ["400", "500", "600", "700", "800"], 
  variable: "--font-heading" 
});

export const metadata: Metadata = {
  title: "Samarth Cricket Academy",
  description: "Elite Cricket Training for Future Stars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className={`${inter.className} font-sans`} suppressHydrationWarning>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-academy-red focus:text-white focus:px-6 focus:py-3 focus:rounded-xl focus:font-black focus:uppercase focus:tracking-widest focus:shadow-2xl"
        >
          Skip to main content
        </a>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
