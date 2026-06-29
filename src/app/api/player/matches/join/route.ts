import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { matchParticipants, matches, memberships, payments, users } from "@/server/db/inMemoryDb";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.user_id;
  const role = session?.user?.role;
  const branch_id = session?.user?.branch_id;

  if (!userId || role !== "player" || !branch_id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const user = users.getById(userId);
  if (!user || user.role !== "player" || user.branch_id !== branch_id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { match_id?: unknown } | null;
  const match_id = typeof body?.match_id === "string" ? body.match_id : "";
  if (!match_id) return NextResponse.json({ ok: false, error: "MATCH_ID_REQUIRED" }, { status: 400 });

  const match = matches.getById(match_id);
  if (!match || match.branch_id !== branch_id) return NextResponse.json({ ok: false, error: "MATCH_NOT_FOUND" }, { status: 404 });
  if (match.status !== "Upcoming") return NextResponse.json({ ok: false, error: "MATCH_NOT_JOINABLE" }, { status: 409 });

  const memRaw = memberships.getForUserBranch(userId, branch_id);
  const membership = memRaw ? memberships.normalizeStatus(memRaw) : null;
  if (!membership || membership.status !== "Active") return NextResponse.json({ ok: false, error: "MEMBERSHIP_INACTIVE" }, { status: 403 });

  const existing = matchParticipants.get(match_id, userId);
  if (existing) {
    return NextResponse.json({ ok: true, status: "ALREADY_JOINED" });
  }

  if (match.fee > 0) payments.simulate({ user_id: userId, branch_id, match_id, amount: match.fee });
  matchParticipants.addConfirmed(match_id, userId, branch_id);

  return NextResponse.json({ ok: true, status: "JOINED" });
}

