import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getAdminBranchId } from "@/server/branch";

export async function GET() {
  const branchId = getAdminBranchId();
  
  // Get memberships and join with users to get names
  const { data: list, error } = await adminClient
    .from("memberships")
    .select(`
      *,
      users (name)
    `)
    .eq("branch_id", branchId);
  
  if (error) {
    console.error("Error fetching memberships:", error);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
  
  // Enrich with user names
  const enriched = (list || []).map((m: any) => ({
    ...m,
    userName: m.users?.name || "Unknown User"
  }));

  return NextResponse.json({ ok: true, memberships: enriched });
}
