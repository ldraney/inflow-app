import { sqlite } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");

    let query: string;
    let params: string[] = [];

    if (productId) {
      // Get BOM for specific product
      query = `
        SELECT
          b.item_bom_id,
          b.product_id as parent_product_id,
          p_parent.name as parent_name,
          p_parent.sku as parent_sku,
          b.child_product_id,
          p_child.name as child_name,
          p_child.sku as child_sku,
          b.quantity,
          b.uom_name,
          vi.cost as component_cost,
          ROUND(CAST(b.quantity AS REAL) * COALESCE(CAST(vi.cost AS REAL), 0), 2) as line_cost
        FROM item_boms b
        JOIN products p_parent ON b.product_id = p_parent.product_id
        JOIN products p_child ON b.child_product_id = p_child.product_id
        LEFT JOIN (
          SELECT product_id, MIN(cost) as cost
          FROM vendor_items
          WHERE cost IS NOT NULL AND cost != ''
          GROUP BY product_id
        ) vi ON b.child_product_id = vi.product_id
        WHERE b.product_id = ?
        ORDER BY p_child.name
      `;
      params = [productId];
    } else {
      // Get all parent products with BOM summary
      query = `
        SELECT
          p.product_id,
          p.name,
          p.sku,
          p.item_type,
          c.name as category_name,
          COUNT(b.item_bom_id) as component_count,
          SUM(ROUND(CAST(b.quantity AS REAL) * COALESCE(CAST(vi.cost AS REAL), 0), 2)) as total_bom_cost
        FROM products p
        JOIN item_boms b ON p.product_id = b.product_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN (
          SELECT product_id, MIN(cost) as cost
          FROM vendor_items
          WHERE cost IS NOT NULL AND cost != ''
          GROUP BY product_id
        ) vi ON b.child_product_id = vi.product_id
        GROUP BY p.product_id
        ORDER BY component_count DESC
        LIMIT 200
      `;
    }

    const results = params.length > 0
      ? sqlite.prepare(query).all(...params)
      : sqlite.prepare(query).all();

    return Response.json(results);
  } catch (error) {
    console.error("Error fetching BOM:", error);
    return Response.json(
      { error: "Failed to fetch BOM" },
      { status: 500 }
    );
  }
}
