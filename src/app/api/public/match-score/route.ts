import { NextResponse } from "next/server";
import { scoringSessions, ballsDb } from "@/server/db/inMemoryDb";
import { computeScorecard } from "@/lib/cricket";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ ok: false, error: "matchId required" }, { status: 400 });

  const session = scoringSessions.getByMatchId(matchId);
  if (!session) return NextResponse.json({ ok: true, has_scoring: false, scorecard: null });

  const balls = ballsDb.listByMatch(matchId, session.innings);
  const scorecard = computeScorecard(session, balls);

  return NextResponse.json(
    { ok: true, has_scoring: true, scorecard },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
}
