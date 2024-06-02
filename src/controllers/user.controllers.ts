import { honoApp, z, createRoute } from "src/runtime/hono";
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from "hono/cookie";
import { safeAsyncRun } from "src/lib/async";
import { findUserBySessionId } from "src/domain/user.repository";

const user = honoApp();

user.openapi(
  createRoute({
    tags: ["User"],
    method: "get",
    path: "/users/me",
    responses: {
      200: {
        description: "유저 정보를 반환합니다",
        content: {
          "application/json": {
            schema: z.object({
              id: z.number(),
              profile: z
                .object({
                  nickname: z.string(),
                  birthday: z.string(),
                  job: z.string(),
                })
                .nullable(),
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

    return c.json(
      {
        id: user.id,
        profile:
          user.profile === null
            ? null
            : ({
                nickname: user.profile.nickname,
                birthday: user.profile.birthday,
                job: user.profile.job.job,
              } as const),
      } as const,
      200
    );
  }
);

export default user;
