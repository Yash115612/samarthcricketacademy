import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { paymentVerifications, users, ensureDbSynced } from "@/server/db/inMemoryDb";
import { getPlanById } from "@/data/plans";
import type { BranchId } from "@/types/dashboard";
import { rateLimit, getIP } from "@/server/security/rateLimiter";
import { z } from "zod";

const submitSchema = z.object({
  branch_id: z.enum(["samarth", "aims"]),
  plan_id: z.string().min(1),
  utr_number: z.string().min(6).max(50).trim(),
  screenshot_url: z.string().url(),
  plan_type: z.enum(["monthly", "pt"]).optional().default("monthly"),
});

export async function POST(req: Request) {
  const ip = getIP(req);
  if (!rateLimit(`payment_${ip}`, 10, 24 * 60 * 60 * 1000)) { // 10 payment submissions per day per IP
    return NextResponse.json({ ok: false, error: "TOO_MANY_REQUESTS", message: "Too many payment submission attempts. Please contact support if this is a mistake." }, { status: 429 });
  }

  await ensureDbSynced();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED", message: "Please sign in first." }, { status: 401 });
  }

  const userId = (session.user as any).user_id;
  const user = users.getById(userId);
  if (!user) {
    return NextResponse.json({ ok: false, error: "USER_NOT_FOUND" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null));
  if (!body) return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });

  const result = submitSchema.safeParse(body);
  if (!result.success) {
    const error = result.error.issues[0]?.message || "Invalid input";
    return NextResponse.json({ ok: false, error: "VALIDATION_ERROR", message: error }, { status: 400 });
  }

  const { branch_id, plan_id, utr_number, screenshot_url, plan_type } = result.data;

  const plan = getPlanById(plan_id);
  if (!plan) return NextResponse.json({ ok: false, error: "PLAN_INVALID" }, { status: 400 });

  // Check for existing pending submission by user_id+branch
  const existing = paymentVerifications.getPendingByUserBranch(user.id, branch_id as BranchId);
  if (existing) {
    return NextResponse.json({ ok: false, error: "ALREADY_PENDING", message: "A pending payment already exists. Please wait for admin approval." }, { status: 409 });
  }

  const record = paymentVerifications.create({
    user_id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    plan_name: plan.label,
    plan_type: plan_type,
    plan_price: plan.price,
    plan_duration_days: plan.duration_days,
    branch_id: branch_id as BranchId,
    utr_number,
    screenshot_url,
  });

  // Update user's membership status to pending
  users.updateProfile(user.id, { membership_status: "pending" });

  return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
}
