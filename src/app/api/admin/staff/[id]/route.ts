import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { password, ...updateData } = body;
    
    // If password is provided, hash it
    if (password) {
      const saltRounds = 12;
      updateData.password_hash = await bcrypt.hash(password, saltRounds);
    }
    
    const { data: updated, error } = await supabase
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
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", params.id);
  
  if (error) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }
  
  return NextResponse.json({ ok: true });
}
