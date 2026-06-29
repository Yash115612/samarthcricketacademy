import type { DbBall, DbScoringSession, WicketType } from "@/server/db/inMemoryDb";

// ── Public types ──────────────────────────────────────────────────────────────

export interface BatsmanRow {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  sr: number;
  status: "yet_to_bat" | "batting" | "dismissed" | "not_out";
  how_out: string;
  is_striker: boolean;
}

export interface BowlerRow {
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  is_current: boolean;
}

export interface FallOfWicket {
  wicket_number: number;
  score: number;
  batsman: string;
  at_overs: string;
}

export interface OverBall {
  display: string;
  type: "dot" | "run" | "four" | "six" | "wicket" | "wide" | "no_ball" | "bye" | "leg_bye";
}

export interface OverSummary {
  over: number;
  balls: OverBall[];
  runs: number;
  wickets: number;
}

export interface ScorecardResult {
  batting_team: string;
  bowling_team: string;
  innings: 1 | 2;
  runs: number;
  wickets: number;
  overs: string;
  extras: { wides: number; no_balls: number; byes: number; leg_byes: number; total: number };
  crr: number;
  target?: number;
  runs_required?: number;
  balls_remaining?: number;
  rrr?: number;
  striker: string;
  non_striker: string;
  current_bowler: string;
  partnership: { runs: number; balls: number };
  current_over: OverBall[];
  batting: BatsmanRow[];
  bowling: BowlerRow[];
  fow: FallOfWicket[];
  recent_overs: OverSummary[];
  status: "active" | "innings_break" | "completed";
  total_overs: number;
  awaiting_new_bowler: boolean;
  awaiting_new_batsman: boolean;
  last_ball_summary?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatHowOut(
  wicket: { type: WicketType; batsman: string; fielder?: string },
  bowler: string
): string {
  switch (wicket.type) {
    case "bowled": return `b ${bowler}`;
    case "caught": return wicket.fielder ? `c ${wicket.fielder} b ${bowler}` : `c & b ${bowler}`;
    case "lbw": return `lbw b ${bowler}`;
    case "run_out": return wicket.fielder ? `run out (${wicket.fielder})` : "run out";
    case "stumped": return `st ${wicket.fielder || "WK"} b ${bowler}`;
    case "hit_wicket": return `hit wkt b ${bowler}`;
    case "retired": return "retired hurt";
    default: return "out";
  }
}

export function getBallDisplay(ball: DbBall): OverBall {
  if (ball.wicket) return { display: "W", type: "wicket" };
  if (ball.wide) {
    const extra = ball.runs > 0 ? String(1 + ball.runs) : "";
    return { display: `Wd${extra}`, type: "wide" };
  }
  if (ball.no_ball) {
    return { display: ball.runs > 0 ? `NB+${ball.runs}` : "NB", type: "no_ball" };
  }
  if (ball.bye > 0) return { display: `B${ball.bye}`, type: "bye" };
  if (ball.leg_bye > 0) return { display: `LB${ball.leg_bye}`, type: "leg_bye" };
  if (ball.runs === 0) return { display: "•", type: "dot" };
  if (ball.runs === 4) return { display: "4", type: "four" };
  if (ball.runs === 6) return { display: "6", type: "six" };
  return { display: String(ball.runs), type: "run" };
}

// ── Main computation ──────────────────────────────────────────────────────────

export function computeScorecard(
  session: DbScoringSession,
  allBalls: DbBall[]
): ScorecardResult {
  const balls = allBalls.filter(
    (b) => b.match_id === session.match_id && b.innings === session.innings
  );

  // Batting stats
  type BatStats = { r: number; b: number; f: number; s: number; out: boolean; how: string };
  const bat: Record<string, BatStats> = {};
  session.batting_lineup.forEach((name) => {
    bat[name] = { r: 0, b: 0, f: 0, s: 0, out: false, how: "not out" };
  });

  // Bowling stats
  type BowlStats = { lb: number; r: number; w: number };
  const bowl: Record<string, BowlStats> = {};
  // Per-over bowling stats for maiden detection
  const overBowler: Record<string, Record<number, { lb: number; r: number }>> = {};

  // Over map for display
  const overMap: Record<number, OverSummary> = {};

  let totalRuns = 0;
  let totalWickets = 0;
  let legalBalls = 0;
  const extras = { wides: 0, no_balls: 0, byes: 0, leg_byes: 0, total: 0 };
  const fow: FallOfWicket[] = [];
  let partnershipRuns = 0;
  let partnershipBalls = 0;

  for (const ball of balls) {
    const isLegal = !ball.wide && !ball.no_ball;
    const overNum = ball.over;

    // Init tracking
    if (!bowl[ball.bowler]) bowl[ball.bowler] = { lb: 0, r: 0, w: 0 };
    if (!overBowler[ball.bowler]) overBowler[ball.bowler] = {};
    if (!overBowler[ball.bowler][overNum]) overBowler[ball.bowler][overNum] = { lb: 0, r: 0 };
    if (!bat[ball.batsman]) bat[ball.batsman] = { r: 0, b: 0, f: 0, s: 0, out: false, how: "not out" };
    if (!overMap[overNum]) overMap[overNum] = { over: overNum, balls: [], runs: 0, wickets: 0 };

    // Legal ball
    if (isLegal) {
      legalBalls++;
      bowl[ball.bowler].lb++;
      overBowler[ball.bowler][overNum].lb++;
      bat[ball.batsman].b++;
    }

    // Runs calculation
    const wideRuns = ball.wide ? 1 + ball.runs : 0;
    const nbRuns = ball.no_ball ? 1 : 0;
    const batRuns = ball.wide ? 0 : ball.runs;
    const ballTotal = batRuns + wideRuns + nbRuns + ball.bye + ball.leg_bye;

    totalRuns += ballTotal;
    extras.wides += wideRuns;
    extras.no_balls += nbRuns;
    extras.byes += ball.bye;
    extras.leg_byes += ball.leg_bye;

    const bowlerRuns = batRuns + wideRuns + nbRuns;
    bowl[ball.bowler].r += bowlerRuns;
    overBowler[ball.bowler][overNum].r += bowlerRuns;

    // Batsman stats (wides don't count for batsman)
    if (!ball.wide) {
      bat[ball.batsman].r += batRuns;
      if (batRuns === 4) bat[ball.batsman].f++;
      if (batRuns === 6) bat[ball.batsman].s++;
    }

    // Wicket
    if (ball.wicket) {
      totalWickets++;
      bowl[ball.bowler].w++;
      fow.push({
        wicket_number: totalWickets,
        score: totalRuns,
        batsman: ball.wicket.batsman,
        at_overs: `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`,
      });
      if (bat[ball.wicket.batsman]) {
        bat[ball.wicket.batsman].out = true;
        bat[ball.wicket.batsman].how = formatHowOut(ball.wicket, ball.bowler);
      }
      partnershipRuns = 0;
      partnershipBalls = 0;
    } else {
      partnershipRuns += ballTotal;
      if (isLegal) partnershipBalls++;
    }

    // Over display
    overMap[overNum].balls.push(getBallDisplay(ball));
    overMap[overNum].runs += ballTotal;
    if (ball.wicket) overMap[overNum].wickets++;
  }

  extras.total = extras.wides + extras.no_balls + extras.byes + extras.leg_byes;

  // Maiden detection
  const maidens: Record<string, number> = {};
  for (const [bowlerName, overs] of Object.entries(overBowler)) {
    for (const stats of Object.values(overs)) {
      if (stats.lb === 6 && stats.r === 0) {
        maidens[bowlerName] = (maidens[bowlerName] || 0) + 1;
      }
    }
  }

  const oversCompleted = Math.floor(legalBalls / 6);
  const ballsInOver = legalBalls % 6;
  const crr = legalBalls > 0
    ? Math.round((totalRuns / (legalBalls / 6)) * 100) / 100
    : 0;

  let runs_required: number | undefined;
  let balls_remaining: number | undefined;
  let rrr: number | undefined;
  if (session.target !== undefined) {
    runs_required = Math.max(0, session.target - totalRuns);
    balls_remaining = Math.max(0, session.total_overs * 6 - legalBalls);
    rrr = balls_remaining > 0
      ? Math.round((runs_required / (balls_remaining / 6)) * 100) / 100
      : 0;
  }

  // Batting list
  const activePlayers = new Set([session.striker, session.non_striker]);
  const battingList: BatsmanRow[] = session.batting_lineup.map((name) => {
    const s = bat[name] || { r: 0, b: 0, f: 0, s: 0, out: false, how: "not out" };
    let status: BatsmanRow["status"];
    if (s.out) status = "dismissed";
    else if (activePlayers.has(name)) status = "batting";
    else if (s.b > 0) status = "not_out";
    else status = "yet_to_bat";
    return {
      name,
      runs: s.r,
      balls: s.b,
      fours: s.f,
      sixes: s.s,
      sr: s.b > 0 ? Math.round((s.r / s.b) * 1000) / 10 : 0,
      status,
      how_out: s.how,
      is_striker: name === session.striker,
    };
  });

  // Bowling list
  const bowlingList: BowlerRow[] = Object.entries(bowl).map(([name, s]) => ({
    name,
    overs: `${Math.floor(s.lb / 6)}.${s.lb % 6}`,
    maidens: maidens[name] || 0,
    runs: s.r,
    wickets: s.w,
    economy: s.lb > 0 ? Math.round((s.r / (s.lb / 6)) * 100) / 100 : 0,
    is_current: name === session.current_bowler,
  }));

  // Current over balls (over in progress)
  const currentOverBalls: OverBall[] = overMap[oversCompleted]?.balls || [];

  // Recent completed overs (last 5)
  const recentOvers: OverSummary[] = [];
  for (let i = Math.max(0, oversCompleted - 5); i < oversCompleted; i++) {
    if (overMap[i]) recentOvers.push(overMap[i]);
  }

  // Last ball commentary
  const lastBall = balls[balls.length - 1];
  let lastBallSummary: string | undefined;
  if (lastBall) {
    if (lastBall.wicket) {
      lastBallSummary = `OUT! ${lastBall.wicket.batsman} — ${formatHowOut(lastBall.wicket, lastBall.bowler)}`;
    } else if (lastBall.wide) {
      lastBallSummary = `Wide ball by ${lastBall.bowler}`;
    } else if (lastBall.no_ball) {
      lastBallSummary = `No ball! ${lastBall.runs > 0 ? `${lastBall.runs} run${lastBall.runs > 1 ? "s" : ""} off bat` : ""}`.trim();
    } else if (lastBall.runs === 4) {
      lastBallSummary = `FOUR! ${lastBall.batsman} plays a shot for 4`;
    } else if (lastBall.runs === 6) {
      lastBallSummary = `SIX! ${lastBall.batsman} sends it over the ropes`;
    } else if (lastBall.runs === 0) {
      lastBallSummary = `Dot ball — ${lastBall.bowler} to ${lastBall.batsman}`;
    } else {
      lastBallSummary = `${lastBall.runs} run${lastBall.runs > 1 ? "s" : ""} — ${lastBall.batsman}`;
    }
  }

  return {
    batting_team: session.batting_team,
    bowling_team: session.bowling_team,
    innings: session.innings,
    runs: totalRuns,
    wickets: totalWickets,
    overs: `${oversCompleted}.${ballsInOver}`,
    extras,
    crr,
    target: session.target,
    runs_required,
    balls_remaining,
    rrr,
    striker: session.striker,
    non_striker: session.non_striker,
    current_bowler: session.current_bowler,
    partnership: { runs: partnershipRuns, balls: partnershipBalls },
    current_over: currentOverBalls,
    batting: battingList,
    bowling: bowlingList,
    fow,
    recent_overs: recentOvers,
    status: session.status,
    total_overs: session.total_overs,
    awaiting_new_bowler: session.awaiting_new_bowler,
    awaiting_new_batsman: session.awaiting_new_batsman,
    last_ball_summary: lastBallSummary,
  };
}
