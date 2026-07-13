import "server-only";
import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { computeScorecard } from "@/lib/cricket";
import { genId } from "@/lib/utils";
import type { WicketType } from "@/server/db/inMemoryDb";

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ ok: false, error: "matchId required" }, { status: 400 });

  const { data: session } = await adminClient
    .from("scoring_sessions")
    .select("*")
    .eq("match_id", matchId)
    .maybeSingle();

  if (!session) return NextResponse.json({ ok: true, session: null, scorecard: null });

  const { data: balls } = await adminClient
    .from("balls")
    .select("*")
    .eq("match_id", matchId)
    .eq("innings", session.innings);

  const scorecard = computeScorecard(session, balls || []);
  return NextResponse.json({ ok: true, session, scorecard });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.json();
  const { action, matchId } = body;

  if (!matchId) return NextResponse.json({ ok: false, error: "matchId required" }, { status: 400 });

  // ── start ──────────────────────────────────────────────────────────────────
  if (action === "start") {
    const {
      batting_team, bowling_team, total_overs, batting_lineup,
      striker, non_striker, current_bowler, innings = 1, target, branch_id,
    } = body;

    const { data: session, error } = await adminClient
      .from("scoring_sessions")
      .insert({
        id: genId("score"),
        match_id: matchId,
        branch_id: branch_id || "samarth",
        innings,
        batting_team,
        bowling_team,
        total_overs: Number(total_overs) || 20,
        target: target ? Number(target) : null,
        batting_lineup: batting_lineup || [striker, non_striker],
        striker,
        non_striker,
        current_bowler,
        previous_bowler: null,
        awaiting_new_bowler: false,
        awaiting_new_batsman: false,
        over_completed_on_wicket: false,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error starting scoring session:", error);
      return NextResponse.json({ ok: false, error: "Failed to start session" }, { status: 500 });
    }

    const scorecard = computeScorecard(session, []);
    return NextResponse.json({ ok: true, session, scorecard });
  }

  // ── ball ───────────────────────────────────────────────────────────────────
  if (action === "ball") {
    const { data: session, error: sessionError } = await adminClient
      .from("scoring_sessions")
      .select("*")
      .eq("match_id", matchId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ ok: false, error: "No session" }, { status: 404 });
    }

    if (session.awaiting_new_bowler || session.awaiting_new_batsman) {
      return NextResponse.json({ ok: false, error: "Awaiting input before next ball" }, { status: 400 });
    }

    const { data: existingBalls } = await adminClient
      .from("balls")
      .select("*")
      .eq("match_id", matchId)
      .eq("innings", session.innings);

    const legalBalls = (existingBalls || []).filter((b) => !b.wide && !b.no_ball).length;
    const currentOver = Math.floor(legalBalls / 6);

    const { runs = 0, wide = false, no_ball = false, bye = 0, leg_bye = 0, wicket } = body;

    await adminClient
      .from("balls")
      .insert({
        id: genId("ball"),
        match_id: matchId,
        innings: session.innings,
        over: currentOver,
        batsman: session.striker,
        non_striker: session.non_striker,
        bowler: session.current_bowler,
        runs: Number(runs),
        wide: Boolean(wide),
        no_ball: Boolean(no_ball),
        bye: Number(bye),
        leg_bye: Number(leg_bye),
        wicket: wicket
          ? { type: wicket.type as WicketType, batsman: session.striker, fielder: wicket.fielder }
          : null,
        timestamp: new Date().toISOString(),
      });

    const isLegal = !wide && !no_ball;
    const newLegalBalls = isLegal ? legalBalls + 1 : legalBalls;
    const overComplete = isLegal && newLegalBalls % 6 === 0;

    // Strike rotation
    let { striker, non_striker } = session;
    if (!wicket && !wide) {
      if (Number(runs) % 2 === 1) [striker, non_striker] = [non_striker, striker];
    }
    if (overComplete && !wicket) {
      [striker, non_striker] = [non_striker, striker];
    }

    const patch: any = {
      striker,
      non_striker,
      awaiting_new_bowler: overComplete && !wicket,
      awaiting_new_batsman: !!wicket,
      over_completed_on_wicket: overComplete && !!wicket,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedSession } = await adminClient
      .from("scoring_sessions")
      .update(patch)
      .eq("id", session.id)
      .select()
      .single();

    const { data: allBalls } = await adminClient
      .from("balls")
      .select("*")
      .eq("match_id", matchId)
      .eq("innings", updatedSession.innings);

    const scorecard = computeScorecard(updatedSession, allBalls || []);
    return NextResponse.json({ ok: true, session: updatedSession, scorecard });
  }

  // ── new_bowler ─────────────────────────────────────────────────────────────
  if (action === "new_bowler") {
    const { data: session, error: sessionError } = await adminClient
      .from("scoring_sessions")
      .select("*")
      .eq("match_id", matchId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ ok: false, error: "No session" }, { status: 404 });
    }

    const { data: updatedSession } = await adminClient
      .from("scoring_sessions")
      .update({
        current_bowler: body.bowler,
        previous_bowler: session.current_bowler,
        awaiting_new_bowler: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .select()
      .single();

    const { data: allBalls } = await adminClient
      .from("balls")
      .select("*")
      .eq("match_id", matchId)
      .eq("innings", updatedSession.innings);

    const scorecard = computeScorecard(updatedSession, allBalls || []);
    return NextResponse.json({ ok: true, session: updatedSession, scorecard });
  }

  // ── new_batsman ────────────────────────────────────────────────────────────
  if (action === "new_batsman") {
    const { data: session, error: sessionError } = await adminClient
      .from("scoring_sessions")
      .select("*")
      .eq("match_id", matchId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ ok: false, error: "No session" }, { status: 404 });
    }

    const { batsman, is_striker } = body;
    const lineup = session.batting_lineup.includes(batsman)
      ? session.batting_lineup
      : [...session.batting_lineup, batsman];

    // The surviving batsman is always the non_striker (striker was dismissed)
    const survivingBatsman = session.non_striker;
    const wasOverComplete = session.over_completed_on_wicket;

    let striker: string;
    let non_striker: string;

    if (wasOverComplete) {
      // Over ended on same ball as wicket: surviving non-striker moves to striker end naturally
      striker = survivingBatsman;
      non_striker = batsman;
    } else {
      // Regular mid-over wicket: admin chooses who faces next ball
      if (is_striker) {
        striker = batsman;
        non_striker = survivingBatsman;
      } else {
        striker = survivingBatsman;
        non_striker = batsman;
      }
    }

    const { data: updatedSession } = await adminClient
      .from("scoring_sessions")
      .update({
        batting_lineup: lineup,
        striker,
        non_striker,
        awaiting_new_batsman: false,
        awaiting_new_bowler: wasOverComplete,
        over_completed_on_wicket: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .select()
      .single();

    const { data: allBalls } = await adminClient
      .from("balls")
      .select("*")
      .eq("match_id", matchId)
      .eq("innings", updatedSession.innings);

    const scorecard = computeScorecard(updatedSession, allBalls || []);
    return NextResponse.json({ ok: true, session: updatedSession, scorecard });
  }

  // ── swap_striker ───────────────────────────────────────────────────────────
  if (action === "swap_striker") {
    const { data: session, error: sessionError } = await adminClient
      .from("scoring_sessions")
      .select("*")
      .eq("match_id", matchId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ ok: false, error: "No session" }, { status: 404 });
    }

    const { data: updatedSession } = await adminClient
      .from("scoring_sessions")
      .update({
        striker: session.non_striker,
        non_striker: session.striker,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .select()
      .single();

    const { data: allBalls } = await adminClient
      .from("balls")
      .select("*")
      .eq("match_id", matchId)
      .eq("innings", updatedSession.innings);

    const scorecard = computeScorecard(updatedSession, allBalls || []);
    return NextResponse.json({ ok: true, session: updatedSession, scorecard });
  }

  // ── undo ───────────────────────────────────────────────────────────────────
  if (action === "undo") {
    const { data: session, error: sessionError } = await adminClient
      .from("scoring_sessions")
      .select("*")
      .eq("match_id", matchId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ ok: false, error: "No session" }, { status: 404 });
    }

    // Get last ball
    const { data: balls } = await adminClient
      .from("balls")
      .select("*")
      .eq("match_id", matchId)
      .eq("innings", session.innings)
      .order("timestamp", { ascending: false })
      .limit(1);

    if (!balls || balls.length === 0) {
      return NextResponse.json({ ok: false, error: "Nothing to undo" }, { status: 400 });
    }

    const lastBall = balls[0];

    // Delete last ball
    await adminClient
      .from("balls")
      .delete()
      .eq("id", lastBall.id);

    // Get remaining balls
    const { data: remainingBalls } = await adminClient
      .from("balls")
      .select("*")
      .eq("match_id", matchId)
      .eq("innings", session.innings)
      .order("timestamp", { ascending: true });

    // Restore striker/non-striker from last remaining ball
    const newStriker = remainingBalls?.[remainingBalls.length - 1]?.batsman || session.batting_lineup[0];
    const newNonStriker = remainingBalls?.[remainingBalls.length - 1]?.non_striker || session.batting_lineup[1];

    // Recalculate if over completed
    const legalBallsCount = (remainingBalls || []).filter((b) => !b.wide && !b.no_ball).length;
    const overComplete = legalBallsCount > 0 && legalBallsCount % 6 === 0;

    let finalStriker = newStriker;
    let finalNonStriker = newNonStriker;
    if (overComplete) {
      [finalStriker, finalNonStriker] = [finalNonStriker, finalStriker];
    }

    const { data: updatedSession } = await adminClient
      .from("scoring_sessions")
      .update({
        striker: finalStriker,
        non_striker: finalNonStriker,
        awaiting_new_bowler: false,
        awaiting_new_batsman: false,
        over_completed_on_wicket: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .select()
      .single();

    const scorecard = computeScorecard(updatedSession, remainingBalls || []);
    return NextResponse.json({ ok: true, session: updatedSession, scorecard });
  }

  // ── complete_innings ───────────────────────────────────────────────────────
  if (action === "complete_innings") {
    const { data: session, error: sessionError } = await adminClient
      .from("scoring_sessions")
      .select("*")
      .eq("match_id", matchId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ ok: false, error: "No session" }, { status: 404 });
    }

    const { data: updatedSession } = await adminClient
      .from("scoring_sessions")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .select()
      .single();

    const { data: allBalls } = await adminClient
      .from("balls")
      .select("*")
      .eq("match_id", matchId)
      .eq("innings", updatedSession.innings);

    const scorecard = computeScorecard(updatedSession, allBalls || []);
    return NextResponse.json({ ok: true, session: updatedSession, scorecard });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
