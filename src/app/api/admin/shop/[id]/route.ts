import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { data: p, error } = await adminClient
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();
  
  if (error || !p) return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
  return NextResponse.json({ ok: true, product: p });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { data: p, error } = await adminClient
      .from("products")
      .update(body)
      .eq("id", params.id)
      .select()
      .single();
    
    if (error || !p) return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
    return NextResponse.json({ ok: true, product: p });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { error } = await adminClient
    .from("products")
    .delete()
    .eq("id", params.id);
  
  if (error) return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
