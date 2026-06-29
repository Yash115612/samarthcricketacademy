import { NextResponse } from "next/server";
import { performance } from "@/server/db/inMemoryDb";
import { getAdminBranchId } from "@/server/branch";

export async function GET(req: Request) {
  try {
    const branchId = getAdminBranchId();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (userId) {
      const list = performance.listByUserBranch(userId, branchId);
      return NextResponse.json({ ok: true, records: list });
    }
    
    // List all for branch if no userId
    const all = performance.listByBranch(branchId);
    return NextResponse.json({ ok: true, records: all });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const branchId = getAdminBranchId();
    const body = await req.json();
    const p = performance.create({ ...body, branch_id: branchId });
    return NextResponse.json({ ok: true, record: p });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to create record" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...patch } = body;
    const p = performance.update(id, patch);
    if (!p) return NextResponse.json({ ok: false, error: "Record not found" }, { status: 404 });
    return NextResponse.json({ ok: true, record: p });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to update record" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "ID required" }, { status: 400 });
    const ok = performance.delete(id);
    return NextResponse.json({ ok: ok });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to delete record" }, { status: 500 });
  }
}
