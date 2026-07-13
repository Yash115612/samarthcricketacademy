import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { adminClient } from "@/lib/supabase";
import { getAdminBranchId } from "@/server/branch";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const branchId = getAdminBranchId();
  const { data: s, error } = await adminClient
    .from("branch_settings")
    .select("*")
    .eq("branch_id", branchId)
    .single();
  
  if (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true, settings: s });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const branchId = getAdminBranchId();
  const body = (await req.json().catch(() => null)) as {
    total_pt_slots?: number;
    used_pt_slots?: number;
    payment_qr_url?: string;
    payment_upi_id?: string;
    payment_instructions?: string[];
  } | null;

  if (!body) return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });

  const { data: updated, error } = await adminClient
    .from("branch_settings")
    .update(body)
    .eq("branch_id", branchId)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true, settings: updated });
}
