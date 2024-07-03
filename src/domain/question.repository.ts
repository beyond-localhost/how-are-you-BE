import type { Conn } from "./rdb";

import { questionAnswers, questionDistributions, type CreateQuestionAnswer, questions } from "./question.entity";
import { and, between, count, eq, gte, lte, ne, sql } from "drizzle-orm";
import { dangerousHead, nonNullish } from "../lib/predicate";
import type { DateTime } from "../lib/date.ts";

export const findTodayQuestion = (conn: Conn) =>
  conn
    .select({
      distributionId: questionDistributions.id,
      question: questions.question,
    })
    .from(questionDistributions)
    .where(eq(questionDistributions.distributionDate, sql`(date('now','localtime'))`))
    .innerJoin(questions, eq(questionDistributions.questionId, questions.id));

export const findUserAnswerByQuestionId = async (conn: Conn, userId: number, distributionId: number) =>
  conn.query.questionAnswers.findFirst({
    where: and(eq(questionAnswers.questionDistributionId, distributionId), eq(questionAnswers.userId, userId)),
  });

export const findUserAnswersExceptMeByQuestionId = async (conn: Conn, userId: number, distributionId: number) => {
  return conn.query.questionAnswers.findMany({
    where: and(
      eq(questionAnswers.questionDistributionId, distributionId),
      ne(questionAnswers.userId, userId),
      eq(questionAnswers.isPublic, true),
    ),
  });
};

export const findUserQuestionAnswerByQuestionId = async (conn: Conn, userId: number, distributionId: number) =>
  conn.query.questionAnswers.findFirst({
    where: and(eq(questionAnswers.questionDistributionId, distributionId), eq(questionAnswers.userId, userId)),
  });

export const updateUserAnswerById = async (conn: Conn, answerId: number, newAnswer: string) =>
  conn
    .update(questionAnswers)
    .set({ answer: newAnswer })
    .where(eq(questionAnswers.id, answerId))
    .returning()
    .then(dangerousHead);

export const deleteUserAnswerById = async (conn: Conn, userId: number, answerId: number) =>
  conn.delete(questionAnswers).where(and(eq(questionAnswers.userId, userId), eq(questionAnswers.id, answerId)));

export const createTodayUserAnswer = async (conn: Conn, dto: CreateQuestionAnswer) =>
  conn.insert(questionAnswers).values(dto).returning().then(dangerousHead);

export const findTodayUsersAnswerByUserId = async (conn: Conn, userId: number) =>
  conn.query.questionAnswers
    .findFirst({
      where: and(
        eq(questionAnswers.userId, userId),
        gte(questionAnswers.createdAt, sql`(date('now','localtime'))`),
        lte(questionAnswers.createdAt, sql.raw(`date('now', '+1 day')`)),
      ),
    })
    .then(nonNullish);

export const findAllQuestionAnswersByUserId = async (
  conn: Conn,
  option: {
    userId: number;
    limit: number;
    offset: number;
  },
) =>
  conn.query.questionAnswers.findMany({
    where: eq(questionAnswers.userId, option.userId),
    orderBy: (answers, { desc }) => desc(answers.createdAt),
    limit: option.limit,
    offset: option.offset,
    with: {
      questionDistribution: {
        with: {
          question: true,
        },
      },
    },
  });

export const findSpecificQuestionAnswersByUserId = async (
  conn: Conn,
  option: {
    userId: number;
    limit: number;
    offset: number;
    startDate: string;
    endDate: string;
  },
) =>
  conn.query.questionAnswers.findMany({
    where: and(
      eq(questionAnswers.userId, option.userId),
      between(questionAnswers.createdAt, option.startDate, option.endDate),
    ),
    orderBy: (answers, { desc }) => desc(answers.createdAt),
    limit: option.limit,
    offset: option.offset,
  });

export const findTotalQuestionsByUserId = async (conn: Conn, userId: number) =>
  conn.select({ count: count() }).from(questionAnswers).where(eq(questionAnswers.userId, userId)).then(dangerousHead);

export const findTotalSpecificQuestionsByUserId = async (
  conn: Conn,
  option: {
    userId: number;
    startDate: string;
    endDate: string;
  },
) =>
  conn
    .select({ count: count() })
    .from(questionAnswers)
    .where(
      and(
        eq(questionAnswers.userId, option.userId),
        between(questionAnswers.createdAt, option.startDate, option.endDate),
      ),
    )
    .then(dangerousHead);

export const findOneQuestionById = (conn: Conn, distributionId: number, dateTime?: DateTime) =>
  conn.query.questionDistributions.findFirst({
    where: and(
      eq(questionDistributions.id, distributionId),
      dateTime ? eq(questionDistributions.distributionDate, dateTime) : undefined,
    ),
  });

export const createQuestionAnswer = (conn: Conn, dto: CreateQuestionAnswer) =>
  conn.insert(questionAnswers).values(dto).returning().then(dangerousHead);

export const updateQuestionAnswer = (conn: Conn, distributionId: number, answer: string) =>
  conn
    .update(questionAnswers)
    .set({ answer })
    .where(eq(questionAnswers.id, distributionId))
    .returning()
    .then(dangerousHead);

export const findUserAnswers = async (
  conn: Conn,
  userId: number,
  paging: { startDate: DateTime; endDate: DateTime; cursor?: number; limit?: number },
) => {
  const { endDate, startDate, limit = 30, cursor } = paging;
  const ret = await conn.query.questionAnswers.findMany({
    where: and(
      eq(questionAnswers.userId, userId),
      between(questionAnswers.createdAt, startDate, endDate),
      cursor ? gte(questionAnswers.id, cursor) : undefined,
    ),
    with: {
      questionDistribution: {
        with: {
          question: true,
        },
      },
    },
    limit,
  });

  const hasMore = ret.length === limit;
  const data = ret.map((v) => {
    return {
      questionId: v.questionDistribution.id,
      question: v.questionDistribution.question.question,
      answerId: v.id,
      answer: v.answer,
    };
  });

  if (hasMore) {
    const lastData = data.at(-1);
    if (lastData === undefined) {
      throw new Error("");
    }
    return {
      data: data,
      hasMore: true as const,
      nextCursor: lastData.questionId,
    };
  }

  return {
    data: data,
    hasMore: false as const,
    nextCursor: undefined,
  };
};

export const findAnswerById = async (conn: Conn, answerId: number) => {
  return conn.query.questionAnswers.findFirst({
    where: eq(questionAnswers.questionDistributionId, answerId),
    with: { questionDistribution: { with: { question: true } } },
  });
};
