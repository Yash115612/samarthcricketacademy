import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { adminClient } from "@/lib/supabase";
import { sendWhatsApp } from "@/lib/sms";
import crypto from "crypto";

const todayIso = () => new Date().toISOString().slice(0, 10);
const addDaysIso = (dateIso: string, days: number) => {
  const d = new Date(dateIso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const genId = (prefix: string) => `${prefix}_${crypto.randomBytes(8).toString("hex")}`;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  // 1. Get the payment verification record
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

  // 2. Get the user
  const { data: user, error: userError } = await adminClient
    .from("users")
    .select("*")
    .eq("id", record.user_id)
    .single();
  
  if (userError || !user) {
    return NextResponse.json({ ok: false, error: "USER_NOT_FOUND" }, { status: 409 });
  }

  const now = todayIso();
  const expiry = addDaysIso(now, record.plan_duration_days);

  // 3. Check if there's an existing membership
  const { data: existingMembership } = await adminClient
    .from("memberships")
    .select("*")
    .eq("user_id", record.user_id)
    .eq("branch_id", record.branch_id)
    .maybeSingle();

  if (existingMembership) {
    // Update existing membership
    await adminClient
      .from("memberships")
      .update({
        plan_type: record.plan_type,
        plan_name: record.plan_name,
        start_date: now,
        expiry_date: expiry,
        status: "Active"
      })
      .eq("id", existingMembership.id);
  } else {
    // Create new membership
    await adminClient
      .from("memberships")
      .insert({
        id: genId("mem"),
        user_id: record.user_id,
        branch_id: record.branch_id,
        plan_type: record.plan_type,
        plan_name: record.plan_name,
        start_date: now,
        expiry_date: expiry,
        status: "Active"
      });
  }

  // 4. Update user's membership status
  await adminClient
    .from("users")
    .update({ membership_status: "active" })
    .eq("id", record.user_id);

  // 5. Update payment verification status
  await adminClient
    .from("payment_verifications")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString()
    })
    .eq("id", record.id);

  // 6. Create a transaction record
  await adminClient
    .from("transactions")
    .insert({
      id: genId("tx"),
      branch_id: record.branch_id,
      type: "Income",
      category: "Membership",
      amount: record.plan_price,
      date: todayIso(),
      status: "Completed",
      player: user.name
    });

  // 7. Send WhatsApp notification
  try {
    if (user.phone) {
      const message = `Congratulations ${user.name}! Your ${record.plan_name} membership at Samarth Cricket Academy (${record.branch_id.toUpperCase()} Branch) has been approved. You can now access your dashboard.`;
      await sendWhatsApp(user.phone, message);
    }
  } catch (err) {
    console.error("WhatsApp notification failed:", err);
  }

  return NextResponse.json({ ok: true });
}
