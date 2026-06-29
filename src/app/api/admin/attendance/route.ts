import { NextResponse } from "next/server";
import { attendance, users } from "@/server/db/inMemoryDb";
import { getAdminBranchId } from "@/server/branch";
import { BATCHES } from "@/data/batches";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const branchId = getAdminBranchId();

    if (!date) {
      return NextResponse.json({ ok: false, error: "DATE_REQUIRED" }, { status: 400 });
    }

    const attendanceList = attendance.listByBranchAndDate(branchId, date);
    const players = users.listByBranch(branchId);
    const branchBatches = BATCHES.filter(b => b.branch_id === branchId);

    return NextResponse.json({ 
      ok: true, 
      attendance: attendanceList,
      players: players,
      batches: branchBatches
    });
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const branchId = getAdminBranchId();
    const body = await req.json();
    const { date, records } = body; // records: [{ user_id, status }]

    if (!date || !records || !Array.isArray(records)) {
      return NextResponse.json({ ok: false, error: "INVALID_DATA" }, { status: 400 });
    }

    for (const record of records) {
      await attendance.mark({
        user_id: record.user_id,
        branch_id: branchId,
        date,
        status: record.status
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
