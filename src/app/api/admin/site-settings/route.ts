import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { siteSettings, ensureDbSynced } from "@/server/db/inMemoryDb";

export const maxDuration = 60; // Increase timeout to 60 seconds

export async function PATCH(req: Request) {
  await ensureDbSynced();
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    // Use req.text() instead of req.json() to potentially bypass default limits
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const updated = await siteSettings.update(body);
    return NextResponse.json({ ok: true, settings: updated });
  } catch (error: any) {
    if (error.message?.includes("too large") || error.name === "PayloadTooLargeError") {
      return NextResponse.json({ ok: false, error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
    }
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }
}
