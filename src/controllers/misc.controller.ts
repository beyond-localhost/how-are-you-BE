import { findAllJobs, findAllWorries } from "src/domain/misc.repository";
import { createRoute, honoAuthApp, userSessionMiddleware, z } from "src/runtime/hono";
import nickname from "src/static/nickname.json";
import { unAuthorizedResponse } from "./response.ts";

const misc = honoAuthApp();

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
            schema: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
              }),
            ),
          },
        },
      },
      401: unAuthorizedResponse,
    },
    middleware: [userSessionMiddleware],
  }),
  async (c) => {
    if (!c.var.sessionResult.ok) {
      return c.json({ code: 401 as const, error: "유효하지 않은 세션입니다" }, 401);
    }

    const jobs = await findAllJobs(c.var.conn);

    return c.json(
      jobs.map((job) => ({ id: job.id, name: job.job })),
      200,
    );
  },
);

misc.openapi(
  createRoute({
    tags: ["Misc"],
    method: "get",
    path: "/worries",
    responses: {
      200: {
        description: "걱정들을 반환합니다. 걱정 마세요, 우리 삶에서 걱정은 별로 없으니까요",
        content: {
          "application/json": {
            schema: z.object({
              worries: z.array(
                z.object({
                  id: z.number(),
                  name: z.string(),
                }),
              ),
            }),
          },
        },
      },
      401: unAuthorizedResponse,
    },
  }),
  async (c) => {
    if (!c.var.sessionResult.ok) {
      return c.json({ code: 401 as const, error: "유효하지 않은 세션입니다" }, 401);
    }

    const worries = await findAllWorries(c.var.conn);
    return c.json(
      {
        worries: worries.map((worry) => ({ id: worry.id, name: worry.worry })),
      },
      200,
    );
  },
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
      401: unAuthorizedResponse,
    },
  }),
  async (c) => {
    if (!c.var.sessionResult.ok) {
      return c.json({ code: 401 as const, error: "유효하지 않은 세션입니다" }, 401);
    }
    const ret = nickname.ret[Math.floor(Math.random() * nickname.ret.length)] || "춤추는 세명";
    return c.json({ nickname: ret }, 200);
  },
);

export default misc;
