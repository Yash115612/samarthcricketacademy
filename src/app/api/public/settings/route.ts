import { NextResponse } from "next/server";
import { settings } from "@/server/db/inMemoryDb";
import type { BranchId } from "@/types/dashboard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const branchId = (searchParams.get("branch") as BranchId) || "samarth";

  // Fall back to samarth settings if the requested branch has no payment config
  const s = settings.get(branchId) || settings.get("samarth");
  if (!s) {
    return NextResponse.json({ ok: false, error: "BRANCH_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json(
    {
      ok: true,
      settings: {
        payment_qr_url: s.payment_qr_url || "",
        payment_upi_id: s.payment_upi_id || "",
        payment_instructions: s.payment_instructions || [],
      },
    },
    {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    }
  );
}
