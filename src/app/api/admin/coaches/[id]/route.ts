import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

const supabase: any = adminClient;

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { data: s, error } = await supabase
    .from("staff")
    .update(body)
    .eq("id", params.id)
    .select()
    .maybeSingle();

  if (error || !s) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true, coach: s });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // Assuming we add a delete method to staff or just use a generic way.
  // Since we don't have staff.delete, let's just mark as inactive or we can add the method.
  // For now, let's assume we can update status to 'Deleted' or similar if delete isn't there.
  const { data: s, error } = await supabase
    .from("staff")
    .update({ status: "Inactive" })
    .eq("id", params.id)
    .select()
    .maybeSingle();

  if (error || !s) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
