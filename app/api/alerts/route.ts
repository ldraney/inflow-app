import { db } from "@/lib/db";
import { reorderAlerts } from "inflow-materialize/schemas";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");

    const query = db.select().from(reorderAlerts).$dynamic();
    const alerts = limit
      ? query.limit(parseInt(limit, 10)).all()
      : query.all();

    return Response.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return Response.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
