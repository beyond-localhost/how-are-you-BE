import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

import { sql } from "drizzle-orm";
import { jobs, worries } from "../src/domain/criteria.entity";
import { questionDistributions, questions } from "../src/domain/question.entity";
import jobJson from "./jobs.json";
import question20240515 from "./question-20240515.json";
import worryJson from "./worries.json";

export async function runSeed(dbPath = "sqlite.db") {
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { logger: true });

  await db.transaction(async (tx) => {
    await tx.insert(jobs).values(jobJson.jobs);
    await tx.insert(worries).values(worryJson.worries);

    const qs = await tx
      .insert(questions)
      .values(question20240515.questions)
      .returning()
      .then((v) =>
        v.reduce<{ id: number; question: string; createdAt: string; updatedAt: string }[]>((acc, __, _, arr) => {
          acc.push(...arr);
          return acc;
        }, []),
      );

    await tx.insert(questionDistributions).values(
      qs.map((q, index) => {
        return {
          questionId: q.id,
          distributionDate: sql.raw(`date('now', 'localtime', '-${index} day')`),
        };
      }),
    );
  });
}
