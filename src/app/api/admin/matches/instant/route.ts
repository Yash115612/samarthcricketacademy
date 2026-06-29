import { NextResponse } from "next/server";
import { matches } from "@/server/db/inMemoryDb";
import { getAdminBranchId } from "@/server/branch";

export async function POST(req: Request) {
  try {
    const branchId = getAdminBranchId();
    const body = await req.json();
    const { teams, live_link, venue, date, time } = body;

    if (!teams || !live_link) {
      return NextResponse.json({ ok: false, error: "Teams and Live Link are required" }, { status: 400 });
    }

    const match = matches.create({
      branch_id: branchId,
      teams,
      date: date || new Date().toISOString().split('T')[0],
      time: time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      venue: venue || "Live from CricHeroes",
      fee: 0,
      status: "Live",
      live_link
    });

    return NextResponse.json({ ok: true, match });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to create instant match" }, { status: 500 });
  }
}
