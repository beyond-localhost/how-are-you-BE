import { inArray } from "drizzle-orm";
import { jobs, worries, type Job, type Worry } from "./criteria.entity";
import type { Conn } from "./rdb";

export const findAllJobs = async (conn: Conn): Promise<Job[]> =>
  conn.select().from(jobs);

export const findAllWorries = async (conn: Conn): Promise<Worry[]> =>
  conn.select().from(worries);

export const findJobByIds = async (
  conn: Conn,
  jobIds: Array<Job["id"]>
): Promise<Job[]> => conn.select().from(jobs).where(inArray(jobs.id, jobIds));
