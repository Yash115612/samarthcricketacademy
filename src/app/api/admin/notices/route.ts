import { NextResponse } from "next/server";
import { notices } from "@/server/db/inMemoryDb";
import { getAdminBranchId } from "@/server/branch";

export async function GET() {
  try {
    const branchId = getAdminBranchId();
    const list = notices.listByBranchLatestFirst(branchId);
    return NextResponse.json({ ok: true, notices: list });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch notices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const branchId = getAdminBranchId();
    const body = await req.json();
    const n = notices.create({ ...body, branch_id: branchId });
    return NextResponse.json({ ok: true, notice: n });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to create notice" }, { status: 500 });
  }
}
