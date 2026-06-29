import { NextResponse } from "next/server";
import { siteSettings, ensureDbSynced } from "@/server/db/inMemoryDb";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDbSynced();
  const settings = siteSettings.get();
  return NextResponse.json({ ok: true, settings });
}
