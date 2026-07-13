import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { status } = body;
  if (!status) return NextResponse.json({ ok: false, error: "MISSING_STATUS" }, { status: 400 });

  const { data: updated, error } = await adminClient
    .from("enquiries")
    .update({ status })
    .eq("id", params.id)
    .select()
    .single();

  if (error || !updated) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  return NextResponse.json({ ok: true, enquiry: updated });
}
