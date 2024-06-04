import { eq, inArray } from "drizzle-orm";
import type { DataNotFoundError } from "../core/error";
import { dangerousHead, head } from "../lib/predicate";
import { jobs, worries, type Job, type Worry } from "./criteria.entity";
import type { Conn } from "./rdb";
import {
  externalIdentities,
  sessions,
  userProfiles,
  users,
  type CreateExternalIdentity,
  type CreateSessionDto,
  type CreateUserDto,
  type CreateUserProfileDto,
  type ExternalIdentity,
  type User,
  type UserProfile,
} from "./user.entity";

export const findExternalIdentityWithUserById = async (
  conn: Conn,
  id: string
): Promise<(ExternalIdentity & { users: User }) | undefined> =>
  conn.query.externalIdentities.findFirst({
    where: eq(externalIdentities.id, id),
    with: {
      users: true,
    },
  });

export const createExternalIdentities = async (
  tx: Conn,
  dto: CreateExternalIdentity
) => tx.insert(externalIdentities).values(dto).returning().then(dangerousHead);

export const findUserByIdOrFail = async (
  conn: Conn,
  id: number
): Promise<User> =>
  conn.select().from(users).where(eq(users.id, id)).then(dangerousHead);

export const findUserBySessionId = async (conn: Conn, sessionId: number) =>
  conn.query.users.findFirst({
    with: {
      profile: {
        with: {
          job: true,
          userProfilesToWorries: {
            with: {
              worry: true,
            },
          },
        },
      },
      sessions: {
        where: eq(sessions.id, sessionId),
      },
    },
  });
export const createUser = async (
  conn: Conn,
  dto: CreateUserDto
): Promise<User> =>
  conn.insert(users).values(dto).returning().then(dangerousHead);

export const createSession = async (tx: Conn, dto: CreateSessionDto) =>
  tx.insert(sessions).values(dto).returning().then(dangerousHead);

export const createUserProfile = async (tx: Conn, dto: CreateUserProfileDto) =>
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
