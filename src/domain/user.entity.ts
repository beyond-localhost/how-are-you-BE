import { relations, sql } from "drizzle-orm";

import { boolean, datetime, int, mysqlTable, primaryKey, text, varchar } from "drizzle-orm/mysql-core";
import type { DateTime } from "src/lib/date";
import { jobs, worries } from "./criteria.entity";
import { questionAnswers } from "./question.entity";

export const externalIdentities = mysqlTable("external_identities", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  userId: int("user_id")
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

export const users = mysqlTable("users", {
  id: int("id").primaryKey().notNull().autoincrement(),
  email: text("email").notNull(),
  createdAt: datetime("created_at", { mode: "string" })
    .notNull()
    .default(sql`(CURRENT_DATE)`),
  lastSignedInAt: datetime("last_signed_in_at", { mode: "string" })
    .notNull()
    .default(sql`(CURRENT_DATE)`),
});

export const usersRelations = relations(users, ({ one, many }) => {
  return {
    externalIdentities: many(externalIdentities),
    questionAnswers: many(questionAnswers),
    profile: one(userProfiles),
    sessions: many(sessions),
  };
});

export const sessions = mysqlTable("sessions", {
  id: int("id").primaryKey().notNull().autoincrement(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  revoked: boolean("revoked").notNull().default(false),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`(CURRENT_DATE)`),
  updatedAt: datetime("updated_at")
    .notNull()
    .default(sql`(CURRENT_DATE)`),
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

export const userProfiles = mysqlTable("user_profiles", {
  id: int("id")
    .primaryKey()
    .references(() => users.id),
  nickname: text("nickname").notNull(),
  birthday: datetime("birthday").notNull().$type<DateTime>(),
  gender: text("gender").$type<"male" | "female">(),
  jobId: int("job_id")
    .notNull()
    .references(() => jobs.id),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`(CURRENT_DATE)`),
  updatedAt: datetime("updated_at")
    .notNull()
    .default(sql`(CURRENT_DATE)`),
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

export const userProfilesToWorries = mysqlTable(
  "user_profiles_worries",
  {
    userProfileId: int("user_profile_id")
      .notNull()
      .references(() => userProfiles.id),
    worryId: int("worry_id")
      .notNull()
      .references(() => worries.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userProfileId, t.worryId] }),
  }),
);

export type CreateUserProfilesToWorries = typeof userProfilesToWorries.$inferInsert;

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
