import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { createSQLiteDatabase, type Conn } from "src/domain/rdb";
import { resolveEnv, type Env } from "src/env";

type Dependencies = {
  Variables: {
    conn: Conn;
    env: Env;
  };
};
const env = resolveEnv();
const db = createSQLiteDatabase();

const depsMiddleware = createMiddleware<Dependencies>(async (c, next) => {
  c.set("env", env);
  c.set("conn", db);
  await next();
});

export const honoApp = () => {
  const app = new OpenAPIHono<Dependencies>({
    defaultHook: (result) => {
      if (result.success) {
        return;
      }
      const err = new HTTPException(422);
      err.cause = result.error.errors;
      console.error(err);
      throw err;
    },
  });

  app.use(depsMiddleware);

  return app;
};

export { z, createRoute };
