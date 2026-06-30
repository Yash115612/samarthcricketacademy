import { NextResponse } from "next/server";
import { getAdminBranchId } from "@/server/branch";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET() {
  const branchId = getAdminBranchId();
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
  const branchId = getAdminBranchId();
  const body = await req.json();
  const { name, email, password, phone, role: staffRole, experience, permissions, status } = body;
  
  if (!email || !password || !name) {
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
  }
  
  // Check if email already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  
  if (existingUser) {
    return NextResponse.json({ ok: false, error: "EMAIL_EXISTS", message: "This email is already registered." }, { status: 409 });
  }
  
  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const newId = crypto.randomUUID();
  
  // Insert into users table
  const { data: newStaff, error: insertError } = await supabase
    .from("users")
    .insert({
      id: newId,
      name,
      email,
      phone,
      role: "staff",
      branch_id: branchId,
      password_hash: passwordHash,
      permissions,
      experience,
      status: status || "Active",
      is_profile_complete: true,
      membership_status: "active"
    })
    .select()
    .single();
  
  if (insertError) {
    console.error("Error creating staff:", insertError);
    return NextResponse.json({ ok: false, error: "Failed to create staff" }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true, staff: newStaff });
}
