import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const worries = sqliteTable("worries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  worry: text("worry").notNull().unique(),
});
export type Worry = typeof worries.$inferSelect;

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  job: text("job").notNull().unique(),
});

export type Job = typeof jobs.$inferSelect;
