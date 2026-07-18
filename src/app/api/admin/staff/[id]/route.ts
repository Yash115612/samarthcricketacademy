import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { password, role, ...updateData } = body;
    
    // If password is provided, hash it
    if (password) {
      const saltRounds = 12;
      updateData.password_hash = await bcrypt.hash(password, saltRounds);
    }

    // Keep auth role fixed as "staff" and store the editable title in permissions.
    updateData.role = "staff";
    updateData.email = typeof updateData.email === "string" ? updateData.email.trim().toLowerCase() : updateData.email;
    updateData.name = typeof updateData.name === "string" ? updateData.name.trim() : updateData.name;
    updateData.phone = typeof updateData.phone === "string" ? updateData.phone.trim() : updateData.phone;
    updateData.experience = typeof updateData.experience === "string" ? updateData.experience.trim() : updateData.experience;
    updateData.permissions = {
      ...(updateData.permissions || {}),
      staffRole: typeof role === "string" ? role.trim() : "",
    };
    
    const { data: updated, error } = await adminClient
      .from("users")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();
    
    if (error || !updated) {
      console.error("Error updating staff:", error, { staffId: params.id });
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
