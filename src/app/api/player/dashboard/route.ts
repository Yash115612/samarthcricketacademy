import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.user_id;
  const role = session?.user?.role;
  const branch_id = session?.user?.branch_id;

  if (!userId || role !== "player" || !branch_id) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Supabase fetch user failed:", userError);
      return NextResponse.json({ ok: false, error: "USER_NOT_FOUND" }, { status: 404 });
    }
    if (!user) {
      console.error("User not found in Supabase");
      return NextResponse.json({ ok: false, error: "USER_NOT_FOUND" }, { status: 404 });
    }

    // Return safe defaults since other tables may not exist yet in Supabase
    return NextResponse.json({
      ok: true,
      user: {
        user_id: user.id,
        name: user.name,
        branch_id: user.branch_id,
        role: user.role,
        membership_status: user.membership_status,
      },
      membership: null,
      stats: {
        matches_played: 0,
        total_runs: 0,
        total_wickets: 0,
        role: "Batter",
      },
      matchHistory: [],
      upcomingMatches: [],
      liveMatches: [],
      notices: [],
      attendance: {
        present: 0,
        absent: 0,
        percentage: 0,
        entries: [],
      },
      yearlyReport: {
        year: new Date().getFullYear(),
        matches_played: 0,
        total_runs: 0,
        total_wickets: 0,
        attendance: { present: 0, absent: 0, percentage: 0 },
        months: [],
      },
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
