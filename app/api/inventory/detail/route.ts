import { db } from "@/lib/db";
import { inventoryDetail } from "inflow-materialize/schemas";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");

    let results;
    if (productId) {
      results = db
        .select()
        .from(inventoryDetail)
        .where(eq(inventoryDetail.productId, productId))
        .all();
    } else {
      results = db.select().from(inventoryDetail).all();
    }

    return Response.json(results);
  } catch (error) {
    console.error("Error fetching inventory detail:", error);
    return Response.json(
      { error: "Failed to fetch inventory detail" },
      { status: 500 }
    );
  }
}
