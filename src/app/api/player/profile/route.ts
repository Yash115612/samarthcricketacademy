import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const isValidBranch = (branchId: unknown): branchId is "samarth" | "aims" => branchId === "samarth" || branchId === "aims";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.user_id;
  if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Supabase GET profile error:", error);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
  if (!user) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      branch_id: user.branch_id,
      role: user.role,
      experience: user.experience,
      isProfileComplete: user.is_profile_complete,
    },
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.user_id;
  if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const { data: existingUser, error: fetchErr } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (fetchErr) {
    console.error("Supabase fetch user error:", fetchErr);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
  if (!existingUser) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { name?: unknown; phone?: unknown; experience?: unknown; branch_id?: unknown; complete?: unknown }
    | null;

  if (!body) return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });

  const patch: { name?: string; phone?: string; experience?: string | null; branch_id?: "samarth" | "aims" | null; is_profile_complete?: boolean } = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ ok: false, error: "NAME_REQUIRED" }, { status: 400 });
    patch.name = name;
  }

  if (typeof body.phone === "string") {
    const phone = body.phone.trim();
    if (!phone) return NextResponse.json({ ok: false, error: "PHONE_REQUIRED" }, { status: 400 });
    patch.phone = phone;
  }

  if (typeof body.experience === "string") {
    const exp = body.experience.trim();
    patch.experience = exp ? exp : null;
  }

  if (body.branch_id !== undefined) {
    if (!isValidBranch(body.branch_id)) return NextResponse.json({ ok: false, error: "BRANCH_INVALID" }, { status: 400 });
    if (existingUser.branch_id && existingUser.branch_id !== body.branch_id) return NextResponse.json({ ok: false, error: "BRANCH_LOCKED" }, { status: 403 });
    patch.branch_id = body.branch_id;
  }

  if (body.complete === true) patch.is_profile_complete = true;

  const { data: updatedUser, error: updateErr } = await supabase
    .from("users")
    .update(patch)
    .eq("id", userId)
    .select()
    .single();

  if (updateErr) {
    console.error("Supabase update profile error:", updateErr);
    return NextResponse.json({ ok: false, error: "UPDATE_FAILED" }, { status: 500 });
  }
  if (!updatedUser) {
    console.error("Supabase update returned no data");
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      branch_id: updatedUser.branch_id,
      role: updatedUser.role,
      experience: updatedUser.experience,
      isProfileComplete: updatedUser.is_profile_complete,
    },
  });
}

