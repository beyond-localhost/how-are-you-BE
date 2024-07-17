import { migrate as drizzleMigrate } from "drizzle-orm/mysql2/migrator";
import type { Env } from "../src/env";
import { createMYSQLConnection, createMYSQLDrizzleConnection, type Conn } from "../src/domain/rdb";

export async function migrate(instance: Conn) {
  await drizzleMigrate(instance, { migrationsFolder: "drizzle" });
}

export async function runMigrate(option: Env["Database"]) {
  const connection = await createMYSQLConnection(option);
  const drizzle = createMYSQLDrizzleConnection(connection, true);
  await migrate(drizzle);
  await connection.end();
}
