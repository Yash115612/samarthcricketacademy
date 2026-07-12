import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getAdminBranchId } from "@/server/branch";

const supabase: any = adminClient;

export async function GET() {
  try {
    const branchId = getAdminBranchId();
    const { data: list, error } = await supabase
      .from("notices")
      .select("*")
      .eq("branch_id", branchId)
      .order("date", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, notices: list });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch notices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const branchId = getAdminBranchId();
    const body = await req.json();
    const { data: n, error } = await supabase
      .from("notices")
      .insert({ ...body, branch_id: branchId })
      .select()
      .single();

    if (error || !n) throw error;
    return NextResponse.json({ ok: true, notice: n });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to create notice" }, { status: 500 });
  }
}
