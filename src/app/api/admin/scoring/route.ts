import "server-only";
import { NextResponse } from "next/server";
import { scoringSessions, ballsDb } from "@/server/db/inMemoryDb";
import { computeScorecard } from "@/lib/cricket";
import type { WicketType } from "@/server/db/inMemoryDb";

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ ok: false, error: "matchId required" }, { status: 400 });

  const session = scoringSessions.getByMatchId(matchId);
  if (!session) return NextResponse.json({ ok: true, session: null, scorecard: null });

  const balls = ballsDb.listByMatch(matchId, session.innings);
  const scorecard = computeScorecard(session, balls);
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

    const session = scoringSessions.create({
      match_id: matchId,
      branch_id: branch_id || "samarth",
      innings,
      batting_team,
      bowling_team,
      total_overs: Number(total_overs) || 20,
      target: target ? Number(target) : undefined,
      batting_lineup: batting_lineup || [striker, non_striker],
      striker,
      non_striker,
      current_bowler,
      awaiting_new_bowler: false,
      awaiting_new_batsman: false,
      over_completed_on_wicket: false,
      status: "active",
    });

    const scorecard = computeScorecard(session, []);
    return NextResponse.json({ ok: true, session, scorecard });
  }

  // ── ball ───────────────────────────────────────────────────────────────────
  if (action === "ball") {
    const session = scoringSessions.getByMatchId(matchId);
    if (!session) return NextResponse.json({ ok: false, error: "No session" }, { status: 404 });
    if (session.awaiting_new_bowler || session.awaiting_new_batsman) {
      return NextResponse.json({ ok: false, error: "Awaiting input before next ball" }, { status: 400 });
    }

    const existingBalls = ballsDb.listByMatch(matchId, session.innings);
    const legalBalls = existingBalls.filter((b) => !b.wide && !b.no_ball).length;
    const currentOver = Math.floor(legalBalls / 6);

    const { runs = 0, wide = false, no_ball = false, bye = 0, leg_bye = 0, wicket } = body;

    ballsDb.add({
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
        : undefined,
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
    };

    scoringSessions.update(session.id, patch);

    const updatedSession = scoringSessions.getByMatchId(matchId)!;
    const allBalls = ballsDb.listByMatch(matchId, session.innings);
    const scorecard = computeScorecard(updatedSession, allBalls);

    return NextResponse.json({ ok: true, session: updatedSession, scorecard });
  }

  // ── new_bowler ─────────────────────────────────────────────────────────────
  if (action === "new_bowler") {
    const session = scoringSessions.getByMatchId(matchId);
    if (!session) return NextResponse.json({ ok: false, error: "No session" }, { status: 404 });

    scoringSessions.update(session.id, {
      current_bowler: body.bowler,
      previous_bowler: session.current_bowler,
      awaiting_new_bowler: false,
    });

    const updatedSession = scoringSessions.getByMatchId(matchId)!;
    const allBalls = ballsDb.listByMatch(matchId, session.innings);
    const scorecard = computeScorecard(updatedSession, allBalls);
    return NextResponse.json({ ok: true, session: updatedSession, scorecard });
  }

  // ── new_batsman ────────────────────────────────────────────────────────────
  if (action === "new_batsman") {
    const session = scoringSessions.getByMatchId(matchId);
    if (!session) return NextResponse.json({ ok: false, error: "No session" }, { status: 404 });

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

    scoringSessions.update(session.id, {
      batting_lineup: lineup,
      striker,
      non_striker,
      awaiting_new_batsman: false,
      awaiting_new_bowler: wasOverComplete,
      over_completed_on_wicket: false,
    });

    const updatedSession = scoringSessions.getByMatchId(matchId)!;
    const allBalls = ballsDb.listByMatch(matchId, session.innings);
    const scorecard = computeScorecard(updatedSession, allBalls);
    return NextResponse.json({ ok: true, session: updatedSession, scorecard });
  }

  // ── swap_striker ───────────────────────────────────────────────────────────
  if (action === "swap_striker") {
    const session = scoringSessions.getByMatchId(matchId);
    if (!session) return NextResponse.json({ ok: false, error: "No session" }, { status: 404 });
    scoringSessions.update(session.id, {
      striker: session.non_striker,
      non_striker: session.striker,
    });
    const updatedSession = scoringSessions.getByMatchId(matchId)!;
    const allBalls = ballsDb.listByMatch(matchId, session.innings);
    const scorecard = computeScorecard(updatedSession, allBalls);
    return NextResponse.json({ ok: true, session: updatedSession, scorecard });
  }

  // ── undo ───────────────────────────────────────────────────────────────────
  if (action === "undo") {
    const session = scoringSessions.getByMatchId(matchId);
    if (!session) return NextResponse.json({ ok: false, error: "No session" }, { status: 404 });

    const removed = ballsDb.removeLast(matchId, session.innings);
    if (!removed) return NextResponse.json({ ok: false, error: "Nothing to undo" }, { status: 400 });

    // Recompute current state from all remaining balls
    const remainingBalls = ballsDb.listByMatch(matchId, session.innings);
    const legalBalls = remainingBalls.filter((b) => !b.wide && !b.no_ball).length;
    const lastBall = remainingBalls[remainingBalls.length - 1];

    // Restore striker/non-striker from session's current state by reversing the last ball's effect
    // Simplest: re-derive from last ball's batsman/non-striker stored in the ball
    const newStriker = lastBall ? lastBall.batsman : session.batting_lineup[0];
    const newNonStriker = lastBall ? lastBall.non_striker : session.batting_lineup[1];

    // Determine correct striker after restoring (apply rotation again)
    let striker = newStriker;
    let non_striker = newNonStriker;
    if (lastBall && !lastBall.wide && !lastBall.wicket) {
      if (Number(lastBall.runs) % 2 === 1) {
        [striker, non_striker] = [non_striker, striker];
      }
    }
    const overComplete = !lastBall?.wide && !lastBall?.no_ball &&
      legalBalls > 0 && legalBalls % 6 === 0;
    if (overComplete) [striker, non_striker] = [non_striker, striker];

    scoringSessions.update(session.id, {
      striker,
      non_striker,
      awaiting_new_bowler: false,
      awaiting_new_batsman: false,
      over_completed_on_wicket: false,
    });

    const updatedSession = scoringSessions.getByMatchId(matchId)!;
    const scorecard = computeScorecard(updatedSession, remainingBalls);
    return NextResponse.json({ ok: true, session: updatedSession, scorecard });
  }

  // ── complete_innings ───────────────────────────────────────────────────────
  if (action === "complete_innings") {
    const session = scoringSessions.getByMatchId(matchId);
    if (!session) return NextResponse.json({ ok: false, error: "No session" }, { status: 404 });
    scoringSessions.update(session.id, { status: "completed" });
    const updatedSession = scoringSessions.getByMatchId(matchId)!;
    const allBalls = ballsDb.listByMatch(matchId, session.innings);
    const scorecard = computeScorecard(updatedSession, allBalls);
    return NextResponse.json({ ok: true, session: updatedSession, scorecard });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
