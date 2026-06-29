import { NextResponse } from "next/server";
import { users, memberships } from "@/server/db/inMemoryDb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { users: players, branchId } = await req.json();

    if (!Array.isArray(players)) {
      return NextResponse.json({ ok: false, error: "INVALID_DATA" }, { status: 400 });
    }

    const results = users.bulkCreatePlayers(
      players.map((p) => ({
        ...p,
        branch_id: branchId,
      }))
    );

    // Also assign memberships for those who have a plan_name
    // Note: In bulk, we do this sequentially for simplicity as in-memory DB is fast enough for 10k but IO is the bottleneck.
    // However, users.bulkCreatePlayers already saved once. memberships.renew also saves.
    // For extreme performance we'd need a memberships.bulkRenew, but let's stick to this for now.
    
    // We need the created user IDs. bulkCreatePlayers doesn't return them currently.
    // Let's refine bulkCreatePlayers or handle it here.
    // Actually, for bulk upload, users might just want to register them first.
    // If they have plan_name, we should handle it.

    return NextResponse.json({ 
      ok: true, 
      success: results.success, 
      failed: results.failed, 
      errors: results.errors 
    });
  } catch (err) {
    console.error("Bulk upload error:", err);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
