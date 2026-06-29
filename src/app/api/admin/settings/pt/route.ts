import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { settings } from "@/server/db/inMemoryDb";
import { getAdminBranchId } from "@/server/branch";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const branchId = getAdminBranchId();
  const s = settings.get(branchId);
  return NextResponse.json({ ok: true, settings: s });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const branchId = getAdminBranchId();
  const body = (await req.json().catch(() => null)) as {
    total_pt_slots?: number;
    used_pt_slots?: number;
    payment_qr_url?: string;
    payment_upi_id?: string;
    payment_instructions?: string[];
  } | null;

  if (!body) return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });

  const updated = settings.update(branchId, body);
  return NextResponse.json({ ok: true, settings: updated });
}
