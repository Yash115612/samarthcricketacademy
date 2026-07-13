import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getAdminBranchId } from "@/server/branch";
import { genId } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const branchId = getAdminBranchId();

    if (!date) {
      return NextResponse.json({ ok: false, error: "DATE_REQUIRED" }, { status: 400 });
    }

    const { data: attendanceList, error: attError } = await adminClient
      .from("staff_attendance")
      .select("*")
      .eq("branch_id", branchId)
      .eq("date", date);
    
    if (attError) {
      console.error("Staff Attendance GET error:", attError);
      return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
    }

    const { data: branchStaff, error: staffError } = await adminClient
      .from("users")
      .select("*")
      .eq("branch_id", branchId)
      .eq("role", "staff");
    
    if (staffError) {
      console.error("Staff GET error:", staffError);
      return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true, 
      attendance: attendanceList,
      staff: branchStaff 
    });
  } catch (error) {
    console.error("Staff Attendance GET error:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const branchId = getAdminBranchId();
    const body = await req.json();
    const { date, records } = body; // records: [{ staff_id, status }]

    if (!date || !records || !Array.isArray(records)) {
      return NextResponse.json({ ok: false, error: "INVALID_DATA" }, { status: 400 });
    }

    for (const record of records) {
      // Check if exists first
      const { data: existing } = await adminClient
        .from("staff_attendance")
        .select("id")
        .eq("staff_id", record.staff_id)
        .eq("branch_id", branchId)
        .eq("date", date)
        .maybeSingle();

      if (existing) {
        await adminClient
          .from("staff_attendance")
          .update({ status: record.status })
          .eq("id", existing.id);
      } else {
        await adminClient
          .from("staff_attendance")
          .insert({
            id: genId("satt"),
            staff_id: record.staff_id,
            branch_id: branchId,
            date,
            status: record.status
          });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Staff Attendance POST error:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
