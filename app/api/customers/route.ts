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
        c.customer_id,
        c.name,
        c.customer_code,
        c.is_active,
        c.remarks,
        COUNT(DISTINCT so.sales_order_id) as order_count,
        COALESCE(SUM(CAST(so.total AS REAL)), 0) as total_revenue,
        MAX(so.order_date) as last_order_date
      FROM customers c
      LEFT JOIN sales_orders so ON c.customer_id = so.customer_id
    `;

    const params: (string | number)[] = [];

    if (search) {
      query += ` WHERE c.name LIKE ? OR c.customer_code LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY c.customer_id ORDER BY total_revenue DESC`;

    if (limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(limit, 10));
    }

    const customers = sqlite.prepare(query).all(...params);

    return Response.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return Response.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
