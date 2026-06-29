import { NextResponse } from "next/server";
import { dbBranches, users } from "@/server/db/inMemoryDb";

export async function GET() {
  const branches = dbBranches.list().map((b) => ({
    ...b,
    player_count: users.listByBranch(b.id).length,
  }));
  return NextResponse.json({ ok: true, branches });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, address, city, phone, email, status,
    google_maps_link, description, head_coach, established } = body;

  if (!name || !city) {
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS", message: "Name and city are required." }, { status: 400 });
  }

  // Generate slug ID from name
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  if (dbBranches.getById(id)) {
    return NextResponse.json({ ok: false, error: "ID_EXISTS", message: "A branch with this name already exists." }, { status: 409 });
  }

  const branch = dbBranches.create({
    name, address: address || "", city, phone: phone || "", email: email || "",
    status: status || "Active", google_maps_link: google_maps_link || "",
    description: description || "", head_coach: head_coach || "",
    established: established || new Date().getFullYear().toString(),
  }, id);

  if (!branch) {
    return NextResponse.json({ ok: false, error: "FAILED" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, branch }, { status: 201 });
}
