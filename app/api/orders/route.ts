import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    let query: string;
    if (status === "open") {
      query = "SELECT * FROM open_orders_unified";
    } else {
      query = "SELECT * FROM order_history";
    }

    if (limit) {
      query += ` LIMIT ${parseInt(limit, 10)}`;
    }

    const orders = db.prepare(query).all();
    return Response.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
