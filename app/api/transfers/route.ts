import { db } from "@/lib/db";
import { transferPipeline } from "inflow-materialize/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const transfers = db.select().from(transferPipeline).all();
    return Response.json(transfers);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return Response.json(
      { error: "Failed to fetch transfers" },
      { status: 500 }
    );
  }
}
