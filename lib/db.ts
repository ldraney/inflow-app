import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "inflow.db");

const sqlite = new Database(dbPath, { readonly: true });
export const db = drizzle(sqlite);
export { sqlite };
