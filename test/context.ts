import type { Conn } from "~/domain/rdb";
import { resolveTestENV, type Env } from "~/env";
import { test as base, inject, describe } from "vitest";
import { migrate } from "migration/migrate";

import { createMYSQLConnection, createMYSQLPool, createMYSQLDrizzleConnection } from "~/domain/rdb";
import { retry } from "~/lib/async";
import { runSeed } from "seed/seed";

interface Context {
  env: Env;
  conn: Conn;
}

let globalId = 1;

const test = base.extend<Context>({
  env: async ({}, use) => {
    const currentPort = inject("DB_PORT");
    const currentEnv = resolveTestENV({ Database: { port: currentPort } });
    await use(currentEnv);
  },
  conn: async ({ env }, use) => {
    /**
     * MYSQL seems not to have a Postgresql 'Schema' like.
     * The 'database' should be the closest one.
     * When running parallel testing, each file should have its own database.
     * We can make a name with timestamp + global id
     */
    const currentDatabaseName = `${Date.now()}_${globalId++}`;
    const setupConnection = await retry(
      () =>
        createMYSQLConnection({
          port: env.Database.port,
          user: env.Database.user,
          password: env.Database.password,
          host: env.Database.host,
          database: env.Database.database,
        }),
      {
        maxRetryCount: 3,
        waitMS: 500,
      },
      5,
    );
    const setupConnectionDrizzle = createMYSQLDrizzleConnection(setupConnection, false);

    await setupConnection.query(`create database if not exists ${currentDatabaseName};`);
    await setupConnection.query(`use ${currentDatabaseName};`);
    try {
      await migrate(setupConnectionDrizzle);
      await runSeed(setupConnectionDrizzle);
    } catch {}
    await setupConnection.end();

    env.Database.database = currentDatabaseName;

    const pool = createMYSQLPool({
      port: env.Database.port,
      user: env.Database.user,
      password: env.Database.password,
      host: env.Database.host,
      database: env.Database.database,
    });

    await pool.query(`use ${currentDatabaseName};`);
    const drizzle = createMYSQLDrizzleConnection(pool);
    await use(drizzle);
    await pool.end();
  },
});

export { test, describe };
