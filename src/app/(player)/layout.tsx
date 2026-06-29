import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { users, memberships } from "@/server/db/inMemoryDb";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardLockOverlay } from "@/components/dashboard/DashboardLockOverlay";

export default async function PlayerLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.user_id;

  if (!userId) redirect("/signin");

  const user = users.getById(userId);

  // Stale JWT: user_id exists in token but not in DB (e.g. after DB reset)
  // Must clear the session rather than redirect to /signin, which would loop.
  if (!user) redirect("/clear-session");

  // Admin landed on a player route — send them to their own area
  if (user.role !== "player") redirect("/admin");

  if (!user.branch_id || !user.isProfileComplete) redirect("/complete-profile");

  // Auto-expiry: run normalizeStatus on every page load so expiry is always current
  const mem = memberships.getForUserBranch(userId, user.branch_id);
  if (mem) memberships.normalizeStatus(mem);

  // Re-read after potential status update
  const freshUser = users.getById(userId)!;
  const isLocked = freshUser.membership_status !== "active";
  const membershipStatus = freshUser.membership_status;

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
