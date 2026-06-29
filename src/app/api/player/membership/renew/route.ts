import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { memberships, users } from "@/server/db/inMemoryDb";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.user_id;
  const role = session?.user?.role;
  const branch_id = session?.user?.branch_id;

  if (!userId || role !== "player" || !branch_id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const user = users.getById(userId);
  if (!user || user.role !== "player" || user.branch_id !== branch_id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { plan_name?: unknown } | null;
  const planName = typeof body?.plan_name === "string" && body.plan_name.trim() ? body.plan_name.trim() : "2 Months Plan";

  const updated = memberships.renew(userId, branch_id, planName);

  return NextResponse.json({
    ok: true,
    membership: {
      plan_name: updated.plan_name,
      start_date: updated.start_date,
      expiry_date: updated.expiry_date,
      status: updated.status,
      expiring_soon: memberships.isExpiringSoon(updated),
    },
  });
}

