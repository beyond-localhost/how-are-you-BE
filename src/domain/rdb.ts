import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";

const IN_MEMORY_PATH = ":memory:";

export function createSQLiteDatabase(path = "sqlite.db") {
  return drizzle(new Database(path), { schema: { ...schema } });
}

export type Conn = ReturnType<typeof createSQLiteDatabase>;
