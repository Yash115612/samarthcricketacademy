import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
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

  const { data: user } = await adminClient
    .from("users")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (!user) return NextResponse.json({ status: "invalid" });

  const { data: membership } = await adminClient
    .from("memberships")
    .select("*")
    .eq("user_id", user.id)
    .eq("branch_id", branch_id)
    .maybeSingle();

  if (!membership) return NextResponse.json({ status: "no_membership" });

  // TODO: normalize status based on expiry date
  if (membership.status === "Active") return NextResponse.json({ status: "active" });
  if (membership.status === "Pending") return NextResponse.json({ status: "pending" });
  return NextResponse.json({ status: "expired" });
}
