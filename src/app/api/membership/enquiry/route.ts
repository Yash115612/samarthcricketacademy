import { NextResponse } from "next/server";
import { enquiries } from "@/server/db/inMemoryDb";
import type { BranchId } from "@/types/dashboard";

const isValidBranch = (b: string): b is BranchId => b === "samarth" || b === "aims";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    date_of_birth?: string;
    gender?: string;
    phone?: string;
    parent_name?: string;
    parent_phone?: string;
    email?: string;
    address?: string;
    school_name?: string;
    class_standard?: string;
    board?: string;
    playing_role?: string;
    batting_style?: string;
    bowling_style?: string;
    previous_experience?: string;
    previous_experience_details?: string;
    branch_id?: string;
    preferred_batch_timing?: string;
    how_hear_about_us?: string;
    medical_conditions?: string;
    medical_conditions_details?: string;
    privacy_policy_accepted?: boolean;
    message?: string;
    type?: string;
  } | null;

  if (!body) return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });

  const {
    name, date_of_birth, gender, phone, parent_name, parent_phone, email, address,
    school_name, class_standard, board, playing_role, batting_style, bowling_style,
    previous_experience, previous_experience_details, branch_id, preferred_batch_timing,
    how_hear_about_us, medical_conditions, medical_conditions_details, privacy_policy_accepted,
    message, type
  } = body;

  if (!name || !phone || !branch_id || !type || privacy_policy_accepted !== true) {
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
    date_of_birth,
    gender,
    phone,
    parent_name,
    parent_phone,
    email,
    address,
    school_name,
    class_standard,
    board,
    playing_role,
    batting_style,
    bowling_style,
    previous_experience,
    previous_experience_details,
    branch_id: branch_id as BranchId,
    preferred_batch_timing,
    how_hear_about_us,
    medical_conditions,
    medical_conditions_details,
    privacy_policy_accepted,
    message: message || "",
    type: type as any,
  });

  return NextResponse.json({ ok: true, id: enquiry.id }, { status: 201 });
}
