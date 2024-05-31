import { Elysia, t } from "elysia";
import { resolveEnv } from "./env";
import { createSQLiteDatabase } from "./domain/rdb";
import { fetchKakaoToken, fetchKakaoUser } from "./lib/kakao";
import {
  DataNotFoundError,
  DataParseError,
  InputRangeError,
  JWTExpiredError,
  JWTMalformedError,
  QuestionAnswerModificationTimeLimitError,
  UnIntentionalError,
  UserAlreadyAnswerTodayQuestionError,
  dataNotFoundError,
  dataParseError,
  inputRangeError,
  isError,
  jwtExpiredError,
  jwtMalformedError,
  questionAnswerModificationTimeLimitError,
  unIntentionalError,
  userAlreadyAnswerTodayQuestionError,
} from "./core/error";
import {
  createExternalIdentities,
  createUser,
  findUserByEmail,
  findUserById,
  findUserProfileByUserId,
  createUserProfile,
  createUserJobs,
  findJobByIds,
  findUserByIdOrFailWithProfile,
  findAllJobs,
  findAllWorries,
} from "./domain/user.repository";
import jwt from "@elysiajs/jwt";
import { deserializeOAuthState, serializeOAuthState } from "./lib/oauth";
import swagger from "@elysiajs/swagger";
import {
  createTodayUserAnswer,
  deleteUserAnswerById,
  findAllQuestionAnswersByUserId,
  findTodayQuestion,
  findTodayUsersAnswerByUserId,
  findTotalQuestionsByUserId,
  findUserAnswerById,
  updateUserAnswerById,
} from "./domain/question.repository";
import nickname from "./static/nickname.json";
import cors from "@elysiajs/cors";

const env = resolveEnv();
const db = createSQLiteDatabase();

