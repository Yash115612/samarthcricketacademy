import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { paymentVerifications } from "@/server/db/inMemoryDb";
import { getAdminBranchId } from "@/server/branch";
import type { BranchId } from "@/types/dashboard";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branch") as BranchId | "all" | null;
  
  // If no branch specified, default to "all" to ensure admin sees everything
  const list = paymentVerifications.list(branchId || "all");
  return NextResponse.json({ ok: true, payments: list });
}
