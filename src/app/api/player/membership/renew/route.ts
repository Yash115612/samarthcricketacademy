import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { adminClient } from "@/lib/supabase";
import { genId } from "@/lib/utils";

function addDaysIso(dateIso: string, days: number) {
  const d = new Date(dateIso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.user_id;
  const role = session?.user?.role;
  const branch_id = session?.user?.branch_id;

  if (!userId || role !== "player" || !branch_id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const { data: user, error: userError } = await adminClient
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError || !user || user.role !== "player" || user.branch_id !== branch_id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { plan_name?: unknown } | null;
  const planName = typeof body?.plan_name === "string" && body.plan_name.trim() ? body.plan_name.trim() : "2 Months Plan";
  const planType = planName === "Personal Training" ? "pt" : "monthly";
  const startDate = todayIso();
  const expiryDate = addDaysIso(startDate, planType === "monthly" ? 60 : 30);

  const { data: existingMembership, error: membershipError } = await adminClient
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("branch_id", branch_id)
    .maybeSingle();

  let updatedMembership;

  if (existingMembership) {
    const { data: updated, error: updateError } = await adminClient
      .from("memberships")
      .update({
        plan_type: planType,
        plan_name: planName,
        start_date: startDate,
        expiry_date: expiryDate,
        status: "Active",
      })
      .eq("id", existingMembership.id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    updatedMembership = updated;
  } else {
    const { data: newMem, error: insertError } = await adminClient
      .from("memberships")
      .insert({
        id: genId("mem"),
        user_id: userId,
        branch_id,
        plan_type: planType,
        plan_name: planName,
        start_date: startDate,
        expiry_date: expiryDate,
        status: "Active",
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    updatedMembership = newMem;
  }

  return NextResponse.json({
    ok: true,
    membership: {
      plan_name: updatedMembership.plan_name,
      start_date: updatedMembership.start_date,
      expiry_date: updatedMembership.expiry_date,
      status: updatedMembership.status,
      expiring_soon: false, // TODO: implement isExpiringSoon
    },
  });
}

