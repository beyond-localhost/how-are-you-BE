import { migrate } from "drizzle-orm/mysql2/migrator";
import type { Env } from "../src/env";
import { createMYSQLConnection, createMYSQLDrizzleConnection } from "../src/domain/rdb";

export async function runMigrate(option: Env["Database"]) {
  const connection = await createMYSQLConnection(option);
  const drizzle = createMYSQLDrizzleConnection(connection, true);
  await migrate(drizzle, { migrationsFolder: "drizzle" });
  await connection.end();
}
