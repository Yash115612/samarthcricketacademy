import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { adminClient } from "@/lib/supabase";
import { getAdminBranchId } from "@/server/branch";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const branchId = getAdminBranchId();
  const { data: list, error } = await adminClient
    .from("enquiries")
    .select("*")
    .eq("branch_id", branchId)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching enquiries:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true, enquiries: list });
}
