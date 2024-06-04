import { deleteCookie, getSignedCookie } from "hono/cookie";
import { findAllJobs, findAllWorries } from "src/domain/misc.repository";
import { findUserBySessionId } from "src/domain/user.repository";
import { safeAsyncRun } from "src/lib/async";
import {
  createRoute,
  honoApp,
  userSessionMiddleware,
  z,
} from "src/runtime/hono";
import nickname from "src/static/nickname.json";

const misc = honoApp();

misc.openapi(
  createRoute({
    tags: ["Misc"],
    method: "get",
    path: "/jobs",
    responses: {
      200: {
        description: "직업 목록을 반환합니다",
        content: {
          "application/json": {
            schema: z.object({
              jobs: z.array(
                z.object({
                  id: z.number(),
                  name: z.string(),
                })
              ),
            }),
          },
        },
      },
      401: {
        description:
          "세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다!",
        content: {
          "application/json": {
            schema: z.object({
              code: z.literal(401),
              error: z.string(),
            }),
          },
        },
      },
    },
    middleware: [userSessionMiddleware],
  }),
  async (c) => {
    const stringifiedSid = await safeAsyncRun(() =>
      getSignedCookie(c, c.var.env.Credential.JWTSecret, "sid")
    );
    if (!stringifiedSid) {
      await deleteCookie(c, "sid");
      return c.json(
        { code: 401 as const, error: "유효하지 않은 세션입니다" },
        401
      );
    }

    const user = await findUserBySessionId(c.var.conn, Number(stringifiedSid));
    if (!user) {
      await deleteCookie(c, "sid");
      return c.json(
        { code: 401 as const, error: "유효하지 않은 세션입니다" },
        401
      );
    }

    const jobs = await findAllJobs(c.var.conn);
    return c.json(
      {
        jobs: jobs.map((job) => ({ id: job.id, name: job.job })),
      },
      200
    );
  }
);

misc.openapi(
  createRoute({
    tags: ["Misc"],
    method: "get",
    path: "/worries",
    responses: {
      200: {
        description:
          "걱정들을 반환합니다. 걱정 마세요, 우리 삶에서 걱정은 별로 없으니까요",
        content: {
          "application/json": {
            schema: z.object({
              worries: z.array(
                z.object({
                  id: z.number(),
                  name: z.string(),
                })
              ),
            }),
          },
        },
      },
      401: {
        description:
          "세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다!",
        content: {
          "application/json": {
            schema: z.object({
              code: z.literal(401),
              error: z.string(),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const stringifiedSid = await safeAsyncRun(() =>
      getSignedCookie(c, c.var.env.Credential.JWTSecret, "sid")
    );
    if (!stringifiedSid) {
      await deleteCookie(c, "sid");
      return c.json(
        { code: 401 as const, error: "유효하지 않은 세션입니다" },
        401
      );
    }

    const user = await findUserBySessionId(c.var.conn, Number(stringifiedSid));
    if (!user) {
      await deleteCookie(c, "sid");
      return c.json(
        { code: 401 as const, error: "유효하지 않은 세션입니다" },
        401
      );
    }

    const worries = await findAllWorries(c.var.conn);
    return c.json(
      {
        worries: worries.map((worry) => ({ id: worry.id, name: worry.worry })),
      },
      200
    );
  }
);

misc.openapi(
  createRoute({
    tags: ["User"],
    method: "get",
    path: "/recommendation_nickname",
    responses: {
      200: {
        description: "추천 닉네임을 올바르게 조회한 경우에 해당합니다.",
        content: {
          "application/json": {
            schema: z.object({ nickname: z.string() }),
          },
        },
      },
      401: {
        description:
          "세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다!",
        content: {
          "application/json": {
            schema: z.object({
              code: z.literal(401),
              error: z.string(),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const stringifiedSid = await safeAsyncRun(() =>
      getSignedCookie(c, c.var.env.Credential.JWTSecret, "sid")
    );
    if (!stringifiedSid) {
      await deleteCookie(c, "sid");
      return c.json(
        { code: 401 as const, error: "유효하지 않은 세션입니다" },
        401
      );
    }

    const user = await findUserBySessionId(c.var.conn, Number(stringifiedSid));
    if (!user) {
      await deleteCookie(c, "sid");
      return c.json(
        { code: 401 as const, error: "유효하지 않은 세션입니다" },
        401
      );
    }
    const ret =
      nickname.ret[Math.floor(Math.random() * nickname.ret.length)] ||
      "춤추는 세명";
    return c.json({ nickname: ret }, 200);
  }
);
