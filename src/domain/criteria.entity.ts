import { relations } from "drizzle-orm";

import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";
import { userProfiles, userProfilesToWorries } from "./user.entity";

export const worries = mysqlTable("worries", {
  id: int("id").primaryKey().notNull().autoincrement(),
  worry: varchar("worry", { length: 20 }).notNull().unique(),
});
export type Worry = typeof worries.$inferSelect;

export const worriesRelations = relations(worries, ({ many }) => ({
  userProfilesToWorries: many(userProfilesToWorries),
}));

export const jobs = mysqlTable("jobs", {
  id: int("id").primaryKey().notNull().autoincrement(),
  job: varchar("job", { length: 20 }).notNull().unique(),
});

export const jobsRelations = relations(jobs, ({ many }) => ({
  userProfiles: many(userProfiles),
}));

export type Job = typeof jobs.$inferSelect;
