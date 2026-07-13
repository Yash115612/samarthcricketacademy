import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getAdminBranchId } from "@/server/branch";
import { genId } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const branchId = getAdminBranchId();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (userId) {
      const { data: list, error } = await adminClient
        .from("performance")
        .select("*")
        .eq("user_id", userId)
        .eq("branch_id", branchId);
      
      if (error) {
        console.error("Error fetching records:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch records" }, { status: 500 });
      }
      return NextResponse.json({ ok: true, records: list });
    }
    
    // List all for branch if no userId
    const { data: all, error: allError } = await adminClient
      .from("performance")
      .select("*")
      .eq("branch_id", branchId);
    
    if (allError) {
      console.error("Error fetching records:", allError);
      return NextResponse.json({ ok: false, error: "Failed to fetch records" }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true, records: all });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const branchId = getAdminBranchId();
    const body = await req.json();
    const { data: p, error } = await adminClient
      .from("performance")
      .insert({ 
        id: genId("perf"), 
        ...body, 
        branch_id: branchId 
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating record:", error);
      return NextResponse.json({ ok: false, error: "Failed to create record" }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true, record: p });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to create record" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...patch } = body;
    const { data: p, error } = await adminClient
      .from("performance")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    
    if (error || !p) return NextResponse.json({ ok: false, error: "Record not found" }, { status: 404 });
    return NextResponse.json({ ok: true, record: p });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to update record" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "ID required" }, { status: 400 });
    
    const { error } = await adminClient
      .from("performance")
      .delete()
      .eq("id", id);
    
    if (error) {
      return NextResponse.json({ ok: false, error: "Failed to delete record" }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to delete record" }, { status: 500 });
  }
}
