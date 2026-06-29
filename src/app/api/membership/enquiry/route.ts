import { NextResponse } from "next/server";
import { enquiries } from "@/server/db/inMemoryDb";
import type { BranchId } from "@/types/dashboard";

const isValidBranch = (b: string): b is BranchId => b === "samarth" || b === "aims";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    phone?: string;
    email?: string;
    branch_id?: string;
    message?: string;
    type?: string;
  } | null;

  if (!body) return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });

  const { name, phone, email, branch_id, message, type } = body;

  if (!name || !phone || !branch_id || !type) {
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
  }

  if (!isValidBranch(branch_id)) {
    return NextResponse.json({ ok: false, error: "INVALID_BRANCH" }, { status: 400 });
  }

  if (type !== "personal_training" && type !== "admission" && type !== "contact") {
    return NextResponse.json({ ok: false, error: "INVALID_TYPE" }, { status: 400 });
  }

  const enquiry = enquiries.create({
    name,
    phone,
    email,
    branch_id: branch_id as BranchId,
    message: message || "",
    type: type as any,
  });

  return NextResponse.json({ ok: true, id: enquiry.id }, { status: 201 });
}
