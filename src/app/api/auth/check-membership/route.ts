import { NextResponse } from "next/server";
import { memberships, users } from "@/server/db/inMemoryDb";
import type { BranchId } from "@/types/dashboard";

const isValidBranch = (b: string): b is BranchId => b === "samarth" || b === "aims";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    phone?: string;
    branch_id?: string;
  } | null;

  if (!body) return NextResponse.json({ status: "invalid" });

  const phone = (body.phone ?? "").trim();
  const branch_id = body.branch_id ?? "";

  if (!phone || !isValidBranch(branch_id)) {
    return NextResponse.json({ status: "invalid" });
  }

  const user = users.getByPhone(phone);
  if (!user) return NextResponse.json({ status: "invalid" });

  const membership = memberships.getForUserBranch(user.id, branch_id as BranchId);
  if (!membership) return NextResponse.json({ status: "no_membership" });

  const normalized = memberships.normalizeStatus(membership);

  if (normalized.status === "Active") return NextResponse.json({ status: "active" });
  if (normalized.status === "Pending") return NextResponse.json({ status: "pending" });
  return NextResponse.json({ status: "expired" });
}
