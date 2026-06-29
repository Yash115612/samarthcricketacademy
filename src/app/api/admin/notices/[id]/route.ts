import { NextResponse } from "next/server";
import { notices } from "@/server/db/inMemoryDb";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = notices.delete(params.id);
  if (!ok) return NextResponse.json({ ok: false, error: "Notice not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
