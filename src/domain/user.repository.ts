import { eq, inArray } from "drizzle-orm";
import type { Conn } from "./rdb";
import {
  externalIdentities,
  userProfiles,
  users,
  type CreateExternalIdentity,
  type CreateUserDto,
  type User,
  type UserProfile,
  type CreateUserProfile,
  type CreateUserJob,
  userJobs,
  type Job,
  jobs,
} from "./user.entity";
import { dangerousHead, head } from "../lib/predicate";
import type { DataNotFoundError } from "../core/error";

export const createExternalIdentities = async (
  tx: Conn,
  dto: CreateExternalIdentity
) => tx.insert(externalIdentities).values(dto).returning().then(dangerousHead);

export const findUserByEmail = async (
  conn: Conn,
  email: string
): Promise<User | DataNotFoundError> =>
  conn.select().from(users).where(eq(users.email, email)).then(head);

export const findUserById = async (conn: Conn, id: number) =>
  conn.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      profile: {
        columns: {
          nickname: true,
          dateOfBirthYear: true,
        },
      },
    },
  });

export const findUserByIdOrFail = async (
  conn: Conn,
  id: number
): Promise<User> =>
  conn.select().from(users).where(eq(users.id, id)).then(dangerousHead);

export const findUserByIdOrFailWithProfile = async (conn: Conn, id: number) =>
  conn.query.userProfiles.findFirst({
    columns: {
      createdAt: false,
      updatedAt: false,
    },
    where: eq(userProfiles.id, id),
    with: {
      jobs: {
        columns: {
          jobId: false,
          userId: false,
        },
        with: {
          job: true,
        },
      },
    },
  });
// .select()
// .from(userProfiles)
// .where(eq(userProfiles.id, id))
// .innerJoin(userJobs, eq(userJobs.userId, userProfiles.id))
// .innerJoin(jobs, eq(jobs.id, userJobs.jobId));

export const createUser = async (
  conn: Conn,
  dto: CreateUserDto
): Promise<User> =>
  conn.insert(users).values(dto).returning().then(dangerousHead);

export const createUserProfile = async (tx: Conn, dto: CreateUserProfile) =>
  tx.insert(userProfiles).values(dto).returning().then(dangerousHead);

export const findUserProfileByUserId = async (
  conn: Conn,
  userId: number
): Promise<UserProfile | DataNotFoundError> =>
  conn
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .then(head);

export const createUserJobs = async (tx: Conn, dto: CreateUserJob[]) =>
  tx.insert(userJobs).values(dto).returning();

export const findJobs = async (
  conn: Conn,
  jobIds: Array<Job["id"]>
): Promise<Job[]> => conn.select().from(jobs).where(inArray(jobs.id, jobIds));
