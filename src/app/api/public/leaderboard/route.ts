import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const branch = (searchParams.get("branch") || "samarth") as "samarth" | "aims";

  // Fetch all data
  const [
    { data: allUsers },
    { data: performance },
    { data: matchParticipants },
    { data: matches }
  ] = await Promise.all([
    adminClient.from("users").select("*").eq("branch_id", branch),
    adminClient.from("performance").select("*").eq("branch_id", branch),
    adminClient.from("match_participants").select("*").eq("branch_id", branch),
    adminClient.from("matches").select("*").eq("branch_id", branch),
  ]);

  // Aggregate performance per player
  const stats: Record<
    string,
    { name: string; matches: number; runs: number; wickets: number; userId: string }
  > = {};

  // Initialize stats for all users
  (allUsers || []).forEach(user => {
    stats[user.id] = {
      name: user.name,
      userId: user.id,
      matches: 0,
      runs: 0,
      wickets: 0
    };
  });

  // Sum performance
  (performance || []).forEach(p => {
    if (stats[p.user_id]) {
      stats[p.user_id].runs += p.runs;
      stats[p.user_id].wickets += p.wickets;
    }
  });

  // Count completed matches per user
  const completedMatchIds = new Set(
    (matches || [])
      .filter(m => m.status === "Completed")
      .map(m => m.id)
  );

  (matchParticipants || []).forEach(mp => {
    if (stats[mp.user_id] && completedMatchIds.has(mp.match_id)) {
      stats[mp.user_id].matches++;
    }
  });

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
    overall,
    batsman,
    bowler,
    allRounder,
  });
}
