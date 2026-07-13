import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { computeScorecard } from "@/lib/cricket";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ ok: false, error: "matchId required" }, { status: 400 });

  const { data: session } = await adminClient
    .from("scoring_sessions")
    .select("*")
    .eq("match_id", matchId)
    .maybeSingle();

  if (!session) return NextResponse.json({ ok: true, has_scoring: false, scorecard: null });

  const { data: balls } = await adminClient
    .from("balls")
    .select("*")
    .eq("match_id", matchId)
    .eq("innings", session.innings);

  const scorecard = computeScorecard(session, balls || []);

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
