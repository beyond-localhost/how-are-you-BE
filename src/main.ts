import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { apiReference } from "@scalar/hono-api-reference";

import { Elysia, t } from "elysia";
import { InvalidSessionError } from "./core/error";
import { createSQLiteDatabase } from "./domain/rdb";

import { resolveEnv } from "./env";

import { cors as honoCors } from "hono/cors";
import auth from "./controllers/auth.controllers";
import { depsMiddleware, honoApp } from "./runtime/hono";
import user from "./controllers/user.controllers";

const env = resolveEnv();
const db = createSQLiteDatabase();

const app = honoApp();
app.use(
  honoCors({
    origin: ["http://localhost:5173"],
    credentials: true,
    allowHeaders: ["content-type"],
    exposeHeaders: ["content-type"],
  }),
);
app.use(depsMiddleware);
app.route("/", auth);
app.route("/", user);
app.get(
  "/docs",
  apiReference({
    spec: {
      url: "/swagger",
    },
  }),
);
app.doc("/swagger", {
  openapi: "3.1.0",
  info: { title: "How are you - API", version: "1.0.0" },
  tags: [
    { name: "Auth", description: "Authentication related API" },
    { name: "User", description: "User related API" },
    { name: "Misc", description: "The miscellaneous data related API" },
    { name: "Question", description: "The question related API" },
  ],
});

export default {
  port: env.Server.Port,
  fetch: app.fetch,
};

