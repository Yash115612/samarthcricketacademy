import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getAdminBranchId } from "@/server/branch";
import { BATCHES } from "@/data/batches";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const branchId = getAdminBranchId();
    
    console.log("[Attendance API] GET called with branchId:", branchId, "date:", date);

    if (!date) {
      return NextResponse.json({ ok: false, error: "DATE_REQUIRED" }, { status: 400 });
    }

    const { data: attendanceList, error: attError } = await adminClient
      .from("attendances")
      .select("*")
      .eq("branch_id", branchId)
      .eq("date", date);
    
    if (attError) {
      console.error("[Attendance API] Attendance GET error:", attError);
      return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
    }
    console.log("[Attendance API] Attendance list fetched:", attendanceList?.length, "records");

    const { data: players, error: usersError } = await adminClient
      .from("users")
      .select("*")
      .eq("branch_id", branchId)
      .eq("role", "player");
    
    if (usersError) {
      console.error("[Attendance API] Players GET error:", usersError);
      return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
    }
    console.log("[Attendance API] Players fetched:", players?.length, "players");

    const branchBatches = BATCHES.filter(b => b.branch_id === branchId);

    return NextResponse.json({ 
      ok: true, 
      attendance: attendanceList,
      players: players,
      batches: branchBatches
    });
  } catch (error) {
    console.error("[Attendance API] Attendance GET error:", error);
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
      // Check if exists first
      const { data: existing } = await adminClient
        .from("attendances")
        .select("id")
        .eq("user_id", record.user_id)
        .eq("branch_id", branchId)
        .eq("date", date)
        .maybeSingle();

      if (existing) {
        // Update
        await adminClient
          .from("attendances")
          .update({ status: record.status })
          .eq("id", existing.id);
      } else {
        // Insert
        await adminClient
          .from("attendances")
          .insert({
            id: crypto.randomUUID(),
            user_id: record.user_id,
            branch_id: branchId,
            date,
            status: record.status
          });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
