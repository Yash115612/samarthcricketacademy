import { NextResponse } from "next/server";
import { shop } from "@/server/db/inMemoryDb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const p = shop.getById(params.id);
  if (!p) return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
  return NextResponse.json({ ok: true, product: p });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const p = shop.update(params.id, body);
    if (!p) return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
    return NextResponse.json({ ok: true, product: p });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = shop.delete(params.id);
  if (!ok) return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
