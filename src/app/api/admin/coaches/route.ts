import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getAdminBranchId } from "@/server/branch";

const supabase: any = adminClient;

export async function GET() {
  const branchId = getAdminBranchId();
  // We use the 'staff' table but filter for coaches if needed,
  // or just use staff if 'Coach' is a role within staff.
  const { data: list, error } = await supabase
    .from("staff")
    .select("*")
    .eq("branch_id", branchId)
    .ilike("role", "%coach%");

  if (error) {
    return NextResponse.json({ ok: false, error: "DB_ERROR", message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, coaches: list });
}

export async function POST(req: Request) {
  const branchId = getAdminBranchId();
  const body = await req.json();
  const { data: s, error } = await supabase
    .from("staff")
    .insert({ ...body, branch_id: branchId })
    .select()
    .single();

  if (error || !s) {
    return NextResponse.json({ ok: false, error: "FAILED", message: error?.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, coach: s });
}
