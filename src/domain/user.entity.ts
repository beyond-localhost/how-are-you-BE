import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text, primaryKey } from "drizzle-orm/sqlite-core";
import { questionAnswers } from "./question.entity";
import { jobs, worries } from "./criteria.entity";
import type { DateTime } from "src/lib/date";

export const externalIdentities = sqliteTable("external_identities", {
  id: text("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  email: text("email").notNull(),
  provider: text("provider").notNull().$type<"kakao">(),
});

export type CreateExternalIdentity = typeof externalIdentities.$inferInsert;
export type ExternalIdentity = typeof externalIdentities.$inferSelect;

export const externalIdentitiesRelations = relations(externalIdentities, ({ one }) => {
  return {
    users: one(users, {
      fields: [externalIdentities.userId],
      references: [users.id],
    }),
  };
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now','localtime'))`),
  lastSignedInAt: text("last_signed_in_at")
    .notNull()
    .default(sql`(datetime('now','localtime'))`),
});

export const usersRelations = relations(users, ({ one, many }) => {
  return {
    externalIdentities: many(externalIdentities),
    questionAnswers: many(questionAnswers),
    profile: one(userProfiles),
    sessions: many(sessions),
  };
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  revoked: integer("revoked", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now','localtime'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now','localtime'))`),
});

export type CreateSessionDto = typeof sessions.$inferInsert;
export type Session = typeof sessions.$inferSelect;

export const sessionsRelations = relations(sessions, ({ one }) => {
  return {
    user: one(users, {
      fields: [sessions.userId],
      references: [users.id],
    }),
  };
});

export const userProfiles = sqliteTable("user_profiles", {
  id: integer("id")
    .primaryKey()
    .references(() => users.id),
  nickname: text("nickname").notNull(),
  birthday: text("birthday").notNull().$type<DateTime>(),
  gender: text("gender").$type<"male" | "female">(),
  jobId: integer("job_id")
    .notNull()
    .references(() => jobs.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now','localtime'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now','localtime'))`),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type CreateUserProfileDto = typeof userProfiles.$inferInsert;

export const userProfilesRelations = relations(userProfiles, ({ one, many }) => {
  return {
    user: one(users, {
      fields: [userProfiles.id],
      references: [users.id],
    }),
    job: one(jobs, {
      fields: [userProfiles.jobId],
      references: [jobs.id],
    }),
    userProfilesToWorries: many(userProfilesToWorries),
  };
});

export const userProfilesToWorries = sqliteTable(
  "user_profiles_worries",
  {
    userProfileId: integer("user_profile_id")
      .notNull()
      .references(() => userProfiles.id),
    worryId: integer("worry_id")
      .notNull()
      .references(() => worries.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userProfileId, t.worryId] }),
  }),
);

export const userProfilesToWorriesRelations = relations(userProfilesToWorries, ({ one }) => ({
  userProfile: one(userProfiles, {
    fields: [userProfilesToWorries.userProfileId],
    references: [userProfiles.id],
  }),
  worry: one(worries, {
    fields: [userProfilesToWorries.worryId],
    references: [worries.id],
  }),
}));

export type CreateUserDto = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
