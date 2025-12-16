import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'inflow.db');

let _db: DatabaseType | null = null;

export function getDb(): DatabaseType {
  if (!_db) {
    _db = new Database(dbPath, { readonly: true });
  }
  return _db;
}

// Lazy getter for backwards compatibility
export const db = {
  prepare: (sql: string) => getDb().prepare(sql),
};
