import { sql } from "drizzle-orm";
import { createDrizzle, createSQLite } from "../src/domain/rdb";
import { jobs, worries } from "../src/domain/criteria.entity";
import { questionDistributions, questions } from "../src/domain/question.entity";
import jobJson from "./jobs.json";
import question20240515 from "./question-20240515.json";
import worryJson from "./worries.json";

export async function runSeed(dbPath = "sqlite.db") {
  const db = createDrizzle(createSQLite(dbPath));
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

    const qsLength = qs.length;
    const qdList = Array.from({ length: qsLength * 100 }, (_, index) => {
      const targetQsIndex = index % qs.length;
      const q = qs[targetQsIndex];
      if (!q) {
        throw new Error(`Failed to seed data`);
      }
      return {
        questionId: q.id,
        distributionDate: sql.raw(`date('now', 'localtime', '+${index} day')`),
      };
    });

    const qdList2 = Array.from({ length: qsLength * 100 }, (_, index) => {
      const targetQsIndex = index % qs.length;
      const q = qs[targetQsIndex];
      if (!q) {
        throw new Error(`Failed to seed data`);
      }
      return {
        questionId: q.id,
        distributionDate: sql.raw(`date('now', 'localtime', '-${index} day')`),
      };
    });

    await tx.insert(questionDistributions).values(qdList);
  });
}
