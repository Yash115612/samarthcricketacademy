import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { adminClient } from "@/lib/supabase";
import type { BranchId } from "@/types/dashboard";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branch") as BranchId | "all" | null;
  
  let query = adminClient.from("payment_verifications").select("*");
  
  if (branchId && branchId !== "all") {
    query = query.eq("branch_id", branchId);
  }
  
  const { data: list, error } = await query.order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true, payments: list || [] });
}
