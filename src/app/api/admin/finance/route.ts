import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getAdminBranchId } from "@/server/branch";
import { genId } from "@/lib/utils";

export async function GET() {
  const branchId = getAdminBranchId();
  const { data: list, error } = await adminClient
    .from("transactions")
    .select("*")
    .eq("branch_id", branchId);
  
  if (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true, transactions: list });
}

export async function POST(req: Request) {
  const branchId = getAdminBranchId();
  const body = await req.json();
  const { data: t, error } = await adminClient
    .from("transactions")
    .insert({ 
      id: genId("tx"), 
      ...body, 
      branch_id: branchId 
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true, transaction: t });
}
