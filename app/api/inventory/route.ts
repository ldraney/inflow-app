import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");

    let query = "SELECT * FROM product_inventory_status";
    if (limit) {
      query += ` LIMIT ${parseInt(limit, 10)}`;
    }

    const inventory = db.prepare(query).all();
    return Response.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return Response.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
