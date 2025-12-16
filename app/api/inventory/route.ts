import { db } from "@/lib/db";
import { productInventoryStatus } from "inflow-materialize/schemas";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");

    const query = db.select().from(productInventoryStatus).$dynamic();
    const inventory = limit
      ? query.limit(parseInt(limit, 10)).all()
      : query.all();

    return Response.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return Response.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
