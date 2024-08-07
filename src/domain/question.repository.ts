import type { Conn } from "./rdb";

import { and, between, eq, gte, lte, sql } from "drizzle-orm";
import type { DateTime } from "../lib/date";
import { dangerousHead, nonNullish } from "../lib/predicate";
import { questionAnswers, questionDistributions, questions, type CreateQuestionAnswer } from "./question.entity";

export const findTodayQuestion = (conn: Conn) => {
  return conn
    .select({
      distributionId: questionDistributions.id,
      question: questions.question,
    })
    .from(questionDistributions)
    .where(
      and(
        gte(questionDistributions.distributionDate, sql`(CURRENT_DATE)`),
        lte(questionDistributions.distributionDate, sql`DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)`),
      ),
    )
    .innerJoin(questions, eq(questionDistributions.questionId, questions.id));
};

export const findQuestionByDistributionId = (conn: Conn, distributionId: number) =>
  conn.query.questionDistributions
    .findFirst({ where: eq(questionDistributions.id, distributionId), with: { question: true } })
    .then(nonNullish);

export const findUserAnswerByQuestionDistributionId = async (conn: Conn, userId: number, distributionId: number) =>
  conn.query.questionAnswers.findFirst({
    where: and(eq(questionAnswers.questionDistributionId, distributionId), eq(questionAnswers.userId, userId)),
  });

export const findAnswerByAnswerId = async (conn: Conn, answerId: number) =>
  conn.select().from(questionAnswers).where(eq(questionAnswers.id, answerId)).then(dangerousHead);

export const findAnswerByDistributionId = async (conn: Conn, distributionId: number) =>
  conn
    .select()
    .from(questionAnswers)
    .where(eq(questionAnswers.questionDistributionId, distributionId))
    .then(dangerousHead);

export const deleteUserAnswerById = async (conn: Conn, userId: number, answerId: number) =>
  conn.delete(questionAnswers).where(and(eq(questionAnswers.userId, userId), eq(questionAnswers.id, answerId)));

export const findOneQuestionByDistributionId = (conn: Conn, distributionId: number, dateTime?: DateTime) =>
  conn.query.questionDistributions.findFirst({
    where: and(
      eq(questionDistributions.id, distributionId),
      dateTime
        ? and(
            gte(questionDistributions.distributionDate, sql`(CURRENT_DATE)`),
            lte(questionDistributions.distributionDate, sql`DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)`),
          )
        : undefined,
    ),
  });

export const createQuestionAnswer = async (conn: Conn, dto: CreateQuestionAnswer) => {
  const { id } = await conn.insert(questionAnswers).values(dto).$returningId().then(dangerousHead);
  return await findAnswerByAnswerId(conn, id);
};

export const updateQuestionAnswer = async (conn: Conn, distributionId: number, answer: string) => {
  await conn.update(questionAnswers).set({ answer }).where(eq(questionAnswers.id, distributionId));
  return await findAnswerByDistributionId(conn, distributionId);
};

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
      createdAt: v.questionDistribution.distributionDate,
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
      list: data,
      hasMore: true as const,
      nextCursor: lastData.questionId,
    };
  }

  return {
    list: data,
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
