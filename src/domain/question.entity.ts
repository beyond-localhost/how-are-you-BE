import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { users } from "./user.entity";

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  question: text("question").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const questionsRelations = relations(questions, ({ many }) => {
  return {
    answers: many(questionAnswers),
    distributions: many(questionDistributions),
  };
});

export const questionDistributions = sqliteTable("question_distributions", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id),
  distributionDate: text("distribution_date")
    .default(sql`(CURRENT_DATE)`)
    .notNull()
    .unique(),
});

export const questionDistributionsRelations = relations(
  questionDistributions,
  ({ one, many }) => {
    return {
      question: one(questions, {
        fields: [questionDistributions.questionId],
        references: [questions.id],
      }),
      answer: many(questionAnswers),
    };
  }
);

export const questionAnswers = sqliteTable(
  "question_answers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    answer: text("answer").notNull(),
    questionDistributionId: integer("question_distribution_id")
      .notNull()
      .references(() => questionDistributions.id, {
        onDelete: "set null",
        onUpdate: "cascade",
      }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    isPublic: integer("is_public", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => {
    return {
      created_at_idx: index("created_at_idx").on(table.createdAt),
    };
  }
);
export type CreateQuestionAnswer = typeof questionAnswers.$inferInsert;

export const questionAnswersRelations = relations(
  questionAnswers,
  ({ one }) => {
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
  }
);
