import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { enquiries } from "@/server/db/inMemoryDb";
import { getAdminBranchId } from "@/server/branch";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const branchId = getAdminBranchId();
  const list = enquiries.list(branchId);
  return NextResponse.json({ ok: true, enquiries: list });
}
