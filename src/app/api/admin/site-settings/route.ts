import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { adminClient } from "@/lib/supabase";

export const maxDuration = 60;

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    
    // Update site settings, assuming single row with id "site"
    const { data: updated, error } = await adminClient
      .from("site_settings")
      .update(body)
      .eq('id', 'site')
      .select()
      .single();
    
    if (error) {
      console.error("Error updating site settings:", error);
      return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true, settings: updated });
  } catch (error: any) {
    if (error.message?.includes("too large") || error.name === "PayloadTooLargeError") {
      return NextResponse.json({ ok: false, error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
    }
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }
}
