import { NextResponse } from "next/server";
import { memberships, users } from "@/server/db/inMemoryDb";
import { getAdminBranchId } from "@/server/branch";

export async function GET() {
  const branchId = getAdminBranchId();
  const list = memberships.listByBranch(branchId);
  
  // Enrich with user names
  const enriched = list.map(m => {
    const user = users.getById(m.user_id);
    return {
      ...m,
      userName: user?.name || "Unknown User"
    };
  });

  return NextResponse.json({ ok: true, memberships: enriched });
}
