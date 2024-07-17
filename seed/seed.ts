import { inArray, sql } from "drizzle-orm";
import { jobs, worries } from "../src/domain/criteria.entity";
import { questionDistributions, questions } from "../src/domain/question.entity";
import { type Conn } from "../src/domain/rdb";
import jobJson from "./jobs.json";
import question20240515 from "./question-20240515.json";
import worryJson from "./worries.json";

export async function runSeed(db: Conn) {
  // const db = createDrizzle(createConnection(dbPath));/
  await db.transaction(async (tx) => {
    await tx.insert(jobs).values(jobJson.jobs);
    await tx.insert(worries).values(worryJson.worries);
    const n = await tx.insert(questions).values(question20240515.questions);
    const ids = await tx.insert(questions).values(question20240515.questions).$returningId();
    const qs = await tx
      .select()
      .from(questions)
      .where(
        inArray(
          questions.id,
          ids.map((v) => v.id),
        ),
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
        distributionDate: sql.raw(`DATE_ADD(CURRENT_DATE, INTERVAL ${index + 1} DAY)`),
      };
    });

    await tx.insert(questionDistributions).values(qdList);
  });
}
