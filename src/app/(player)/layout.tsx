import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardLockOverlay } from "@/components/dashboard/DashboardLockOverlay";

export default async function PlayerLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.user_id;
  const role = session?.user?.role;

  if (!userId) redirect("/signin");

  // Admin landed on a player route — send them to their own area
  if (role === "admin") redirect("/admin");

  const branchId = session?.user?.branch_id;
  const isProfileComplete = session?.user?.isProfileComplete;

  if (!branchId || !isProfileComplete) redirect("/complete-profile");

  // For now, assume membership is active (until full Supabase migration)
  const isLocked = false;
  const membershipStatus = "active";

  return (
    <div className="min-h-screen bg-academy-dark flex flex-col relative">
      <Navbar />
      <div className="flex-1 relative">
        {isLocked && <DashboardLockOverlay membershipStatus={membershipStatus} />}
        {children}
      </div>
    </div>
  );
}
