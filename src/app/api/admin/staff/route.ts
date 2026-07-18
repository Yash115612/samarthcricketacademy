import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminBranchId } from "@/server/branch";

export async function GET() {
  const branchId = getAdminBranchId();
  const supabase: any = createAdminClient();
  const { data: staffList, error } = await supabase
    .from("users")
    .select("*")
    .eq("branch_id", branchId)
    .eq("role", "staff");
  
  if (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch staff" }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true, staff: staffList || [] });
}

export async function POST(req: Request) {
  try {
    const branchId = getAdminBranchId();
    const supabase: any = createAdminClient();
    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      role: staffRole,
      experience,
      permissions,
    } = body;

    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    const normalizedName = String(name ?? "").trim();
    const normalizedPhone = String(phone ?? "").trim();
    const normalizedStaffRole = String(staffRole ?? "").trim();
    const normalizedExperience = String(experience ?? "").trim();
    const normalizedPassword = String(password ?? "");

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedPassword ||
      !normalizedPhone ||
      !normalizedStaffRole ||
      !normalizedExperience
    ) {
      console.error("Staff create validation failed", {
        hasName: !!normalizedName,
        hasEmail: !!normalizedEmail,
        hasPassword: !!normalizedPassword,
        hasPhone: !!normalizedPhone,
        hasStaffRole: !!normalizedStaffRole,
        hasExperience: !!normalizedExperience,
      });
      return NextResponse.json(
        {
          ok: false,
          error: "MISSING_FIELDS",
          message: "Name, role, email, phone, experience, and password are required.",
        },
        { status: 400 }
      );
    }

    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingUserError) {
      console.error("Error checking existing staff email:", existingUserError);
      return NextResponse.json(
        { ok: false, error: "EMAIL_CHECK_FAILED", message: existingUserError.message },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { ok: false, error: "EMAIL_EXISTS", message: "This email is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(normalizedPassword, 12);

    const nextPermissions = {
      manageFees: !!permissions?.manageFees,
      manageClients: !!permissions?.manageClients,
      manageAttendance: !!permissions?.manageAttendance,
      manageMatches: !!permissions?.manageMatches,
      manageEnquiries: !!permissions?.manageEnquiries,
      staffRole: normalizedStaffRole,
    };

    const { data: newStaff, error: insertError } = await supabase
      .from("users")
      .insert({
        id: crypto.randomUUID(),
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        role: "staff",
        branch_id: branchId,
        password_hash: passwordHash,
        permissions: nextPermissions,
        experience: normalizedExperience,
        is_profile_complete: true,
        membership_status: "active",
        failed_attempts: 0,
        lockout_until: null,
        google_id: null,
      })
      .select()
      .single();

    if (insertError || !newStaff) {
      console.error("Error creating staff:", insertError, {
        branchId,
        email: normalizedEmail,
        role: normalizedStaffRole,
      });
      return NextResponse.json(
        {
          ok: false,
          error: "CREATE_STAFF_FAILED",
          message: insertError?.message ?? "Failed to create staff.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, staff: newStaff }, { status: 201 });
  } catch (error: any) {
    console.error("Unhandled staff create error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "FAILED",
        message: error?.message ?? "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}
