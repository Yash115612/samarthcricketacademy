import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: settings, error } = await adminClient
    .from("site_settings")
    .select("*")
    .eq('id', 'site') // assuming single row id is "site"
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true, settings });
}
