import { NextResponse } from "next/server";
import { staff } from "@/server/db/inMemoryDb";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = staff.update(params.id, body);
    if (!updated) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ ok: true, staff: updated });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "FAILED" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ok = staff.delete(params.id);
  if (!ok) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
