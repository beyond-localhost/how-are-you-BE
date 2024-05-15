import type { Conn } from "./rdb";

import { questionDistributions } from "./question.entity";
import { eq, sql } from "drizzle-orm";

export const findTodayQuestion = async (conn: Conn) =>
  conn.query.questionDistributions.findFirst({
    where: eq(questionDistributions.distributionDate, sql`(CURRENT_DATE)`),
    with: {
      question: true,
    },
  });
