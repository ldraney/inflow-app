import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");

    let query = "SELECT * FROM reorder_alerts";
    if (limit) {
      query += ` LIMIT ${parseInt(limit, 10)}`;
    }

    const alerts = db.prepare(query).all();
    return Response.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return Response.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
