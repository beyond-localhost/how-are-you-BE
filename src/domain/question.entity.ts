import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
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
  };
});

export const questionAnswers = sqliteTable("question_answers", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  answer: text("answer").notNull(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const questionAnswersRelations = relations(
  questionAnswers,
  ({ one }) => {
    return {
      question: one(questions, {
        fields: [questionAnswers.questionId],
        references: [questions.id],
      }),
      user: one(users, {
        fields: [questionAnswers.userId],
        references: [users.id],
      }),
    };
  }
);
