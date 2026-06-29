import { NextResponse } from "next/server";
import { plans } from "@/server/db/inMemoryDb";

export async function GET() {
  return NextResponse.json({ ok: true, plans: plans.list() });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ ok: false, error: "ID_REQUIRED" }, { status: 400 });
    
    const updated = plans.update(id, patch);
    if (!updated) return NextResponse.json({ ok: false, error: "PLAN_NOT_FOUND" }, { status: 404 });
    
    return NextResponse.json({ ok: true, plan: updated });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
