import type { Conn } from "./rdb";

import {
  questionAnswers,
  questionDistributions,
  type CreateQuestionAnswer,
} from "./question.entity";
import { and, between, count, eq, gte, lte, sql } from "drizzle-orm";
import { dangerousHead, nonNullish } from "../lib/predicate";

export const findTodayQuestion = async (conn: Conn) =>
  conn.query.questionDistributions
    .findFirst({
      where: eq(questionDistributions.distributionDate, sql`(CURRENT_DATE)`),
      with: {
        question: true,
      },
    })
    .then(nonNullish);

export const findUserAnswerById = async (
  conn: Conn,
  userId: number,
  distributionId: number
) =>
  conn.query.questionAnswers
    .findFirst({
      where: and(
        eq(questionAnswers.questionDistributionId, distributionId),
        eq(questionAnswers.userId, userId)
      ),
    })
    .then(nonNullish);

export const updateUserAnswerById = async (
  conn: Conn,
  answerId: number,
  newAnswer: string
) =>
  conn
    .update(questionAnswers)
    .set({ answer: newAnswer })
    .where(eq(questionAnswers.id, answerId))
    .returning()
    .then(dangerousHead);

export const deleteUserAnswerById = async (
  conn: Conn,
  userId: number,
  answerId: number
) =>
  conn
    .delete(questionAnswers)
    .where(
      and(eq(questionAnswers.userId, userId), eq(questionAnswers.id, answerId))
    );

export const createTodayUserAnswer = async (
  conn: Conn,
  dto: CreateQuestionAnswer
) => conn.insert(questionAnswers).values(dto).returning().then(dangerousHead);

export const findTodayUsersAnswerByUserId = async (
  conn: Conn,
  userId: number
) =>
  conn.query.questionAnswers
    .findFirst({
      where: and(
        eq(questionAnswers.userId, userId),
        gte(questionAnswers.createdAt, sql`(CURRENT_DATE)`),
        lte(questionAnswers.createdAt, sql.raw(`date('now', '+1 day')`))
      ),
    })
    .then(nonNullish);

export const findAllQuestionAnswersByUserId = async (
  conn: Conn,
  option: {
    userId: number;
    limit: number;
    offset: number;
  }
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
  }
) =>
  conn.query.questionAnswers.findMany({
    where: and(
      eq(questionAnswers.userId, option.userId),
      between(questionAnswers.createdAt, option.startDate, option.endDate)
    ),
    orderBy: (answers, { desc }) => desc(answers.createdAt),
    limit: option.limit,
    offset: option.offset,
  });

export const findTotalQuestionsByUserId = async (conn: Conn, userId: number) =>
  conn
    .select({ count: count() })
    .from(questionAnswers)
    .where(eq(questionAnswers.userId, userId))
    .then(dangerousHead);

export const findTotalSpecificQuestionsByUserId = async (
  conn: Conn,
  option: {
    userId: number;
    startDate: string;
    endDate: string;
  }
) =>
  conn
    .select({ count: count() })
    .from(questionAnswers)
    .where(
      and(
        eq(questionAnswers.userId, option.userId),
        between(questionAnswers.createdAt, option.startDate, option.endDate)
      )
    )
    .then(dangerousHead);
