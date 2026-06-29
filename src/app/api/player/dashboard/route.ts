import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { attendance, matchParticipants, matches, memberships, notices, performance, users, ensureDbSynced } from "@/server/db/inMemoryDb";
import { getCached, setCache } from "@/server/cache";

const monthKey = (isoDate: string) => isoDate.slice(0, 7);
const yearKey = (isoDate: string) => isoDate.slice(0, 4);

export async function GET() {
  await ensureDbSynced();
  const session = await getServerSession(authOptions);
  const userId = session?.user?.user_id;
  const role = session?.user?.role;
  const branch_id = session?.user?.branch_id;

  if (!userId || role !== "player" || !branch_id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const cacheKey = `player_dashboard_${userId}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const user = users.getById(userId);
  if (!user || user.role !== "player" || user.branch_id !== branch_id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const memRaw = memberships.getForUserBranch(userId, branch_id);
  const membership = memRaw ? {
    ...memberships.normalizeStatus(memRaw),
    expiring_soon: memberships.isExpiringSoon(memRaw),
  } : null;

  const perf = performance.listByUserBranch(userId, branch_id);
  let totalRuns = 0;
  let totalWickets = 0;
  for (const p of perf) {
    totalRuns += p.runs;
    totalWickets += p.wickets;
  }

  const stats = {
    matches_played: perf.length,
    total_runs: totalRuns,
    total_wickets: totalWickets,
    role: totalWickets > 0 && totalRuns > 0 ? "All-rounder" : totalWickets > 0 ? "Bowler" : "Batter",
  };

  const branchMatches = matches.listByBranch(branch_id);
  const matchById = new Map(branchMatches.map((m) => [m.id, m]));

  const matchHistory = perf
    .map((p) => {
      const m = matchById.get(p.match_id);
      if (!m) return null;
      return {
        id: m.id,
        opponent: m.teams,
        runs: p.runs,
        wickets: p.wickets,
        result: m.result ?? null,
        date: m.date,
        venue: m.venue,
      };
    })
    .filter(Boolean);

  const joined = new Set(matchParticipants.listForUser(userId).map((p) => p.match_id));
  const upcomingMatches = branchMatches
    .filter((m) => m.status === "Upcoming")
    .map((m) => ({
      id: m.id,
      teams: m.teams,
      date: m.date,
      time: m.time,
      venue: m.venue,
      fee: m.fee,
      joined: joined.has(m.id),
      live_link: m.live_link,
    }));

  const liveMatches = branchMatches
    .filter((m) => m.status === "Live")
    .map((m) => ({
      id: m.id,
      teams: m.teams,
      date: m.date,
      time: m.time,
      venue: m.venue,
      fee: m.fee,
      joined: joined.has(m.id),
      live_link: m.live_link,
    }));

  const branchNotices = notices.listByBranchLatestFirst(branch_id);

  const allAttendance = attendance.listByUserBranch(userId, branch_id);
  const currentMonth = monthKey(new Date().toISOString().slice(0, 10));
  const monthAttendance = allAttendance.filter((a) => monthKey(a.date) === currentMonth);
  const present = monthAttendance.filter((a) => a.status === "Present").length;
  const absent = monthAttendance.filter((a) => a.status === "Absent").length;
  const total = monthAttendance.length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  const currentYear = yearKey(new Date().toISOString().slice(0, 10));
  const yearAttendance = allAttendance.filter((a) => yearKey(a.date) === currentYear);
  const yearPresent = yearAttendance.filter((a) => a.status === "Present").length;
  const yearAbsent = yearAttendance.filter((a) => a.status === "Absent").length;
  const yearTotal = yearAttendance.length;
  const yearPercentage = yearTotal > 0 ? Math.round((yearPresent / yearTotal) * 100) : 0;

  const yearMonthly = new Map<
    string,
    { month: string; matches_played: number; runs: number; wickets: number; present: number; absent: number }
  >();

  let totalYearRuns = 0;
  let totalYearWickets = 0;
  let totalYearMatchesPlayed = 0;

  for (const p of perf) {
    const m = matchById.get(p.match_id);
    if (!m || yearKey(m.date) !== currentYear) continue;

    const month = monthKey(m.date);
    const current = yearMonthly.get(month) ?? { month, matches_played: 0, runs: 0, wickets: 0, present: 0, absent: 0 };
    current.matches_played += 1;
    current.runs += p.runs;
    current.wickets += p.wickets;
    yearMonthly.set(month, current);

    totalYearRuns += p.runs;
    totalYearWickets += p.wickets;
    totalYearMatchesPlayed += 1;
  }

  for (const a of allAttendance) {
    if (yearKey(a.date) !== currentYear) continue;

    const month = monthKey(a.date);
    const current = yearMonthly.get(month) ?? { month, matches_played: 0, runs: 0, wickets: 0, present: 0, absent: 0 };
    if (a.status === "Present") current.present += 1;
    else current.absent += 1;
    yearMonthly.set(month, current);
  }

  const yearlyReport = {
    year: Number(currentYear),
    matches_played: totalYearMatchesPlayed,
    total_runs: totalYearRuns,
    total_wickets: totalYearWickets,
    attendance: { present: yearPresent, absent: yearAbsent, percentage: yearPercentage },
    months: Array.from(yearMonthly.values()).sort((a, b) => (a.month < b.month ? -1 : 1)),
  };

  const responseData = {
    ok: true,
    user: {
      user_id: user.id,
      name: user.name,
      branch_id: user.branch_id,
      role: user.role,
      membership_status: user.membership_status,
    },
    membership: membership
      ? {
          plan_name: membership.plan_name,
          start_date: membership.start_date,
          expiry_date: membership.expiry_date,
          status: membership.status,
          expiring_soon: (membership as any).expiring_soon,
          days_left: memberships.daysUntilExpiry(memRaw!),
        }
      : null,
    stats,
    matchHistory,
    upcomingMatches,
    liveMatches,
    notices: branchNotices,
    attendance: {
      present,
      absent,
      percentage,
      entries: monthAttendance,
    },
    yearlyReport,
  };

  setCache(cacheKey, responseData);
  return NextResponse.json(responseData);
}
