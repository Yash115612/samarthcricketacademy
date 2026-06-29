import { NextResponse } from "next/server";
import { users, memberships } from "@/server/db/inMemoryDb";
import { getAdminBranchId } from "@/server/branch";

export async function GET() {
  const branchId = getAdminBranchId();
  const players = users.listByBranch(branchId);
  return NextResponse.json({ ok: true, users: players });
}

export async function POST(req: Request) {
  const branchId = getAdminBranchId();
  const body = await req.json();
  const { name, email, phone, password, plan_name } = body;

  if (!email || !password || !name) {
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
  }

  if (phone && users.getByPhone(phone)) {
    return NextResponse.json({ ok: false, error: "PHONE_EXISTS", message: "This phone number is already registered." }, { status: 409 });
  }

  const result = users.createPlayer({
    email,
    password,
    branch_id: branchId,
    name
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  // Update phone if provided
  if (phone) {
    users.updateProfile(result.user.id, { phone });
  }

  // Assign membership plan if provided
  if (plan_name && plan_name !== "none") {
    memberships.renew(result.user.id, branchId, plan_name);
    // updateProfile will be called inside memberships.renew via normalizeStatus or similar logic usually,
    // but in this inMemoryDb.ts renew doesn't automatically update user.membership_status to 'active' 
    // unless normalizeStatus is called. Actually renew just pushes to db.memberships.
    // Let's ensure user status is updated.
    users.updateProfile(result.user.id, { membership_status: "active" });
  }

  return NextResponse.json({ ok: true, user: result.user });
}