const app = new Elysia()
  .decorate("version", "1.0.0")
  .decorate("env", env)
  .decorate("conn", db)
  .get("/version", ({ version }) => version)
  .use(
    swagger({
      exclude: "/callback",
      documentation: {
        info: {
          title: "How are you - API",
          version: "1.0.0",
        },
        tags: [
          {
            name: "Auth",
            description: "Authentication related API",
          },
          {
            name: "Question",
            description: "The question related API",
          },
        ],
      },
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: env.Credential.JWTSecret,
      iss: env.Credential.JWTIssuer,
    })
  )
  .use(cors({ origin: ["localhost:5173"] }))
  .post(
    "/auth/kakao",
    ({ env, body: { destination }, set }) => {
      const state = serializeOAuthState({ destination, provider: "kakao" });

      if (typeof state !== "string") {
        set.status = 400;
        switch (state._tag) {
          case "DataParseError": {
            return dataParseError();
          }
          case "InputRangeError": {
            return inputRangeError();
          }
        }
      }

      set.status = 201;
      const redirectUri = `${env.Server.Host}:${env.Server.Port}/callback`;
      const KAKAO_AUTH_HOST = "https://kauth.kakao.com/oauth/authorize";
      const kakaoURL = new URL(KAKAO_AUTH_HOST);
      kakaoURL.searchParams.set("redirect_uri", redirectUri);
      kakaoURL.searchParams.set("response_type", "code");
      kakaoURL.searchParams.set("client_id", env.Credential.KakaoRestAPIKey);
      kakaoURL.searchParams.set("state", state);
      return {
        url: kakaoURL.toString(),
      };
    },
    {
      body: t.Object({
        destination: t.String(),
      }),
      response: {
        201: t.Object({ url: t.String() }),
        400: t.Union([DataParseError, InputRangeError]),
      },
      detail: {
        tags: ["Auth"],
      },
    }
  )
  .get(
    "/callback",
    async ({ env, query: { code, state }, set, conn, jwt, redirect }) => {
      const oauthState = deserializeOAuthState(state);
      if ("_tag" in oauthState) {
        set.status = 400;
        return null;
      }

      // TODO-START: remove duplicated variables
      const redirectUri = `${env.Server.Host}:${env.Server.Port}/callback`;
      // TODO-END: remove duplicated variables

      const clientId = env.Credential.KakaoRestAPIKey;
      const clientSecret = env.Credential.KakaoSecret;
      const tokenResponse = await fetchKakaoToken({
        clientId,
        clientSecret,
        code,
        redirectUri,
      });

      if (isError(tokenResponse)) {
        set.status = 400;
        return null;
      }

      const userResponse = await fetchKakaoUser(tokenResponse.access_token);

      if (isError(userResponse)) {
        set.status = 400;
        return null;
      }

      const tokenInfo = await conn.transaction(async (tx) => {
        let user = await findUserByEmail(tx, userResponse.kakao_account.email);
        if (isError(user)) {
          user = await createUser(tx, {
            email: userResponse.kakao_account.email,
          });
          await createExternalIdentities(tx, {
            id: userResponse.id.toString(),
            provider: "kakao",
            email: user.email,
            userId: user.id,
          });
        }
        const sub = user.id;

        const iat = Math.round(Date.now() / 1_000);
        const accessTokenExp = iat + 3_600;
        const refreshTokenExp = iat + 86_400 * 7;
        const accessToken = await jwt.sign({
          iat,
          exp: accessTokenExp,
          sub: sub.toString(),
        });
        const refreshToken = await jwt.sign({
          iat,
          exp: refreshTokenExp,
          sub: sub.toString(),
        });
        return { accessToken, refreshToken };
      });

      const destinationURL = new URL(oauthState.destination);
      destinationURL.searchParams.set("access_token", tokenInfo.accessToken);
      destinationURL.searchParams.set("refresh_token", tokenInfo.refreshToken);
      return redirect(destinationURL.toString());
    },
    { query: t.Object({ code: t.String(), state: t.String() }) }
  )
  .guard(
    {
      headers: t.Object({
        authorization: t.TemplateLiteral("Bearer ${string}"),
      }),
      response: {
        401: t.Union([JWTMalformedError, JWTExpiredError]),
      },
    },
    (app) =>
      app
        .onBeforeHandle(async ({ headers: { authorization }, set }) => {
          const bearer = authorization.slice(7);
          console.log({ bearer });
          if (!bearer) {
            set.status = 401;
            return jwtMalformedError();
          }
        })
        .resolve(({ headers: { authorization } }) => {
          console.log({ sliced: authorization.slice(7) });
          return {
            bearer: authorization.slice(7),
          };
        })
        .onBeforeHandle(async ({ bearer, set, jwt }) => {
          const jwtPayload = await jwt.verify(bearer);
          console.log({ jwtPayload });
          if (jwtPayload === false) {
            set.status = 401;
            return jwtExpiredError();
          }
          const userId = jwtPayload.sub;
          if (!userId || Number.isNaN(Number(userId))) {
            set.status = 401;
            return jwtMalformedError();
          }
        })
        .resolve(async ({ bearer, jwt, set }) => {
          /**
           * Below logic is same as onBeforeHandle
           */
          const jwtPayload = await jwt.verify(bearer);
          if (jwtPayload === false) {
            set.status = 401;
            throw jwtExpiredError();
          }
          const userId = jwtPayload.sub;
          if (!userId || Number.isNaN(Number(userId))) {
            set.status = 401;
            throw jwtMalformedError();
          }

          return {
            userId: Number(userId),
          };
        })
        .get(
          "/me",
          async ({ userId, conn, set }) => {
            const user = await findUserById(conn, userId);
            if (!user) {
              set.status = 404;
              return dataNotFoundError();
            }

            set.status = 200;
            return {
              id: user.id,
              email: user.email,
              profile: user.profile,
            };
          },
          {
            response: {
              200: t.Object({
                id: t.Number(),
                email: t.String(),
                profile: t.Nullable(
                  t.Object({
                    nickname: t.String(),
                    dateOfBirthYear: t.Number(),
                  })
                ),
              }),
              404: DataNotFoundError,
            },
          }
        )
        .get(
          "/recommendation_nickname",
          async ({ set }) => {
            const ret =
              nickname.ret[Math.floor(Math.random() * nickname.ret.length)];
            if (ret === undefined) {
              set.status = 404;
              return dataNotFoundError();
            }
            set.status = 200;
            return { nickname: ret };
          },
          {
            response: {
              200: t.Object({ nickname: t.String() }),
              404: DataNotFoundError,
            },
          }
        )
        .get(
          "/jobs",
          async ({ conn }) => {
            const jobs = await findAllJobs(conn);
            return jobs.map(({ id, job }) => ({ id, name: job }));
          },
          {
            response: {
              200: t.Array(t.Object({ id: t.Number(), name: t.String() })),
            },
          }
        )
        .get(
          "/worries",
          async ({ conn }) => {
            const worries = await findAllWorries(conn);
            return worries.map(({ id, worry }) => ({ id, name: worry }));
          },
          {
            response: {
              200: t.Array(t.Object({ id: t.Number(), name: t.String() })),
            },
          }
        )
        .post(
          "/me/profile",
          async ({ body, conn, userId, set }) => {
            const userProfile = await findUserProfileByUserId(conn, userId);
            if (!isError(userProfile)) {
              set.status = 404;
              return dataNotFoundError();
            }

            try {
              const ret = await conn.transaction(async (tx) => {
                const profile = await createUserProfile(tx, {
                  nickname: body.nickname,
                  dateOfBirthYear: body.dateOfBirthYear,
                  id: userId,
                });
                await createUserJobs(
                  tx,
                  body.jobs.map((jobId) => ({ jobId, userId }))
                );

                return {
                  id: userId,
                  nickname: profile.nickname,
                  dateOfBirthYear: profile.dateOfBirthYear,
                  jobs: await findJobByIds(tx, body.jobs),
                };
              });
              set.status = 201;
              return ret;
            } catch (err) {
              set.status = 500;
              return unIntentionalError();
            }
          },
          {
            body: t.Object({
              nickname: t.String({ minLength: 1, maxLength: 20 }),
              dateOfBirthYear: t.Number({ minimum: 1900, maximum: 2024 }),
              jobs: t.Array(t.Number({ minimum: 1 })),
            }),
            response: {
              201: t.Object({
                id: t.Number(),
                nickname: t.String(),
                dateOfBirthYear: t.Number(),
                jobs: t.Array(t.Object({ id: t.Number(), job: t.String() })),
              }),
              404: DataNotFoundError,
              500: UnIntentionalError,
            },
          }
        )
        .get(
          "/me/profile",
          async ({ userId, conn, set }) => {
            const ret = await findUserByIdOrFailWithProfile(conn, userId);
            if (isError(ret)) {
              set.status = 404;
              return ret;
            }

            return {
              ...ret,
              jobs: ret.jobs
                .map((v) => v.job)
                .map(({ id, job }) => ({ id, name: job })),
            };
          },
          {
            response: {
              200: t.Object({
                id: t.Number(),
                nickname: t.String(),
                dateOfBirthYear: t.Number(),
                jobs: t.Array(
                  t.Object({
                    id: t.Number(),
                    name: t.String(),
                  })
                ),
              }),
              404: DataNotFoundError,
            },
          }
        )
        .get(
          "/questions/today",
          async ({ conn, set }) => {
            const ret = await findTodayQuestion(conn);
            if (isError(ret)) {
              set.status = 500;
              return unIntentionalError();
            }

            return { id: ret.id, question: ret.question.question };
          },
          {
            response: {
              200: t.Object({
                id: t.Number(),
                question: t.String(),
              }),
              500: UnIntentionalError,
            },
          }
        )
        .post(
          "/questions/:id/answers",
          async ({ conn, set, userId, body: { answer }, params: { id } }) => {
            const todayAnswer = await findTodayUsersAnswerByUserId(
              conn,
              userId
            );

            if (!isError(todayAnswer)) {
              set.status = 400;
              return userAlreadyAnswerTodayQuestionError();
            }

            const ret = await createTodayUserAnswer(conn, {
              userId,
              answer,
              questionDistributionId: id,
            });
            set.status = 201;
            return {
              id: ret.id,
            };
          },
          {
            params: t.Object({
              id: t.Numeric(),
            }),
            body: t.Object({
              answer: t.String({ minLength: 1, maxLength: 1000 }),
            }),
            response: {
              201: t.Object({ id: t.Number() }),
              400: UserAlreadyAnswerTodayQuestionError,
            },
          }
        )
        .patch(
          "/questions/:id/answers/:answerId",
          async ({
            conn,
            set,
            userId,
            params: { answerId },
            body: { answer },
          }) => {
            const existingAnswer = await findUserAnswerById(
              conn,
              userId,
              answerId
            );

            if (isError(existingAnswer)) {
              set.status = 404;
              return existingAnswer;
            }

            const now = new Date();
            const existingAnswerCreatedAt = new Date(existingAnswer.createdAt);
            const boundaryTime = new Date();
            boundaryTime.setUTCHours(14, 59, 59, 0);

            const isWithinBoundary =
              existingAnswerCreatedAt <= boundaryTime &&
              existingAnswerCreatedAt >= now;

            if (isWithinBoundary) {
              return await updateUserAnswerById(conn, answerId, answer);
            }

            set.status = 400;
            return questionAnswerModificationTimeLimitError();
          },
          {
            params: t.Object({
              id: t.Numeric(),
              answerId: t.Numeric(),
            }),
            body: t.Object({
              answer: t.String({ minLength: 1, maxLength: 1000 }),
            }),
            response: {
              200: t.Object({
                id: t.Number(),
                userId: t.Number(),
                createdAt: t.String(),
                updatedAt: t.String(),
                questionDistributionId: t.Number(),
                isPublic: t.Boolean(),
              }),
              404: DataNotFoundError,
              400: QuestionAnswerModificationTimeLimitError,
            },
          }
        )
        .delete(
          "/questions/:id/answers/:answerId",
          async ({ conn, set, userId, params: { answerId } }) => {
            const existingAnswer = await findUserAnswerById(
              conn,
              userId,
              answerId
            );
            if (existingAnswer === undefined) {
              set.status = 400;
              return existingAnswer;
            }
            await deleteUserAnswerById(conn, userId, answerId);
            set.status = 204;
            return true;
          },
          {
            params: t.Object({
              id: t.Numeric(),
              answerId: t.Numeric(),
            }),
            response: {
              204: t.Boolean(),
              400: DataNotFoundError,
            },
          }
        )
        .get(
          "/questions/answers",
          async ({ query, userId, set, conn }) => {
            const { type, startDateTime, endDateTime, offset, limit } = query;
            if (!startDateTime || !endDateTime) {
              if (type === "duration") {
                set.status = 400;
                return inputRangeError();
              }

              const ret = await findAllQuestionAnswersByUserId(conn, {
                userId,
                limit,
                offset,
              });
              const { count } = await findTotalQuestionsByUserId(conn, userId);
              const hasMore = count > offset + limit;

              return {
                data: ret.map((v) => ({
                  questionId: v.questionDistribution.questionId,
                  question: v.questionDistribution.question.question,
                  answerId: v.id,
                  answer: v.answer,
                  createdAtUTC: v.createdAt,
                })),
                hasMore,
              };
            }
          },
          {
            query: t.Object({
              type: t.Union([t.Literal("all"), t.Literal("duration")]),
              startDateTime: t.Optional(t.String()),
              endDateTime: t.Optional(t.String()),
              offset: t.Number({ minimum: 1 }),
              limit: t.Number({ minimum: 1 }),
            }),
            response: {
              400: InputRangeError,
            },
            detail: {
              description:
                "type은 전체를 의미하는 all과 특정 기간을 의미하는 duration중 하나가 와야해요. duration이면 startDateTime과 endDateTime이 필수에요.",
              tags: ["Question"],
            },
          }
        )
  )
  .listen(env.Server.Port);

export type App = typeof app;
