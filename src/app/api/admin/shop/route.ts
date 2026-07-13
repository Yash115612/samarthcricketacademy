import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getAdminBranchId } from "@/server/branch";
import { genId } from "@/lib/utils";

export async function GET() {
  try {
    const branchId = getAdminBranchId();
    const { data: list, error } = await adminClient
      .from("products")
      .select("*")
      .eq("branch_id", branchId);
    
    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json({ ok: false, error: "Failed to fetch products" }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true, products: list });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const branchId = getAdminBranchId();
    const body = await req.json();
    const { data: p, error } = await adminClient
      .from("products")
      .insert({ 
        id: genId("prod"), 
        ...body, 
        branch_id: branchId 
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating product:", error);
      return NextResponse.json({ ok: false, error: "Failed to create product" }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true, product: p });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to create product" }, { status: 500 });
  }
}
