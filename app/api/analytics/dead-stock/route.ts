import { sqlite } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const tier = searchParams.get("tier");

    let query = `SELECT * FROM dead_stock`;
    const conditions: string[] = [];

    if (tier) {
      conditions.push(`dead_stock_tier = '${tier}'`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY days_since_movement DESC`;
    query += limit ? ` LIMIT ${parseInt(limit, 10)}` : ` LIMIT 200`;

    const products = sqlite.prepare(query).all();

    return Response.json(products);
  } catch (error) {
    console.error("Error fetching dead stock:", error);
    return Response.json(
      { error: "Failed to fetch dead stock" },
      { status: 500 }
    );
  }
}
