import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { createSQLiteDatabase, type Conn } from "src/domain/rdb";
import { resolveEnv, type Env } from "src/env";

type StaticDependency = {
  Variables: {
    conn: Conn;
    env: Env;
  };
};
const env = resolveEnv();
const db = createSQLiteDatabase();

export const depsMiddleware = createMiddleware<StaticDependency>(
  async (c, next) => {
    c.set("env", env);
    c.set("conn", db);
    await next();
  }
);

type Foo = { ok: true; foo: "bar" } | { ok: false };
export const userSessionMiddleware = createMiddleware<{
  Variables: { foo: Foo };
}>(async (c, next) => {
  c.set("foo", { ok: true, foo: "bar" });
  await next();
});

export const honoApp = () => {
  const app = new OpenAPIHono<StaticDependency>({
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

  return app;
};

export { z, createRoute };
