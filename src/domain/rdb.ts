import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const IN_MEMORY_PATH = ":memory:";

export function createSQLite(path = "sqlite.db") {
  const sqlite = new Database(path);
  console.log("Try to enable foreign key constraints..");
  sqlite.exec("PRAGMA foreign_keys = ON");
  console.log(sqlite.query(`PRAGMA foreign_keys;`).values());
  return sqlite;
}

export function createDrizzle(db: Database) {
  return drizzle(db, { schema: { ...schema }, logger: false });
}

export type Conn = ReturnType<typeof createDrizzle>;
