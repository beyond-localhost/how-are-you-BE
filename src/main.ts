import { apiReference } from "@scalar/hono-api-reference";

import { Elysia, t } from "elysia";
import { InvalidSessionError } from "./core/error";
import { createSQLiteDatabase } from "./domain/rdb";

import { resolveEnv } from "./env";

import { cors as honoCors } from "hono/cors";
import auth from "./controllers/auth.controllers";
import { depsMiddleware, honoApp } from "./runtime/hono";
import user from "./controllers/user.controllers";
import question from "./controllers/question.controller.ts";
import misc from "./controllers/misc.controller.ts";

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
app.route("/", question);
app.route("/", misc);
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

const appDeprecated = new Elysia().guard(
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
