import { createUserProfile, createUserWorries, findUserProfileByUserId } from "src/domain/user.repository";
import { type DateTime, makeDateTime } from "src/lib/date";
import { createRoute, honoAuthApp, z } from "src/runtime/hono";
import { unAuthorizedResponse } from "./response.ts";

const user = honoAuthApp();

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
                  worries: z.array(z.object({ id: z.number(), text: z.string() })),
                })
                .nullable(),
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

    const user = c.var.sessionResult.data.user;
    const profile = await findUserProfileByUserId(c.var.conn, user.id);

    return c.json(
      {
        id: user.id,
        profile:
          profile == null
            ? null
            : ({
                nickname: profile.nickname,
                birthday: profile.birthday,
                job: profile.job.job,
                worries: profile.userProfilesToWorries.map(({ worry }) => ({ id: worry.id, text: worry.worry })),
              } as const),
      } as const,
      200,
    );
  },
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
              gender: z.union([z.literal("male"), z.literal("female"), z.literal("none")]),
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
      401: unAuthorizedResponse,
    },
  }),
  async (c) => {
    if (!c.var.sessionResult.ok) {
      return c.json({ code: 401 as const, error: "유효하지 않은 세션입니다" }, 401);
    }

    const { birthday, gender: genderCandidate, jobId, nickname, worryIds } = c.req.valid("json");
    let birthdayDateTime: DateTime;
    try {
      birthdayDateTime = makeDateTime(birthday.year, birthday.month, birthday.day);
    } catch {
      return c.json({ code: 400 as const, error: "유효하지 않은 생년월일입니다" }, 400);
    }

    const gender = genderCandidate === "none" ? null : genderCandidate;
    const profile = await createUserProfile(c.var.conn, {
      id: c.var.sessionResult.data.userId,
      gender,
      jobId,
      nickname,
      birthday: birthdayDateTime,
    });

    await createUserWorries(
      c.var.conn,
      worryIds.map((worryId) => ({ worryId, userProfileId: profile.id })),
    );

    return c.json({ ok: true as const }, 201);
  },
);

export default user;
