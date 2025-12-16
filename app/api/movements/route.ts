import { db } from "@/lib/db";
import { stockMovementLedger } from "inflow-materialize/schemas";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");

    const query = db.select().from(stockMovementLedger).$dynamic();
    const movements = limit
      ? query.limit(parseInt(limit, 10)).all()
      : query.all();

    return Response.json(movements);
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return Response.json(
      { error: "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}
