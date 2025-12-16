import { sqlite } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");

    const query = `
      SELECT
        p.product_id,
        p.name,
        p.sku,
        p.item_type,
        c.name as category_name,
        pp.unit_price as price,
        vi.cost,
        CASE
          WHEN vi.cost IS NOT NULL AND CAST(vi.cost AS REAL) > 0
          THEN ROUND((CAST(pp.unit_price AS REAL) - CAST(vi.cost AS REAL)) / CAST(vi.cost AS REAL) * 100, 1)
          ELSE NULL
        END as margin_percent,
        CASE
          WHEN vi.cost IS NOT NULL
          THEN ROUND(CAST(pp.unit_price AS REAL) - CAST(vi.cost AS REAL), 2)
          ELSE NULL
        END as margin_amount
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN product_prices pp ON p.product_id = pp.product_id AND pp.price_type = 'Default'
      LEFT JOIN (
        SELECT product_id, MIN(cost) as cost
        FROM vendor_items
        WHERE cost IS NOT NULL AND cost != ''
        GROUP BY product_id
      ) vi ON p.product_id = vi.product_id
      WHERE pp.unit_price IS NOT NULL
      ORDER BY margin_percent DESC NULLS LAST
      ${limit ? `LIMIT ${parseInt(limit, 10)}` : "LIMIT 200"}
    `;

    const products = sqlite.prepare(query).all();

    return Response.json(products);
  } catch (error) {
    console.error("Error fetching product margins:", error);
    return Response.json(
      { error: "Failed to fetch product margins" },
      { status: 500 }
    );
  }
}
