import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { jobs } from "../src/domain/user.entity";
import jobJson from "./jobs.json";
import question20240515 from "./question-20240515.json";
import { questions } from "../src/domain/question.entity";

export async function runSeed(dbPath = "sqlite.db") {
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  await db.insert(jobs).values(jobJson.jobs);

  await db.insert(questions).values(question20240515.questions);
}
