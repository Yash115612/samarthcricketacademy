import { NextResponse } from "next/server";
import { users, performance, matchParticipants, matches } from "@/server/db/inMemoryDb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const branch = (searchParams.get("branch") || "samarth") as "samarth" | "aims";

  const allUsers = users.listByBranch(branch);

  // Aggregate performance per player
  const stats: Record<
    string,
    { name: string; matches: number; runs: number; wickets: number; userId: string }
  > = {};

  for (const user of allUsers) {
    const perfs = performance.listByUserBranch(user.id, branch);
    const matchCount = matchParticipants.listForUser(user.id).filter((p) => {
      const m = matches.getById(p.match_id);
      return m && m.branch_id === branch && m.status === "Completed";
    }).length;

    const totalRuns = perfs.reduce((s, p) => s + p.runs, 0);
    const totalWickets = perfs.reduce((s, p) => s + p.wickets, 0);

    stats[user.id] = {
      name: user.name,
      userId: user.id,
      matches: Math.max(matchCount, perfs.length),
      runs: totalRuns,
      wickets: totalWickets,
    };
  }

  const rows = Object.values(stats);

  // Overall: weighted points (runs + wickets * 20)
  const overall = [...rows]
    .sort((a, b) => b.runs + b.wickets * 20 - (a.runs + a.wickets * 20))
    .slice(0, 10)
    .map((p, i) => ({ rank: i + 1, ...p, points: p.runs + p.wickets * 20 }));

  // Batsman: by runs
  const batsman = [...rows]
    .filter((p) => p.runs > 0)
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 10)
    .map((p, i) => ({
      rank: i + 1,
      name: p.name,
      matches: p.matches,
      runs: p.runs,
      avg: p.matches > 0 ? +(p.runs / p.matches).toFixed(1) : 0,
    }));

  // Bowler: by wickets
  const bowler = [...rows]
    .filter((p) => p.wickets > 0)
    .sort((a, b) => b.wickets - a.wickets)
    .slice(0, 10)
    .map((p, i) => ({
      rank: i + 1,
      name: p.name,
      matches: p.matches,
      wickets: p.wickets,
    }));

  // All-rounder: must have both runs and wickets
  const allRounder = [...rows]
    .filter((p) => p.runs > 0 && p.wickets > 0)
    .sort((a, b) => b.runs + b.wickets * 20 - (a.runs + a.wickets * 20))
    .slice(0, 10)
    .map((p, i) => ({
      rank: i + 1,
      name: p.name,
      runs: p.runs,
      wickets: p.wickets,
      rating: +(p.runs / 10 + p.wickets * 5).toFixed(1),
    }));

  return NextResponse.json({
    ok: true,
    hasData: rows.some((r) => r.runs > 0 || r.wickets > 0),
    Overall: overall,
    Batsman: batsman,
    Bowler: bowler,
    "All-rounder": allRounder,
  });
}
