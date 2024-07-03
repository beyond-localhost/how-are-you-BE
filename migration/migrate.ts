import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { createDrizzle, createSQLite } from "../src/domain/rdb";

export async function runMigrate(dbPath = "sqlite.db") {
  const db = createDrizzle(createSQLite(dbPath));
  await migrate(db, { migrationsFolder: "drizzle" });
}
