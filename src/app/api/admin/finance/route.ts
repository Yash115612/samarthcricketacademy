import { NextResponse } from "next/server";
import { transactions } from "@/server/db/inMemoryDb";
import { getAdminBranchId } from "@/server/branch";

export async function GET() {
  const branchId = getAdminBranchId();
  const list = transactions.listByBranch(branchId);
  return NextResponse.json({ ok: true, transactions: list });
}

export async function POST(req: Request) {
  const branchId = getAdminBranchId();
  const body = await req.json();
  const t = transactions.create({ ...body, branch_id: branchId });
  return NextResponse.json({ ok: true, transaction: t });
}
