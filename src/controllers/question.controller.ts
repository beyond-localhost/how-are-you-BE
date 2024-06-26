import { createRoute, honoAuthApp, z } from "../runtime/hono.ts";
import { unAuthorizedResponse } from "./response.ts";
import {
  createQuestionAnswer,
  deleteUserAnswerById,
  findOneQuestionById,
  findTodayQuestion,
  findUserAnswerByQuestionId,
  findUserAnswers,
  findUserQuestionAnswerByQuestionId,
  updateQuestionAnswer,
} from "../domain/question.repository.ts";
import { convertDateToDateTime, type DateTime, isLeapYear, makeDateTime } from "../lib/date.ts";
import { questionAnswers } from "../domain/question.entity.ts";

const question = honoAuthApp();

question.openapi(
  createRoute({
    tags: ["Question"],
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
      404: {
        description: "오늘 만들어진 질문이 없을 때 반환되는 응답입니다. 오늘의 기준은 UTC+09:00 입니다.",
      },
    },
  }),
  async (c) => {
    if (!c.var.sessionResult.ok) {
      return c.json({ code: 401 as const, error: "유효하지 않은 세션입니다" }, 401);
    }

    const [question] = await findTodayQuestion(c.var.conn);
    if (!question) {
      return c.json({}, 404);
    }

    const userQuestionAnswer = await findUserAnswerByQuestionId(
      c.var.conn,
      c.var.sessionResult.data.userId,
      question.distributionId,
    );

    if (userQuestionAnswer) {
      return c.json(
        {
          userAnswered: true as const,
          question: question.question,
          questionId: question.distributionId,
          answer: userQuestionAnswer.answer,
          answerId: userQuestionAnswer.id,
        },
        200,
      );
    }

    return c.json(
      { userAnswered: false as const, question: question.question, questionId: question.distributionId },
      200,
    );
  },
);

