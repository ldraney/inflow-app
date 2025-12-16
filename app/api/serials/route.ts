import { db } from "@/lib/db";
import { serialInventory } from "inflow-materialize/schemas";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");

    const query = db.select().from(serialInventory).$dynamic();
    const serials = limit
      ? query.limit(parseInt(limit, 10)).all()
      : query.all();

    return Response.json(serials);
  } catch (error) {
    console.error("Error fetching serial inventory:", error);
    return Response.json(
      { error: "Failed to fetch serial inventory" },
      { status: 500 }
    );
  }
}
