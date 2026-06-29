import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import {
  users, memberships, paymentVerifications, enquiries, transactions,
} from "@/server/db/inMemoryDb";
import type { BranchId } from "@/types/dashboard";
import * as XLSX from "xlsx";

type Row = Record<string, string | number>;

function autoWidth(ws: XLSX.WorkSheet, rows: Row[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  ws["!cols"] = headers.map((h) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map((r) => String(r[h] ?? "").length)
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });
}

function makeSheet(rows: Row[]): XLSX.WorkSheet {
  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ "Info": "No data available" }]);
  autoWidth(ws, rows);
  return ws;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";
  const branchId = (searchParams.get("branch") || "samarth") as BranchId;
  const branch = branchId === "samarth" ? "Samarth" : "AIMS";
  const date = new Date().toISOString().slice(0, 10);

  // ── Build data arrays ─────────────────────────────────────────────────────

  const clientRows: Row[] = users.listByBranch(branchId).map((u) => ({
    "Name": u.name,
    "Email": u.email,
    "Phone": u.phone || "-",
    "Branch": u.branch_id || "-",
    "Membership Status": u.membership_status,
    "Role": u.role,
    "Profile Complete": u.isProfileComplete ? "Yes" : "No",
  }));

  const membershipRows: Row[] = memberships.listByBranch(branchId).map((m) => {
    const user = users.getById(m.user_id);
    return {
      "Player Name": user?.name || m.user_id,
      "Email": user?.email || "-",
      "Phone": user?.phone || "-",
      "Plan": m.plan_name,
      "Type": m.plan_type,
      "Start Date": m.start_date,
      "Expiry Date": m.expiry_date,
      "Status": m.status,
      "Branch": m.branch_id,
    };
  });

  const revenueRows: Row[] = paymentVerifications.list(branchId).map((p) => ({
    "Player Name": p.name,
    "Email": p.email,
    "Phone": p.phone,
    "Plan": p.plan_name,
    "Plan Type": p.plan_type,
    "Amount (₹)": p.plan_price,
    "Status": p.status,
    "UTR Number": p.utr_number,
    "Date": new Date(p.created_at).toLocaleDateString("en-IN"),
    "Branch": p.branch_id,
  }));

  const txRows: Row[] = transactions.listByBranch(branchId).map((t) => ({
    "Type": t.type,
    "Category": t.category,
    "Player / Description": t.player,
    "Amount (₹)": t.amount,
    "Status": t.status,
    "Date": t.date,
    "Branch": t.branch_id,
  }));

  const enquiryRows: Row[] = enquiries.list(branchId).map((e) => ({
    "Name": e.name,
    "Phone": e.phone,
    "Email": e.email || "-",
    "Type": e.type,
    "Status": e.status,
    "Message": e.message,
    "Date": new Date(e.created_at).toLocaleDateString("en-IN"),
    "Branch": e.branch_id,
  }));

  // ── Build workbook ────────────────────────────────────────────────────────

  const wb = XLSX.utils.book_new();
  let filename: string;

  if (type === "all") {
    XLSX.utils.book_append_sheet(wb, makeSheet(clientRows), "Clients");
    XLSX.utils.book_append_sheet(wb, makeSheet(membershipRows), "Memberships");
    XLSX.utils.book_append_sheet(wb, makeSheet(revenueRows), "Revenue");
    XLSX.utils.book_append_sheet(wb, makeSheet(txRows), "Transactions");
    XLSX.utils.book_append_sheet(wb, makeSheet(enquiryRows), "Enquiries");
    filename = `${branch}_Full_Report_${date}.xlsx`;
  } else {
    const sheetMap: Record<string, { rows: Row[]; name: string }> = {
      clients:      { rows: clientRows,     name: "Clients" },
      memberships:  { rows: membershipRows, name: "Memberships" },
      revenue:      { rows: revenueRows,    name: "Revenue" },
      transactions: { rows: txRows,         name: "Transactions" },
      enquiries:    { rows: enquiryRows,    name: "Enquiries" },
    };
    const entry = sheetMap[type];
    if (!entry) {
      return NextResponse.json({ ok: false, error: "UNKNOWN_TYPE" }, { status: 400 });
    }
    XLSX.utils.book_append_sheet(wb, makeSheet(entry.rows), entry.name);
    filename = `${branch}_${entry.name}_${date}.xlsx`;
  }

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
