import { NextResponse } from "next/server";
import { staff } from "@/server/db/inMemoryDb";
import { getAdminBranchId } from "@/server/branch";

export async function GET() {
  const branchId = getAdminBranchId();
  const list = staff.listByBranch(branchId);
  return NextResponse.json({ ok: true, staff: list });
}

export async function POST(req: Request) {
  const branchId = getAdminBranchId();
  const body = await req.json();
  const s = staff.create({ ...body, branch_id: branchId });
  return NextResponse.json({ ok: true, staff: s });
}
