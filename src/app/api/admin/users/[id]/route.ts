import { NextResponse } from "next/server";
import { users } from "@/server/db/inMemoryDb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = users.getById(params.id);
  if (!user) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true, user });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();

  // Check email uniqueness (excluding this user)
  if (body.email) {
    const existing = users.getByEmailAnyBranch(body.email);
    if (existing && existing.id !== params.id) {
      return NextResponse.json({ ok: false, error: "EMAIL_EXISTS", message: "This email is already used by another account." }, { status: 409 });
    }
  }

  // Check phone uniqueness (excluding this user)
  if (body.phone) {
    const existingPhone = users.getByPhone(body.phone);
    if (existingPhone && existingPhone.id !== params.id) {
      return NextResponse.json({ ok: false, error: "PHONE_EXISTS", message: "This phone number is already used by another account." }, { status: 409 });
    }
  }

  const updated = users.updateProfile(params.id, body);
  if (!updated) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true, user: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const deleted = users.delete(params.id);
  if (!deleted) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
