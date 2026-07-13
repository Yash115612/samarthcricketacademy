import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { password, ...updateData } = body;
    
    // If password is provided, hash it
    if (password) {
      const saltRounds = 12;
      updateData.password_hash = await bcrypt.hash(password, saltRounds);
    }
    
    const { data: updated, error } = await adminClient
      .from("users")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();
    
    if (error || !updated) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true, staff: updated });
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json({ ok: false, error: "FAILED" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await adminClient
    .from("users")
    .delete()
    .eq("id", params.id);
  
  if (error) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }
  
  return NextResponse.json({ ok: true });
}
