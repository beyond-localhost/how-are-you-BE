import { createRoute, OpenAPIHono, type RouteConfig, z } from "@hono/zod-openapi";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { type Conn, createSQLiteDatabase } from "src/domain/rdb";
import { type Env, resolveEnv } from "src/env";
import type { Session, User } from "../domain/user.entity.ts";
import { safeAsyncRun } from "../lib/async.ts";
import { deleteCookie, getSignedCookie } from "hono/cookie";
import { findUserBySessionId } from "../domain/user.repository.ts";

export type UnAuthorizedResponseConfig = RouteConfig["responses"]["401"];

type StaticDependency = {
  Variables: {
    conn: Conn;
    env: Env;
  };
};
const env = resolveEnv();
const db = createSQLiteDatabase();

export const depsMiddleware = createMiddleware<StaticDependency>(async (c, next) => {
  c.set("env", env);
  c.set("conn", db);
  await next();
});

type UserSessionDependency = {
  Variables: {
    sessionResult: { ok: true; data: Session & { user: User } } | { ok: false };
  };
};

export const userSessionMiddleware = createMiddleware<StaticDependency & UserSessionDependency>(async (c, next) => {
  const sidResult = await safeAsyncRun(() => getSignedCookie(c, c.var.env.Credential.JWTSecret, "sid"));

  if (!sidResult) {
    deleteCookie(c, "sid");
    c.set("sessionResult", { ok: false as const });
  } else {
    const user = await findUserBySessionId(c.var.conn, Number(sidResult));
    if (!user) {
      deleteCookie(c, "sid");
      c.set("sessionResult", { ok: false as const });
    } else {
      c.set("sessionResult", { ok: true, data: user });
    }
  }
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

export const honoAuthApp = () => {
  const app = new OpenAPIHono<StaticDependency & UserSessionDependency>({
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
  app.use(userSessionMiddleware);
  return app;
};

export { z, createRoute };
