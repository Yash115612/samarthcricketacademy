import { NextResponse } from "next/server";
import { enquiries } from "@/server/db/inMemoryDb";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { status } = body;
  if (!status) return NextResponse.json({ ok: false, error: "MISSING_STATUS" }, { status: 400 });

  const updated = enquiries.updateStatus(params.id, status);
  if (!updated) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  return NextResponse.json({ ok: true, enquiry: updated });
}
