import { db } from "@/lib/db";
import { orderHistory, openOrdersUnified } from "inflow-materialize/schemas";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    if (status === "open") {
      const query = db.select().from(openOrdersUnified).$dynamic();
      const orders = limit
        ? query.limit(parseInt(limit, 10)).all()
        : query.all();
      return Response.json(orders);
    }

    const query = db.select().from(orderHistory).$dynamic();
    const orders = limit
      ? query.limit(parseInt(limit, 10)).all()
      : query.all();
    return Response.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
