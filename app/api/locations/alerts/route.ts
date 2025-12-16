import { db } from "@/lib/db";
import { locationReorderAlerts } from "inflow-materialize/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const alerts = db.select().from(locationReorderAlerts).all();
    return Response.json(alerts);
  } catch (error) {
    console.error("Error fetching location reorder alerts:", error);
    return Response.json(
      { error: "Failed to fetch location reorder alerts" },
      { status: 500 }
    );
  }
}
