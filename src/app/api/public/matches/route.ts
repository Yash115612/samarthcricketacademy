import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branch") as any;
  
  const { data: matches, error } = await adminClient
    .from("matches")
    .select("*")
    .eq("branch_id", branchId);
  
  if (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true, matches });
}
