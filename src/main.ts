import { Elysia, t } from "elysia";
import { resolveEnv } from "./env";
import { createSQLiteDatabase } from "./domain/rdb";
import { fetchKakaoToken, fetchKakaoUser } from "./lib/kakao";
import {
  DataParseError,
  InputRangeError,
  JWTExpiredError,
  JWTMalformedError,
  dataNotFoundError,
  dataParseError,
  inputRangeError,
  isError,
  // DataNotFoundError,
  // DataParseError,
  // FetchNotOkError,
  // JWTExpiredError,
  // JWTMalformedError,
  jwtExpiredError,
  jwtMalformedError,
} from "./core/error";
import {
  createExternalIdentities,
  createUser,
  findUserByEmail,
  findUserById,
  findUserProfileByUserId,
  createUserProfile,
  createUserJobs,
  findJobs,
  findUserByIdOrFailWithProfile,
} from "./domain/user.repository";
import jwt from "@elysiajs/jwt";
import { deserializeOAuthState, serializeOAuthState } from "./lib/oauth";
import swagger from "@elysiajs/swagger";
import {
  createTodayUserAnswer,
  deleteUserAnswerById,
  findTodayQuestion,
  findTodayUsersAnswerByUserId,
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
            description: "How Are You 서비스의 auth를 나타내요",
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
  .use(cors({ origin: ["http://localhost:5173"] }))
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

            set.status = 201;
            return {
              id: user.id,
              email: user.email,
              profile: user.profile,
            };
          }
          // {
          //   response: {
          //     200: t.Object({
          //       id: t.Number(),
          //       email: t.String(),
          //       profile: t.Nullable(
          //         t.Object({
          //           nickname: t.String(),
          //           dateOfBirthYear: t.Number(),
          //         })
          //       ),
          //     }),
          //   },
          // }
        )
        .get(
          "/recommendation_nickname",
          async ({ set }) => {
            const ret =
              nickname.ret[Math.floor(Math.random() * nickname.ret.length)];
            if (ret === undefined) {
              set.status = 500;
              return "";
            }
            return ret;
          },
          { response: t.String() }
        )
        .post(
          "/me/profile",
          async ({ body, conn, userId, set }) => {
            const userProfile = await findUserProfileByUserId(conn, userId);
            if (!isError(userProfile)) {
              set.status = 400;
              return "";
            }

            return await conn.transaction(async (tx) => {
              set.status = 201;
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
                jobs: await findJobs(tx, body.jobs),
              };
            });
          },
          {
            body: t.Object({
              nickname: t.String({ minLength: 1, maxLength: 20 }),
              dateOfBirthYear: t.Number({ minimum: 1900, maximum: 2024 }),
              jobs: t.Array(t.Number({ minimum: 1 })),
            }),
            // response: {
            //   201: t.Object({
            //     id: t.Number(),
            //     nickname: t.String(),
            //     dateOfBirthYear: t.Number(),
            //     jobs: t.Array(t.Object({ id: t.Number(), job: t.String() })),
            //   }),
            //   400: t.String(),
            // },
          }
        )
        .get("/me/profile", async ({ userId, conn, set }) => {
          const ret = await findUserByIdOrFailWithProfile(conn, userId);
          if (ret === undefined) {
            set.status = 400;
            return set;
          }

          return {
            ...ret,
            jobs: ret.jobs
              .map((v) => v.job)
              .map(({ id, job }) => ({ id, name: job })),
          };
        })
        .get("/questions/today", async ({ conn, set }) => {
          const ret = await findTodayQuestion(conn);
          if (ret === undefined) {
            set.status = 500;
            return "StevenDoesNotPushRowsError";
          }

          return { id: ret.id, question: ret.question };
        })
        .post(
          "/questions/:id/answers",
          async ({ conn, set, userId, body: { answer }, params: { id } }) => {
            const todayAnswer = await findTodayUsersAnswerByUserId(
              conn,
              userId
            );

            if (todayAnswer) {
              set.status = 400;
              return "";
            }

            const ret = await createTodayUserAnswer(conn, {
              userId,
              answer,
              questionDistributionId: id,
            });
            return ret;
          },
          {
            params: t.Object({
              id: t.Numeric(),
            }),
            body: t.Object({
              answer: t.String({ minLength: 1, maxLength: 1000 }),
            }),
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
            if (existingAnswer === undefined) {
              set.status = 400;
              return "";
            }
            return await updateUserAnswerById(conn, answerId, answer);
          },
          {
            params: t.Object({
              id: t.Numeric(),
              answerId: t.Numeric(),
            }),
            body: t.Object({
              answer: t.String({ minLength: 1, maxLength: 1000 }),
            }),
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
              return "";
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
          }
        )
  )
  .listen(env.Server.Port);

export type App = typeof app;
