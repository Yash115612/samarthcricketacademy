import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminBranchId } from "@/server/branch";

export async function GET() {
  const branchId = getAdminBranchId();
  const supabase: any = createAdminClient();

  const { data: players, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "player")
    .eq("branch_id", branchId);

  if (error) {
    return NextResponse.json({ ok: false, error: "DB_ERROR", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, users: players });
}

export async function POST(req: Request) {
  const branchId = getAdminBranchId();
  const supabase: any = createAdminClient();
  const body = await req.json();
  const { name, email, phone, password, plan_name } = body;

  if (!email || !password || !name) {
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
  }

  if (phone) {
    const { data: existingPhone } = await supabase
      .from("users")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existingPhone) {
      return NextResponse.json({ ok: false, error: "PHONE_EXISTS", message: "This phone number is already registered." }, { status: 409 });
    }
  }

  const { data: existingEmail } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (existingEmail) {
    return NextResponse.json({ ok: false, error: "USER_EXISTS" }, { status: 400 });
  }

  const passwordHash = bcrypt.hashSync(password, 12);

  const { data: user, error: insertError } = await supabase
    .from("users")
    .insert({
      email: email.toLowerCase(),
      name,
      phone: phone || "",
      branch_id: branchId,
      role: "player",
      is_profile_complete: false,
      membership_status: "none",
      password_hash: passwordHash,
    })
    .select()
    .single();

  if (insertError || !user) {
    return NextResponse.json({ ok: false, error: "FAILED", message: insertError?.message }, { status: 400 });
  }

  if (plan_name && plan_name !== "none") {
    const planType = plan_name === "Personal Training" ? "pt" : "monthly";
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + (planType === "monthly" ? 60 : 30));

    await supabase.from("memberships").insert({
      user_id: user.id,
      plan: plan_name,
      plan_type: planType,
      start_date: startDate.toISOString().slice(0, 10),
      expiry_date: expiryDate.toISOString().slice(0, 10),
      status: "Active",
    });

    await supabase.from("users").update({ membership_status: "active" }).eq("id", user.id);
    user.membership_status = "active";
  }

  return NextResponse.json({ ok: true, user });
}
