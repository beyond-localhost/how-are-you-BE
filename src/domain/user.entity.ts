import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { questionAnswers } from "./question.entity";
import { jobs, worries } from "./criteria.entity";

export const externalIdentities = sqliteTable("external_identities", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  email: text("email").notNull(),
  provider: text("provider").notNull().$type<"kakao">(),
});
export type CreateExternalIdentity = typeof externalIdentities.$inferInsert;

export const externalIdentitiesRelations = relations(
  externalIdentities,
  ({ one }) => {
    return {
      users: one(users, {
        fields: [externalIdentities.userId],
        references: [users.id],
      }),
    };
  }
);

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
  };
});

export const userProfiles = sqliteTable("user_profiles", {
  id: integer("id")
    .primaryKey()
    .references(() => users.id),
  nickname: text("nickname").notNull(),
  dateOfBirthYear: integer("date_of_birth_year").notNull(),
  jobId: integer("job_id")
    .notNull()
    .references(() => jobs.id),
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
  ({ one, many }) => {
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
  }
);

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
  })
);

export const userProfilesToWorriesRelations = relations(
  userProfilesToWorries,
  ({ one }) => ({
    userProfile: one(userProfiles, {
      fields: [userProfilesToWorries.userProfileId],
      references: [userProfiles.id],
    }),
    worry: one(worries, {
      fields: [userProfilesToWorries.worryId],
      references: [worries.id],
    }),
  })
);

export type CreateUserDto = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
