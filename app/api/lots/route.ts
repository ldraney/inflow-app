import { db } from "@/lib/db";
import { lotInventory } from "inflow-materialize/schemas";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");

    const query = db.select().from(lotInventory).$dynamic();
    const lots = limit ? query.limit(parseInt(limit, 10)).all() : query.all();

    return Response.json(lots);
  } catch (error) {
    console.error("Error fetching lot inventory:", error);
    return Response.json(
      { error: "Failed to fetch lot inventory" },
      { status: 500 }
    );
  }
}
