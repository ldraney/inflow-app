import { db } from "@/lib/db";
import {
  inventoryByLocation,
  locationStockSummary,
} from "inflow-materialize/schemas";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get("view"); // "summary" or "detail"
    const locationId = searchParams.get("locationId");

    if (view === "summary") {
      const summary = db.select().from(locationStockSummary).all();
      return Response.json(summary);
    }

    // Default: inventory by location (detail view)
    if (locationId) {
      const inventory = db
        .select()
        .from(inventoryByLocation)
        .where(eq(inventoryByLocation.locationId, locationId))
        .all();
      return Response.json(inventory);
    }

    const inventory = db.select().from(inventoryByLocation).all();
    return Response.json(inventory);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return Response.json(
      { error: "Failed to fetch location data" },
      { status: 500 }
    );
  }
}
