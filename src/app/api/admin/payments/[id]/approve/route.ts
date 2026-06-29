import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { paymentVerifications, users } from "@/server/db/inMemoryDb";
import { sendWhatsApp } from "@/lib/sms";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const record = paymentVerifications.getById(params.id);
  if (!record) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  const result = paymentVerifications.approve(params.id);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
  }

  // Send WhatsApp notification on approval
  try {
    const user = users.getById(record.user_id);
    if (user && user.phone) {
      const message = `Congratulations ${user.name}! Your ${record.plan_name} membership at Samarth Cricket Academy (${record.branch_id.toUpperCase()} Branch) has been approved. You can now access your dashboard.`;
      await sendWhatsApp(user.phone, message);
    }
  } catch (err) {
    console.error("WhatsApp notification failed:", err);
  }

  return NextResponse.json({ ok: true });
}