question.openapi(
  createRoute({
    tags: ["Question"],
    method: "post",
    summary: "질문에 대한 답변을 추가하거나 수정합니다.",
    path: "/questions/{id}/answers",
    request: {
      params: z.object({ id: z.string().transform(Number) }),
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
    const existingAnswer = await findUserQuestionAnswerByQuestionId(
      c.var.conn,
      c.var.sessionResult.data.userId,
      questionDistribution.id,
    );

    if (existingAnswer) {
      await updateQuestionAnswer(c.var.conn, existingAnswer.id, answer);
      return c.json({ answerId: existingAnswer.id, answer: answer }, 201);
    }

    const newAnswer = await createQuestionAnswer(c.var.conn, {
      questionDistributionId: questionDistribution.id,
      userId: c.var.sessionResult.data.userId,
      answer: answer,
    });
    return c.json({ answerId: newAnswer.id, answer: answer }, 201);
  },
);

question.openapi(
  createRoute({
    tags: ["Question"],
    method: "delete",
    path: "/questions/answers/{answerId}",
    summary: "질문에 대한 답변을 삭제합니다.",
    request: {
      params: z.object({ answerId: z.string().transform(Number) }),
    },
    responses: {
      204: {
        description: "답변이 삭제되었을 때 반환되는 응답입니다.",
      },
      401: unAuthorizedResponse,
      400: {
        description: "삭제하려는 답변이 유저가 남긴 답변이 아닐 때 반환되는 응답입니다.",
      },
      404: {
        description: "삭제하려는 답변이 존재하지 않을 때 반환되는 응답입니다.",
      },
    },
  }),
  async (c) => {
    if (!c.var.sessionResult.ok) {
      return c.json({ code: 401 as const, error: "유효하지 않은 세션입니다" }, 401);
    }

    const { answerId } = c.req.valid("param");
    const existingAnswer = await findUserAnswerByQuestionId(c.var.conn, c.var.sessionResult.data.userId, answerId);
    if (!existingAnswer) {
      return c.json({}, 404);
    }

    if (existingAnswer.userId !== c.var.sessionResult.data.userId) {
      return c.json({}, 400);
    }

    await deleteUserAnswerById(c.var.conn, c.var.sessionResult.data.userId, answerId);

    return c.json({}, 204);
  },
);

question.openapi(
  createRoute({
    method: "post",
    path: "/questions/seed",
    responses: {
      204: {
        description: "Seed data inserted successfully",
      },
      401: unAuthorizedResponse,
    },
  }),
  async (c) => {
    const user = c.var.sessionResult;
    if (!user.ok) {
      return c.json({ code: 401 as const, error: "유효하지 않은 세션입니다" }, 401);
    }
    const from = await c.var.conn.query.questionDistributions.findMany({
      orderBy: (dis, { asc }) => [asc(dis.distributionDate)],
    });
    await c.var.conn.insert(questionAnswers).values(
      from.map((v) => ({
        userId: user.data.userId,
        answer: "seed",
        questionDistributionId: v.id,
      })),
    );

    return c.json({}, 204);
  },
);

question.openapi(
  createRoute({
    tags: ["Question"],
    method: "get",
    path: "/questions/answers",
    summary: "유저가 남긴 답변에 대해 필터링 과정을 거쳐 반환합니다.",
    request: {
      query: z.object({
        startYear: z.string().transform(Number),
        startMonth: z.string().transform(Number),
        endYear: z.string().transform(Number),
        endMonth: z.string().transform(Number),
        nextCursor: z.string().transform(Number).optional(),
        limit: z.number().default(10),
      }),
    },
    responses: {
      401: unAuthorizedResponse,
      200: {
        description:
          "유저가 보낸 요청에 대해 더이상 페이지네이션할 것이 없다면 hasMore가 false로 반환됩니다. hasMore는 클라이언트가 더이상 페칭을 할지 안할지를 결정하는 기준입니다.",
        content: {
          "application/json": {
            schema: z.discriminatedUnion("hasMore", [
              z.object({
                hasMore: z.literal(true),
                nextCursor: z.number(),
                data: z.array(
                  z.object({
                    questionId: z.number(),
                    question: z.string(),
                    answerId: z.number(),
                    answer: z.string(),
                  }),
                ),
              }),
              z.object({
                hasMore: z.literal(false),
                nextCursor: z.literal(undefined),
                data: z.array(
                  z.object({
                    questionId: z.number(),
                    question: z.string(),
                    answerId: z.number(),
                    answer: z.string(),
                  }),
                ),
              }),
            ]),
          },
        },
      },
    },
  }),
  async (c) => {
    const user = c.var.sessionResult;
    if (!user.ok) {
      return c.json({ code: 401 as const, error: "유효하지 않은 세션입니다" }, 401);
    }

    let { startYear, startMonth, endYear, endMonth, nextCursor, limit } = c.req.valid("query");
    if (Number.isNaN(startMonth) || startMonth >= 13 || startMonth <= 0) {
      startMonth = 1;
    }
    if (Number.isNaN(endMonth) || endMonth >= 13 || endMonth <= 0) {
      endMonth = 12;
    }

    if (Number.isNaN(startYear) || startYear <= 0) {
      startYear = 2024;
    }

    if (Number.isNaN(endYear) || startYear <= 0) {
      endYear = 2024;
    }

    let startDate = makeDateTime(startYear, startMonth, 1);
    let endDate = makeDateTime(
      endYear,
      endMonth,
      endMonth % 2 === 1 ? 31 : endMonth === 2 ? (isLeapYear(endYear) ? 29 : 28) : 30,
    );

    if (new Date(startDate) >= new Date(endDate)) {
      startDate = makeDateTime(2024, 1, 1);
      endDate = makeDateTime(2024, 12, 31);
    }

    const ret = await findUserAnswers(c.var.conn, user.data.userId, {
      startDate,
      endDate,
      cursor: nextCursor,
      limit,
    });
    return c.json(ret, 200);
  },
);

export default question;
