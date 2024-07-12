import { relations, sql } from "drizzle-orm";
import { users } from "./user.entity";
import { mysqlTable, int, text, datetime, boolean, index, foreignKey } from "drizzle-orm/mysql-core";

export const questions = mysqlTable("questions", {
  id: int("id").primaryKey().notNull().autoincrement(),
  question: text("question").notNull(),
  createdAt: datetime("created_at", { mode: "string" })
    .notNull()
    .default(sql`(CURRENT_DATE)`),
  updatedAt: datetime("updated_at", { mode: "string" })
    .notNull()
    .default(sql`(CURRENT_DATE)`),
});

export const questionsRelations = relations(questions, ({ many }) => {
  return {
    answers: many(questionAnswers),
    distributions: many(questionDistributions),
  };
});

export const questionDistributions = mysqlTable("question_distributions", {
  id: int("id").primaryKey().notNull().autoincrement(),
  questionId: int("question_id")
    .notNull()
    .references(() => questions.id),
  distributionDate: datetime("distribution_date", { mode: "string" })
    .default(sql`(CURRENT_DATE)`)
    .notNull()
    .unique(),
});

export const questionDistributionsRelations = relations(questionDistributions, ({ one, many }) => {
  return {
    question: one(questions, {
      fields: [questionDistributions.questionId],
      references: [questions.id],
    }),
    answer: many(questionAnswers),
  };
});

export const questionAnswers = mysqlTable(
  "question_answers",
  {
    id: int("id").primaryKey().notNull().autoincrement(),
    answer: text("answer").notNull(),
    questionDistributionId: int("question_distribution_id").notNull(),

    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    isPublic: boolean("is_public").notNull().default(false),
    createdAt: datetime("created_at", { mode: "string" })
      .notNull()
      .default(sql`(CURRENT_DATE)`),
    updatedAt: datetime("updated_at", { mode: "string" })
      .notNull()
      .default(sql`(CURRENT_DATE)`),
  },
  (table) => {
    return {
      created_at_idx: index("created_at_idx").on(table.createdAt),
      distributionReference: foreignKey({
        columns: [table.questionDistributionId],
        foreignColumns: [questionDistributions.id],
        name: "answer_distribution_id_fk",
      }),
    };
  },
);
export type CreateQuestionAnswer = typeof questionAnswers.$inferInsert;

export const questionAnswersRelations = relations(questionAnswers, ({ one }) => {
  return {
    questionDistribution: one(questionDistributions, {
      fields: [questionAnswers.questionDistributionId],
      references: [questionDistributions.id],
    }),
    user: one(users, {
      fields: [questionAnswers.userId],
      references: [users.id],
    }),
  };
});
