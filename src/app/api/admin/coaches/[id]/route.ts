import { NextResponse } from "next/server";
import { staff } from "@/server/db/inMemoryDb";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const s = staff.update(params.id, body);
  if (!s) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true, coach: s });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // Assuming we add a delete method to staff in inMemoryDb or just use a generic way.
  // Since we don't have staff.delete, let's just mark as inactive or we can add the method.
  // For now, let's assume we can update status to 'Deleted' or similar if delete isn't there.
  const s = staff.update(params.id, { status: "Inactive" }); 
  if (!s) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
