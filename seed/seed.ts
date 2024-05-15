import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { jobs } from "../src/domain/user.entity";
import jobJson from "./jobs.json";

export async function runSeed(dbPath = "sqlite.db") {
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  await db
    .insert(jobs)
    .values(jobJson.jobs)
    .onConflictDoNothing({ target: jobs.job });
}
