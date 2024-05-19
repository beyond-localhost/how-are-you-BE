import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { questionAnswers } from "./question.entity";

export const externalIdentities = sqliteTable("external_identities", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull(),
  provider: text("provider").notNull().$type<"kakao">(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});
export type CreateExternalIdentity = typeof externalIdentities.$inferInsert;

export const externalIdRelations = relations(externalIdentities, ({ one }) => {
  return {
    users: one(users, {
      fields: [externalIdentities.userId],
      references: [users.id],
    }),
  };
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  lastSignedInAt: text("last_signed_in_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const usersRelations = relations(users, ({ one, many }) => {
  return {
    externalIdentities: many(externalIdentities),
    questionAnswers: many(questionAnswers),
    profile: one(userProfiles),
    verificationCode: one(emailVerificationCodes),
  };
});

export const emailVerificationCodes = sqliteTable("email_verification_codes", {
  code: text("code").primaryKey().notNull(),
  verifiedAt: text("verified_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const emailVerificationcodesRelations = relations(
  emailVerificationCodes,
  ({ one }) => {
    return {
      user: one(users, {
        fields: [emailVerificationCodes.userId],
        references: [users.id],
      }),
    };
  }
);

export const userProfiles = sqliteTable("user_profiles", {
  id: integer("id")
    .primaryKey()
    .references(() => users.id),
  nickname: text("nickname").notNull().unique(),
  dateOfBirthYear: integer("date_of_birth_year").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});
export type UserProfile = typeof userProfiles.$inferSelect;
export type CreateUserProfile = typeof userProfiles.$inferInsert;

export const userProfilesRelations = relations(
  userProfiles,
  ({ many, one }) => {
    return {
      jobs: many(userJobs),
      user: one(users, {
        fields: [userProfiles.id],
        references: [users.id],
      }),
    };
  }
);

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  job: text("job").notNull().unique(),
});

export type Job = typeof jobs.$inferSelect;

export const jobsRelations = relations(jobs, ({ many }) => {
  return {
    users: many(userJobs),
  };
});

export const userJobs = sqliteTable(
  "user_profile_jobs",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => userProfiles.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (t) => {
    return {
      pk: primaryKey({ columns: [t.jobId, t.userId] }),
    };
  }
);

export const userJobsRelations = relations(userJobs, ({ one }) => {
  return {
    user: one(userProfiles, {
      fields: [userJobs.userId],
      references: [userProfiles.id],
    }),
    job: one(jobs, {
      fields: [userJobs.jobId],
      references: [jobs.id],
    }),
  };
});

export type CreateUserJob = typeof userJobs.$inferInsert;

export type CreateUserDto = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
