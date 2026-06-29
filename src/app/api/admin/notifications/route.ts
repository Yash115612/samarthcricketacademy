import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { notifications } from "@/server/db/inMemoryDb";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const branchId = user.branch_id;
  const list = notifications.listByUser(user.user_id, branchId);
  
  return NextResponse.json({ ok: true, notifications: list });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id, all } = await req.json();

  if (all) {
    notifications.markAllAsRead(user.user_id, user.branch_id);
  } else if (id) {
    notifications.markAsRead(id);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id, all } = await req.json();
  if (all) {
    const list = notifications.listByUser(user.user_id, user.branch_id);
    list.forEach(n => notifications.delete(n.id));
  } else if (id) {
    notifications.delete(id);
  }

  return NextResponse.json({ ok: true });
}
