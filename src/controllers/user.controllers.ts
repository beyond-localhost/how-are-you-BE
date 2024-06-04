import { deleteCookie, getSignedCookie } from "hono/cookie";
import {
  createUserProfile,
  findUserBySessionId,
} from "src/domain/user.repository";
import { safeAsyncRun } from "src/lib/async";
import { makeDateTime, type DateTime } from "src/lib/date";
import { createRoute, honoApp, z } from "src/runtime/hono";

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
                  worries: z.array(
                    z.object({ id: z.number(), text: z.string() })
                  ),
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
                worries: user.profile.userProfilesToWorries.map(
                  ({ worry }) => ({ id: worry.id, text: worry.worry })
                ),
              } as const),
      } as const,
      200
    );
  }
);

user.openapi(
  createRoute({
    tags: ["User"],
    method: "post",
    path: "/users/me/profile",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              nickname: z.string(),
              birthday: z.object({
                year: z.number(),
                month: z.number(),
                day: z.number(),
              }),
              jobId: z.number(),
              worryIds: z.tuple([z.number()]).rest(z.number()),
              gender: z.union([
                z.literal("male"),
                z.literal("female"),
                z.literal("none"),
              ]),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description:
          "유저 프로필이 정상적으로 생성되었습니다. 요청을 보낼 때 전달한 값으로 유저 상태를 업데이트 하거나 유저 정보를 다시 요청해주세요",
        content: {
          "application/json": {
            schema: z.object({
              ok: z.literal(true),
            }),
          },
        },
      },
      400: {
        description: "Form으로 전달된 값이 유효하지 않은 경우에 해당합니다.",
        content: {
          "application/json": {
            schema: z.object({ code: z.literal(400), error: z.string() }),
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

    const {
      birthday,
      gender: genderCandidate,
      jobId,
      nickname,
      worryIds,
    } = c.req.valid("json");
    let birthdayDateTime: DateTime;
    try {
      birthdayDateTime = makeDateTime(
        birthday.year,
        birthday.month,
        birthday.day
      );
    } catch {
      return c.json(
        { code: 400 as const, error: "유효하지 않은 생년월일입니다" },
        400
      );
    }

    const gender = genderCandidate === "none" ? null : genderCandidate;
    await createUserProfile(c.var.conn, {
      gender,
      jobId,
      nickname,
      birthday: birthdayDateTime,
    });
    return c.json({ ok: true as const }, 201);
  }
);

export default user;
