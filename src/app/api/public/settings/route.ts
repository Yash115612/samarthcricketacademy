import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import type { BranchId } from "@/types/dashboard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const branchId = (searchParams.get("branch") as BranchId) || "samarth";

  const { data: s, error } = await adminClient
    .from("branch_settings")
    .select("*")
    .eq("branch_id", branchId)
    .maybeSingle();

  const fallbackSettings = s || {
    payment_qr_url: "",
    payment_upi_id: "",
    payment_instructions: [],
  };

  if (error && !s) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }

  return NextResponse.json(
    {
      ok: true,
      settings: {
        payment_qr_url: fallbackSettings.payment_qr_url || "",
        payment_upi_id: fallbackSettings.payment_upi_id || "",
        payment_instructions: fallbackSettings.payment_instructions || [],
      },
    },
    {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    }
  );
}
