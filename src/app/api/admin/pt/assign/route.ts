import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { enquiries, users } from "@/server/db/inMemoryDb";
import { sendWhatsApp } from "@/lib/sms";
import { getAdminBranchId } from "@/server/branch";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const branchId = getAdminBranchId();
  const body = (await req.json().catch(() => null)) as {
    user_id?: string;
    phone?: string; // If user doesn't exist, we find by phone or create
    coach_name?: string;
    duration_days?: number;
    enquiry_id?: string;
  } | null;

  if (!body) return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });

  const { user_id, phone, coach_name, duration_days, enquiry_id } = body;

  let targetUserId = user_id;

  if (!targetUserId && phone) {
    const user = users.getByPhone(phone);
    if (user) targetUserId = user.id;
  }

  if (!targetUserId) {
    return NextResponse.json({ ok: false, error: "USER_REQUIRED", message: "User must have an account first." }, { status: 400 });
  }

  const result = enquiries.assignPT({
    user_id: targetUserId,
    branch_id: branchId,
    coach_name: coach_name || "Head Coach",
    duration_days: duration_days || 30,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  // Update enquiry status if applicable
  if (enquiry_id) {
    enquiries.updateStatus(enquiry_id, "assigned");
  }

  // Send WhatsApp notification
  try {
    const user = users.getById(targetUserId);
    if (user && user.phone) {
      const message = `Congratulations ${user.name}! Your Personal Training membership has been assigned. Your coach will be ${coach_name || "Head Coach"}. Login to your dashboard to see details.`;
      await sendWhatsApp(user.phone, message);
    }
  } catch (err) {
    console.error("WhatsApp notification failed:", err);
  }

  return NextResponse.json({ ok: true });
}

