import { migrate } from "migration/migrate";
import { test as base, describe, inject } from "vitest";
import type { Conn } from "~/domain/rdb";
import { resolveTestENV, type Env } from "~/env";

import { runSeed } from "seed/seed";
import { createMYSQLConnection, createMYSQLDrizzleConnection, createMYSQLPool } from "~/domain/rdb";
import { retry } from "~/lib/async";
import { createClient, type OpenAPIClient } from "./stubs/client/client";

import { createApp } from "~/runtime/app";
import getPort, { portNumbers } from "get-port";

interface Context {
  env: Env;
  conn: Conn;

  client: OpenAPIClient;
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

  client: async ({}, use) => {
    const server = await retry(
      async () => {
        const port = await getPort({ port: portNumbers(7788, 9999) });
        const server = await createApp(port);
        return server;
      },
      { maxRetryCount: 10, waitMS: 50 },
    );

    const address = server.address();
    if (address === null || typeof address === "string") {
      throw new Error("Server is not running correctly but client context invokes that server");
    }

    await use(createClient(address.port));
    await server.close();
  },
});

export { describe, test };
