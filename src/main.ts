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
