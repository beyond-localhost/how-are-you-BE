import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { jobs, worries } from "../src/domain/user.entity";
import jobJson from "./jobs.json";
import worryJson from "./worries.json";
import question20240515 from "./question-20240515.json";
import {
  questionDistributions,
  questions,
} from "../src/domain/question.entity";
import { sql } from "drizzle-orm";

export async function runSeed(dbPath = "sqlite.db") {
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { logger: true });

  await db.transaction(async (tx) => {
    await tx.insert(jobs).values(jobJson.jobs);
    await tx.insert(worries).values(worryJson.worries);

    const qs = await tx
      .insert(questions)
      .values(question20240515.questions)
      .returning();

    await tx.insert(questionDistributions).values(
      qs.map((q, index) => {
        return {
          questionId: q.id,
          distributionDate: sql.raw(`date('now', '+${index} day')`),
        };
      })
    );
  });
}