const appDeprecated = new Elysia({
  cookie: {
    secrets: env.Credential.JWTSecret,
    sign: ["sid"],
    path: "/",
    sameSite: "strict",
    httpOnly: true,
  },
  // aot: false,
}).guard(
  {
    cookie: t.Cookie(
      {
        sid: t.Number(),
      },
      {
        secrets: env.Credential.JWTSecret,
      },
    ),
    response: {
      401: InvalidSessionError,
    },
  },
  (app) => app,
  // .resolve(async ({ cookie: { sid } }) => {
  //   console.log({ sid });
  //   console.log(sid.secrets);
  //   const val = sid.value;
  //   console.log({ val });
  //   return {
  //     sessionId: val,
  //   };
  // })

  // .get(
  //   "/recommendation_nickname",
  //   async ({ set }) => {
  //     const ret =
  //       nickname.ret[Math.floor(Math.random() * nickname.ret.length)];
  //     if (ret === undefined) {
  //       set.status = 404;
  //       return dataNotFoundError();
  //     }
  //     set.status = 200;
  //     return { nickname: ret };
  //   },
  //   {
  //     response: {
  //       200: t.Object({ nickname: t.String() }),
  //       404: DataNotFoundError,
  //     },
  //   }
  // )
  // .post(
  //   "/me/profile",
  //   async ({ body, conn, userId, set }) => {
  //     const userProfile = await findUserProfileByUserId(conn, userId);
  //     if (!isError(userProfile)) {
  //       set.status = 404;
  //       return dataNotFoundError();
  //     }

  //     try {
  //       const ret = await conn.transaction(async (tx) => {
  //         const profile = await createUserProfile(tx, {
  //           nickname: body.nickname,
  //           dateOfBirthYear: body.dateOfBirthYear,
  //           id: userId,
  //         });
  //         await createUserJobs(
  //           tx,
  //           body.jobs.map((jobId) => ({ jobId, userId }))
  //         );

  //         return {
  //           id: userId,
  //           nickname: profile.nickname,
  //           dateOfBirthYear: profile.dateOfBirthYear,
  //           jobs: await findJobByIds(tx, body.jobs),
  //         };
  //       });
  //       set.status = 201;
  //       return ret;
  //     } catch (err) {
  //       set.status = 500;
  //       return unIntentionalError();
  //     }
  //   },
  //   {
  //     body: t.Object({
  //       nickname: t.String({ minLength: 1, maxLength: 20 }),
  //       dateOfBirthYear: t.Number({ minimum: 1900, maximum: 2024 }),
  //       jobs: t.Array(t.Number({ minimum: 1 })),
  //     }),
  //     response: {
  //       201: t.Object({
  //         id: t.Number(),
  //         nickname: t.String(),
  //         dateOfBirthYear: t.Number(),
  //         jobs: t.Array(t.Object({ id: t.Number(), job: t.String() })),
  //       }),
  //       404: DataNotFoundError,
  //       500: UnIntentionalError,
  //     },
  //   }
  // )
  // .get(
  //   "/me/profile",
  //   async ({ userId, conn, set }) => {
  //     const ret = await findUserByIdOrFailWithProfile(conn, userId);
  //     if (isError(ret)) {
  //       set.status = 404;
  //       return ret;
  //     }

  //     return {
  //       ...ret,
  //       jobs: ret.jobs
  //         .map((v) => v.job)
  //         .map(({ id, job }) => ({ id, name: job })),
  //     };
  //   },
  //   {
  //     response: {
  //       200: t.Object({
  //         id: t.Number(),
  //         nickname: t.String(),
  //         dateOfBirthYear: t.Number(),
  //         jobs: t.Array(
  //           t.Object({
  //             id: t.Number(),
  //             name: t.String(),
  //           })
  //         ),
  //       }),
  //       404: DataNotFoundError,
  //     },
  //   }
  // )
  // .get(
  //   "/questions/today",
  //   async ({ conn, set }) => {
  //     const ret = await findTodayQuestion(conn);
  //     if (isError(ret)) {
  //       set.status = 500;
  //       return unIntentionalError();
  //     }

  //     return { id: ret.id, question: ret.question.question };
  //   },
  //   {
  //     response: {
  //       200: t.Object({
  //         id: t.Number(),
  //         question: t.String(),
  //       }),
  //       500: UnIntentionalError,
  //     },
  //   }
  // )
  // .post(
  //   "/questions/:id/answers",
  //   async ({ conn, set, userId, body: { answer }, params: { id } }) => {
  //     const todayAnswer = await findTodayUsersAnswerByUserId(
  //       conn,
  //       userId
  //     );

  //     if (!isError(todayAnswer)) {
  //       set.status = 400;
  //       return userAlreadyAnswerTodayQuestionError();
  //     }

  //     const ret = await createTodayUserAnswer(conn, {
  //       userId,
  //       answer,
  //       questionDistributionId: id,
  //     });
  //     set.status = 201;
  //     return {
  //       id: ret.id,
  //     };
  //   },
  //   {
  //     params: t.Object({
  //       id: t.Numeric(),
  //     }),
  //     body: t.Object({
  //       answer: t.String({ minLength: 1, maxLength: 1000 }),
  //     }),
  //     response: {
  //       201: t.Object({ id: t.Number() }),
  //       400: UserAlreadyAnswerTodayQuestionError,
  //     },
  //   }
  // )
  // .patch(
  //   "/questions/:id/answers/:answerId",
  //   async ({
  //     conn,
  //     set,
  //     userId,
  //     params: { answerId },
  //     body: { answer },
  //   }) => {
  //     const existingAnswer = await findUserAnswerById(
  //       conn,
  //       userId,
  //       answerId
  //     );

  //     if (isError(existingAnswer)) {
  //       set.status = 404;
  //       return existingAnswer;
  //     }

  //     const now = new Date();
  //     const existingAnswerCreatedAt = new Date(existingAnswer.createdAt);
  //     const boundaryTime = new Date();
  //     boundaryTime.setUTCHours(14, 59, 59, 0);

  //     const isWithinBoundary =
  //       existingAnswerCreatedAt <= boundaryTime &&
  //       existingAnswerCreatedAt >= now;

  //     if (isWithinBoundary) {
  //       return await updateUserAnswerById(conn, answerId, answer);
  //     }

  //     set.status = 400;
  //     return questionAnswerModificationTimeLimitError();
  //   },
  //   {
  //     params: t.Object({
  //       id: t.Numeric(),
  //       answerId: t.Numeric(),
  //     }),
  //     body: t.Object({
  //       answer: t.String({ minLength: 1, maxLength: 1000 }),
  //     }),
  //     response: {
  //       200: t.Object({
  //         id: t.Number(),
  //         userId: t.Number(),
  //         createdAt: t.String(),
  //         updatedAt: t.String(),
  //         questionDistributionId: t.Number(),
  //         isPublic: t.Boolean(),
  //       }),
  //       404: DataNotFoundError,
  //       400: QuestionAnswerModificationTimeLimitError,
  //     },
  //   }
  // )
  // .delete(
  //   "/questions/:id/answers/:answerId",
  //   async ({ conn, set, userId, params: { answerId } }) => {
  //     const existingAnswer = await findUserAnswerById(
  //       conn,
  //       userId,
  //       answerId
  //     );
  //     if (existingAnswer === undefined) {
  //       set.status = 400;
  //       return existingAnswer;
  //     }
  //     await deleteUserAnswerById(conn, userId, answerId);
  //     set.status = 204;
  //     return true;
  //   },
  //   {
  //     params: t.Object({
  //       id: t.Numeric(),
  //       answerId: t.Numeric(),
  //     }),
  //     response: {
  //       204: t.Boolean(),
  //       400: DataNotFoundError,
  //     },
  //   }
  // )
  // .get(
  //   "/questions/answers",
  //   async ({ query, userId, set, conn }) => {
  //     const { type, startDateTime, endDateTime, offset, limit } = query;
  //     if (!startDateTime || !endDateTime) {
  //       if (type === "duration") {
  //         set.status = 400;
  //         return inputRangeError();
  //       }

  //       const ret = await findAllQuestionAnswersByUserId(conn, {
  //         userId,
  //         limit,
  //         offset,
  //       });
  //       const { count } = await findTotalQuestionsByUserId(conn, userId);
  //       const hasMore = count > offset + limit;

  //       return {
  //         data: ret.map((v) => ({
  //           questionId: v.questionDistribution.questionId,
  //           question: v.questionDistribution.question.question,
  //           answerId: v.id,
  //           answer: v.answer,
  //           createdAtUTC: v.createdAt,
  //         })),
  //         hasMore,
  //       };
  //     }
  //   },
  //   {
  //     query: t.Object({
  //       type: t.Union([t.Literal("all"), t.Literal("duration")]),
  //       startDateTime: t.Optional(t.String()),
  //       endDateTime: t.Optional(t.String()),
  //       offset: t.Number({ minimum: 1 }),
  //       limit: t.Number({ minimum: 1 }),
  //     }),
  //     response: {
  //       400: InputRangeError,
  //     },
  //     detail: {
  //       description:
  //         "type은 전체를 의미하는 all과 특정 기간을 의미하는 duration중 하나가 와야해요. duration이면 startDateTime과 endDateTime이 필수에요.",
  //       tags: ["Question"],
  //     },
  //   }
  // )
);
