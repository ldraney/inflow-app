import { sqlite } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");

    let query = `
      SELECT
        v.vendor_id,
        v.name,
        v.vendor_code,
        v.is_active,
        v.remarks,
        COUNT(DISTINCT po.purchase_order_id) as order_count,
        COALESCE(SUM(CAST(po.total AS REAL)), 0) as total_spend,
        MAX(po.order_date) as last_order_date,
        COUNT(DISTINCT vi.product_id) as products_supplied
      FROM vendors v
      LEFT JOIN purchase_orders po ON v.vendor_id = po.vendor_id
      LEFT JOIN vendor_items vi ON v.vendor_id = vi.vendor_id
    `;

    const params: (string | number)[] = [];

    if (search) {
      query += ` WHERE v.name LIKE ? OR v.vendor_code LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY v.vendor_id ORDER BY total_spend DESC`;

    if (limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(limit, 10));
    }

    const vendors = sqlite.prepare(query).all(...params);

    return Response.json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return Response.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
