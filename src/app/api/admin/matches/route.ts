import { NextResponse } from "next/server";
import { matches } from "@/server/db/inMemoryDb";
import { getAdminBranchId } from "@/server/branch";

export async function GET() {
  const branchId = getAdminBranchId();
  const list = matches.listByBranch(branchId);
  return NextResponse.json({ ok: true, matches: list });
}

export async function POST(req: Request) {
  const branchId = getAdminBranchId();
  const body = await req.json();
  const m = matches.create({ ...body, branch_id: branchId });
  return NextResponse.json({ ok: true, match: m });
}

export async function PATCH(req: Request) {
  const { id, ...patch } = await req.json();
  const m = matches.update(id, patch);
  if (!m) return NextResponse.json({ ok: false, error: "Match not found" }, { status: 404 });
  return NextResponse.json({ ok: true, match: m });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Match ID required" }, { status: 400 });
  const deleted = matches.delete(id);
  if (!deleted) return NextResponse.json({ ok: false, error: "Match not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
