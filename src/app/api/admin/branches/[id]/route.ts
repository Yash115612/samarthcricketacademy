import { NextResponse } from "next/server";
import { dbBranches } from "@/server/db/inMemoryDb";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = dbBranches.update(params.id, body);
  if (!updated) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true, branch: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const result = dbBranches.delete(params.id);
  if (!result.ok) {
    const status = result.error === "BRANCH_HAS_USERS" ? 409 : 404;
    const message = result.error === "BRANCH_HAS_USERS"
      ? "Cannot delete: this branch has registered players. Reassign or remove them first."
      : "Branch not found.";
    return NextResponse.json({ ok: false, error: result.error, message }, { status });
  }
  return NextResponse.json({ ok: true });
}
