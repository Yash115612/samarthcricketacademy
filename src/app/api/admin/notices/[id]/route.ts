import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

const supabase: any = adminClient;

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { data: deleted, error } = await supabase
    .from("notices")
    .delete()
    .eq("id", params.id)
    .select()
    .maybeSingle();

  if (error || !deleted) return NextResponse.json({ ok: false, error: "Notice not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
