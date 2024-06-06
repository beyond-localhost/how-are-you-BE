import { createRoute, honoAuthApp, z } from "../runtime/hono.ts";
import { unAuthorizedResponse } from "./response.ts";
import {
  findOneQuestionById,
  findTodayQuestionWithUserAnswer,
  upsertQuestionAnswer,
} from "../domain/question.repository.ts";
import { convertDateToDateTime } from "../lib/date.ts";

const question = honoAuthApp();

question.openapi(
  createRoute({
    method: "get",
    path: "/questions/today",
    summary: "오늘 만들어진 질문과 이에 대한 유저의 답변을 반환합니다.",
    responses: {
      200: {
        description: "오늘 만들어진 질문과 이에 대한 유저의 답변을 반환합니다.",
        content: {
          "application/json": {
            schema: z.discriminatedUnion("userAnswered", [
              z.object({
                userAnswered: z.literal(true),
                question: z.string(),
                questionId: z.number(),
                answer: z.string(),
                answerId: z.number(),
              }),
              z.object({
                userAnswered: z.literal(false),
                question: z.string(),
                questionId: z.number(),
              }),
            ]),
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

    const ret = await findTodayQuestionWithUserAnswer(c.var.conn, c.var.sessionResult.data.userId);

    if (ret.userAnswer !== null && ret.userAnswerId !== null) {
      return c.json(
        {
          userAnswered: true as const,
          question: ret.question,
          questionId: ret.questionId,
          answer: ret.userAnswer,
          answerId: ret.userAnswerId,
        },
        200,
      );
    }

    return c.json({ userAnswered: false as const, question: ret.question, questionId: ret.questionId }, 200);
  },
);

question.openapi(
  createRoute({
    method: "post",
    path: "/questions/{id}/answers",
    request: {
      params: z.object({ id: z.number() }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              answer: z.string().min(1),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "이미 답변이 있는 경우 해당 답변을 수정합니다. 그렇지 않은 경우 해당 답변을 추가합니다.",
        content: {
          "application/json": {
            schema: z.object({ answerId: z.number(), answer: z.string() }),
          },
        },
      },
      404: {
        description: "답변이 대상이 되는 질문이 '오늘'이 아닐 때 반환되는 응답입니다. 오늘의 기준은 UTC+09:00 입니다.",
      },
      401: unAuthorizedResponse,
    },
  }),
  async (c) => {
    if (!c.var.sessionResult.ok) {
      return c.json({ code: 401 as const, error: "유효하지 않은 세션입니다" }, 401);
    }

    const { answer } = c.req.valid("json");
    const { id } = c.req.valid("param");
    const requestDateTime = convertDateToDateTime(new Date(Date.now()));

    const questionDistribution = await findOneQuestionById(c.var.conn, id, requestDateTime);
    if (!questionDistribution) {
      return c.json({}, 404);
    }
    const ret = await upsertQuestionAnswer(c.var.conn, {
      questionDistributionId: questionDistribution.id,
      userId: c.var.sessionResult.data.userId,
      answer: answer,
    });

    return c.json({ answerId: ret.id, answer: ret.answer }, 201);
  },
);

export default question;
