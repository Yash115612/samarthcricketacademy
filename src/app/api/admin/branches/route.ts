import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase: any = createAdminClient();

  const { data: branches, error } = await supabase.from("branches").select("*");
  if (error) {
    return NextResponse.json({ ok: false, error: "DB_ERROR", message: error.message }, { status: 500 });
  }

  const { data: playerCounts, error: countError } = await supabase
    .from("users")
    .select("branch_id")
    .eq("role", "player");

  if (countError) {
    return NextResponse.json({ ok: false, error: "DB_ERROR", message: countError.message }, { status: 500 });
  }

  const counts = new Map<string, number>();
  for (const u of playerCounts ?? []) {
    counts.set(u.branch_id, (counts.get(u.branch_id) ?? 0) + 1);
  }

  const result = (branches ?? []).map((b: any) => ({
    ...b,
    player_count: counts.get(b.id) ?? 0,
  }));

  return NextResponse.json({ ok: true, branches: result });
}

export async function POST(req: Request) {
  const supabase: any = createAdminClient();
  const body = await req.json();
  const { name, address, city, phone, email, status,
    google_maps_link, description, head_coach, established } = body;

  if (!name || !city) {
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS", message: "Name and city are required." }, { status: 400 });
  }

  // Generate slug ID from name
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  const { data: existing } = await supabase.from("branches").select("id").eq("id", id).maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: false, error: "ID_EXISTS", message: "A branch with this name already exists." }, { status: 409 });
  }

  const { data: branch, error } = await supabase
    .from("branches")
    .insert({
      id, name, address: address || "", city, phone: phone || "", email: email || "",
      status: status || "Active", google_maps_link: google_maps_link || "",
      description: description || "", head_coach: head_coach || "",
      established: established || new Date().getFullYear().toString(),
    })
    .select()
    .single();

  if (error || !branch) {
    return NextResponse.json({ ok: false, error: "FAILED", message: error?.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, branch }, { status: 201 });
}
