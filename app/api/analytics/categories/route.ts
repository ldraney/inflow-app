import { sqlite } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT
        c.category_id,
        c.name as category_name,
        c.is_active,
        COUNT(DISTINCT p.product_id) as product_count,
        COALESCE(SUM(CAST(ps.quantity_on_hand AS REAL)), 0) as total_on_hand,
        COALESCE(SUM(CAST(ps.quantity_available AS REAL)), 0) as total_available,
        COALESCE(SUM(CAST(ps.quantity_on_order AS REAL)), 0) as total_on_order,
        COALESCE(SUM(CAST(ps.quantity_reserved AS REAL)), 0) as total_reserved
      FROM categories c
      LEFT JOIN products p ON c.category_id = p.category_id
      LEFT JOIN product_summary ps ON p.product_id = ps.product_id
      GROUP BY c.category_id
      ORDER BY total_on_hand DESC
    `;

    const categories = sqlite.prepare(query).all();

    return Response.json(categories);
  } catch (error) {
    console.error("Error fetching category summary:", error);
    return Response.json(
      { error: "Failed to fetch category summary" },
      { status: 500 }
    );
  }
}
