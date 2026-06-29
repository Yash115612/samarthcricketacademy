import { NextResponse } from "next/server";
import { shop } from "@/server/db/inMemoryDb";
import { getAdminBranchId } from "@/server/branch";

export async function GET() {
  try {
    const branchId = getAdminBranchId();
    const list = shop.listByBranch(branchId);
    return NextResponse.json({ ok: true, products: list });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const branchId = getAdminBranchId();
    const body = await req.json();
    const p = shop.create({ ...body, branch_id: branchId });
    return NextResponse.json({ ok: true, product: p });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to create product" }, { status: 500 });
  }
}
