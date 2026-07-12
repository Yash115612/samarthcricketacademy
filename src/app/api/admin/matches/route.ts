import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getAdminBranchId } from "@/server/branch";

const supabase: any = adminClient;

export async function GET() {
  const branchId = getAdminBranchId();
  const { data: list, error } = await supabase
    .from("matches")
    .select("*")
    .eq("branch_id", branchId);

  if (error) {
    return NextResponse.json({ ok: false, error: "DB_ERROR", message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, matches: list });
}

export async function POST(req: Request) {
  const branchId = getAdminBranchId();
  const body = await req.json();
  const { data: m, error } = await supabase
    .from("matches")
    .insert({ ...body, branch_id: branchId })
    .select()
    .single();

  if (error || !m) {
    return NextResponse.json({ ok: false, error: "FAILED", message: error?.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, match: m });
}

export async function PATCH(req: Request) {
  const { id, ...patch } = await req.json();
  const { data: m, error } = await supabase
    .from("matches")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error || !m) return NextResponse.json({ ok: false, error: "Match not found" }, { status: 404 });
  return NextResponse.json({ ok: true, match: m });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Match ID required" }, { status: 400 });

  const { data: deleted, error } = await supabase
    .from("matches")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error || !deleted) return NextResponse.json({ ok: false, error: "Match not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
