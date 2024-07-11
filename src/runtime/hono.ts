import { OpenAPIHono, createRoute, z, type RouteConfig } from "@hono/zod-openapi";
import { deleteCookie, getSignedCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { createDrizzle, createConnection, type Conn } from "src/domain/rdb";
import { resolveEnv, type Env } from "src/env";
import type { Session, User } from "../domain/user.entity.ts";
import { findUserBySessionId } from "../domain/user.repository.ts";
import { safeAsyncRun } from "../lib/async.ts";

export type UnAuthorizedResponseConfig = RouteConfig["responses"]["401"];

type StaticDependency = {
  Variables: {
    conn: Conn;
    env: Env;
  };
};

export const depsMiddleware = createMiddleware<StaticDependency>(async (c, next) => {
  c.set("env", resolveEnv());
  c.set("conn", createDrizzle(createConnection()));
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

export { createRoute, z };
