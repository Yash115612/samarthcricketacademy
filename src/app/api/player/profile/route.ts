import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { users } from "@/server/db/inMemoryDb";

const isValidBranch = (branchId: unknown): branchId is "samarth" | "aims" => branchId === "samarth" || branchId === "aims";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.user_id;
  if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const user = users.getById(userId);
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
      isProfileComplete: user.isProfileComplete,
    },
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.user_id;
  if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const user = users.getById(userId);
  if (!user) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { name?: unknown; phone?: unknown; experience?: unknown; branch_id?: unknown; complete?: unknown }
    | null;

  if (!body) return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });

  const patch: { name?: string; phone?: string; experience?: string | null; branch_id?: "samarth" | "aims" | null; isProfileComplete?: boolean } = {};

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
    if (user.branch_id && user.branch_id !== body.branch_id) return NextResponse.json({ ok: false, error: "BRANCH_LOCKED" }, { status: 403 });
    patch.branch_id = body.branch_id;
  }

  if (body.complete === true) patch.isProfileComplete = true;

  const updated = users.updateProfile(userId, patch);
  if (!updated) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  return NextResponse.json({
    ok: true,
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      branch_id: updated.branch_id,
      role: updated.role,
      experience: updated.experience,
      isProfileComplete: updated.isProfileComplete,
    },
  });
}

