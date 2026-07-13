import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { adminClient } from "@/lib/supabase";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Get the payment verification record
  const { data: record, error: fetchError } = await adminClient
    .from("payment_verifications")
    .select("*")
    .eq("id", params.id)
    .single();
  
  if (fetchError || !record) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }

  if (record.status !== "pending") {
    return NextResponse.json({ ok: false, error: "ALREADY_PROCESSED" }, { status: 409 });
  }

  // Update user's membership status to rejected if we have the user
  if (record.user_id) {
    await adminClient
      .from("users")
      .update({ membership_status: "rejected" })
      .eq("id", record.user_id);
  }

  // Update payment verification status
  await adminClient
    .from("payment_verifications")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString()
    })
    .eq("id", params.id);

  return NextResponse.json({ ok: true });
}
