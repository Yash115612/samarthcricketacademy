import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getIP } from "@/server/security/rateLimiter";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().regex(/^[0-9+\-\s()]{10,20}$/, "Invalid phone number format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  branch_id: z.enum(["samarth", "aims"]),
});

export async function POST(req: Request) {
  const ip = getIP(req);
  if (!rateLimit(`signup_${ip}`, 5, 60 * 60 * 1000)) { // 5 signups per hour per IP
    return NextResponse.json({ ok: false, error: "TOO_MANY_REQUESTS", message: "Too many signup attempts. Please try again later." }, { status: 429 });
  }

  const body = (await req.json().catch(() => null));
  if (!body) return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });

  const result = registerSchema.safeParse(body);
  if (!result.success) {
    const error = result.error.issues[0]?.message || "Invalid input";
    return NextResponse.json({ ok: false, error: "VALIDATION_ERROR", message: error }, { status: 400 });
  }

  const { name, email, phone, password, branch_id } = result.data;
  const supabase: any = createAdminClient();

  // 1. Check if email or phone already in use
  const { data: existing } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: false, error: "USER_EXISTS", message: "An account already exists for this email address." }, { status: 409 });
  }
  const { data: existingPhone } = await supabase.from("users").select("id").eq("phone", phone).maybeSingle();
  if (existingPhone) {
    return NextResponse.json({ ok: false, error: "PHONE_EXISTS", message: "This phone number is already registered to another account." }, { status: 409 });
  }

  // 2. Create user (membership_status is set to 'none' by default)
  const passwordHash = bcrypt.hashSync(password, 12);
  const { data: created, error } = await supabase
    .from("users")
    .insert({
      email,
      name,
      phone,
      branch_id,
      role: "player",
      is_profile_complete: true,
      membership_status: "none",
      password_hash: passwordHash,
    })
    .select()
    .single();

  if (error || !created) {
    return NextResponse.json({ ok: false, error: "USER_EXISTS", message: "Could not create account." }, { status: 409 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
