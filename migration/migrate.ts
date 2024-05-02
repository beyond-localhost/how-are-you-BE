import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

export async function runMigrate(dbPath = "sqlite.db") {
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);
  await migrate(db, { migrationsFolder: "drizzle" });
}
