import { createViews } from "inflow-materialize";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "inflow.db");

console.log("Creating materialized views...");

try {
  const db = new Database(dbPath);
  createViews(db);
  db.close();
  console.log("Views created successfully!");
} catch (error) {
  console.error("Failed to create views:", error);
  process.exit(1);
}
