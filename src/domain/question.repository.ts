import type { Conn } from "./rdb";

import {
  questionAnswers,
  questionDistributions,
  type CreateQuestionAnswer,
} from "./question.entity";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { dangerousHead } from "../lib/predicate";

export const findTodayQuestion = async (conn: Conn) =>
  conn.query.questionDistributions.findFirst({
    where: eq(questionDistributions.distributionDate, sql`(CURRENT_DATE)`),
    with: {
      question: true,
    },
  });

export const findUserAnswerById = async (
  conn: Conn,
  userId: number,
  distributionId: number
) =>
  conn.query.questionAnswers.findFirst({
    where: and(
      eq(questionAnswers.questionDistributionId, distributionId),
      eq(questionAnswers.userId, userId)
    ),
  });

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
  conn.query.questionAnswers.findFirst({
    where: and(
      eq(questionAnswers.userId, userId),
      gte(questionAnswers.createdAt, sql`(CURRENT_DATE)`),
      lte(questionAnswers.createdAt, sql.raw(`date('now', '+1 day')`))
    ),
  });
