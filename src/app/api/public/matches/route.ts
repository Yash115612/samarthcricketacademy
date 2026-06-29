import { NextResponse } from "next/server";
import { matches } from "@/server/db/inMemoryDb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branch") as any;
  
  const list = branchId ? matches.listByBranch(branchId) : [];
  return NextResponse.json({ ok: true, matches: list });
}
