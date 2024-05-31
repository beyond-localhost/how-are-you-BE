import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { userProfiles, userProfilesToWorries, users } from "./user.entity";

export const worries = sqliteTable("worries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  worry: text("worry").notNull().unique(),
});
export type Worry = typeof worries.$inferSelect;
export const worriesRelations = relations(worries, ({ many }) => ({
  userProfilesToWorries: many(userProfilesToWorries),
}));

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  job: text("job").notNull().unique(),
});

export const jobsRelations = relations(jobs, ({ many }) => ({
  userProfiles: many(userProfiles),
}));

export type Job = typeof jobs.$inferSelect;
