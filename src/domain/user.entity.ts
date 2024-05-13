import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

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
  verificationCode: text("verification_code").references(
    () => emailVerificationCodes.code,
    { onDelete: "cascade" }
  ),
});

export const usersRelations = relations(users, ({ one, many }) => {
  return {
    externalIdentities: many(externalIdentities),
    verificationCode: one(emailVerificationCodes, {
      fields: [users.verificationCode],
      references: [emailVerificationCodes.code],
    }),
  };
});

export const emailVerificationCodes = sqliteTable("email_verification_codes", {
  code: text("code").primaryKey().notNull(),
  verifiedAt: text("verified_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const emailVerificationcodesRelations = relations(
  emailVerificationCodes,
  ({ one }) => {
    return {
      user: one(users),
    };
  }
);

export type CreateUserDto = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
