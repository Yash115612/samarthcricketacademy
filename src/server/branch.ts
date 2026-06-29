import { cookies as nextCookies } from "next/headers";
import type { BranchId } from "@/types/dashboard";

export function getAdminBranchId(): BranchId {
  const cookieStore = nextCookies();
  const branchId = cookieStore.get("admin_current_branch_id")?.value;
  return branchId || "samarth";
}
